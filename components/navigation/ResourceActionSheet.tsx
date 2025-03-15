import React from "react";
import { Actionsheet, ActionsheetContent, ActionsheetItem, ActionsheetItemText, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper, ActionsheetBackdrop, ActionsheetIcon } from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { ClockIcon, DownloadIcon, EditIcon, EyeOffIcon, TrashIcon } from "@/components/ui/icon";
import { useRouter } from "expo-router";
import { pluralizeStr, singularizeStr } from "@/utils/pluralizeStr";
import { capitalize } from "@/utils/capitalizeSnakeCaseInputName";
import { task, userProfile, product, access_level, household, inventory, vendor, draft_status, user_households } from "@/constants/defaultSession";
import { DeleteIcon, HousePlus, UserMinus, UserPenIcon, Warehouse } from "lucide-react-native";
import { isInvitationExpired } from "@/utils/isExpired";
import { fetchSpecificUserHousehold } from "@/lib/supabase/session";
import { useQuery } from "@tanstack/react-query";

export type ResourceType = "profile" | "product" | "inventory" | "task" | "vendor";
export type actionType = "create" | "read" | "update" | "delete";
export type userPermissions = actionType[];
// export type userRole = access_level; // Removed as it is not used
export type limitations = "none" | "own" | "household" | "invite";
export type actionLimitations = { [key in actionType]: limitations };

export type ResourceActionSheetProps = {
    data: userProfile | task | product | inventory | vendor | household | any;
    resourceType: ResourceType;
    userPermissions: userPermissions;
}

/*admins can create, read, update, and delete on all resources in all households
*managers can create, read, update, and delete on all resources in their household
*members can create, read, update, and delete on their own resources in their household
*guests can read household details and are restricted from drafts regardless of invite, ownership, or household status
* 
*/
export type permissionsObject = {
    role: access_level;
    userPermissions: actionType[] | null;
    actionLimitations: actionLimitations;
    draftRestrictions: Omit<limitations, "invite" & "all">;
}

//assuming the resource is already confirmed to be in a household
export const createPermissionsObject = (
    resource: { type: ResourceType, data: userProfile | task | product | inventory | vendor | household },
    user_households: user_households,
): permissionsObject | null => {
    const noPermissions = {
        role: "guest",
        userPermissions: ["read"],
        actionLimitations: null,
        draftRestrictions: "all",
    }
    if (!user_households) return null;

    const { access_level: userRole, household_id, invite_accepted, invited_at, user_id } = user_households;
    const isGuest = userRole === "guest";

    //handle expired invites
    if (isGuest && !invite_accepted || isInvitationExpired(invited_at, 7)) return null;
    else if (isGuest && !invite_accepted && !isInvitationExpired(invited_at)) return {
        role: "guest",
        userPermissions: ["read"],
        actionLimitations: {
            create: "none",
            read: "none",
            update: "none",
            delete: "none",
        },
        draftRestrictions: "all", //guests can't see drafts
    }
    //determine ownership
    let isOwner = ["admin", "manager"].includes(userRole)

    //check if the member user is owner of the resource
    if (!isOwner && userRole === "member") {
        //check if user is owner of the resource
        if (["task", "product", "vendor"].includes(resource.type)) {
            isOwner = Object.values(resource.data).flat().includes(user_id);
        }
        isOwner = resource.type === "profile" ? (resource.data as userProfile).user_id === user_id : isOwner;
    }

    const rolePermissions = {
        admin: ["create", "read", "update", "delete"],
        manager: ["create", "read", "update", "delete"],
        member: ["create", "read", "update", "delete"],
        guest: ["read"],
    }[userRole];

    const roleLimitations = {
        admin: "none",
        manager: "household",
        member: "own",
        guest: "invite",
    }[userRole];

    const draftLimitations = {
        admin: "none",
        manager: "household",
        member: "own",
        guest: "all",
    }[userRole];


    const output = {
        role: userRole,
        userPermissions: rolePermissions,
        actionLimitations: roleLimitations,
        draftRestrictions: draftLimitations
    };

    return output;
};

export const HouseHoldActions = (props: { data: Partial<household>; handleClose: () => void; permissions: permissionsObject, children: { [key in ResourceType]: (props: any) => JSX.Element } }) => {
    const { data: householdData, ...householdActionProps } = props;

    return (
        <>
            <ActionsheetItem onPress={props.handleClose}>
                <ActionsheetIcon className="stroke-background-700" as={HousePlus} />
                <ActionsheetItemText>Join Household</ActionsheetItemText>
            </ActionsheetItem>
            <ActionsheetItem onPress={props.handleClose}>
                <ActionsheetIcon className="stroke-background-700" as={Warehouse} />
                <ActionsheetItemText>Modify Household</ActionsheetItemText>
            </ActionsheetItem>
            <ActionsheetItem onPress={props.handleClose}>
                <ActionsheetIcon className="stroke-background-700" as={UserPenIcon} />
                <ActionsheetItemText>Manage Household Members</ActionsheetItemText>
            </ActionsheetItem>
            <ActionsheetItem onPress={props.handleClose}>
                <ActionsheetIcon className="stroke-background-700" as={UserMinus} />
                <ActionsheetItemText>Leave Household</ActionsheetItemText>
            </ActionsheetItem>
        </>
    )
}

export const TaskActions = (props: { data: Partial<task>; handleClose: () => void }) => {
    const { data: taskData, ...taskActionProps } = props;

    return (
        <>
            <ActionsheetItem onPress={props.handleClose}>
                <ActionsheetIcon className="stroke-background-700" as={EyeOffIcon} />
                <ActionsheetItemText>Mark Unread</ActionsheetItemText>
            </ActionsheetItem>
            <ActionsheetItem onPress={props.handleClose}>
                <ActionsheetIcon className="stroke-background-700" as={ClockIcon} />
                <ActionsheetItemText>Remind Me</ActionsheetItemText>
            </ActionsheetItem>
        </>
    )
}


export function ResourceActionSheetWrapper(props: any) {
    const [showActionsheet, setShowActionsheet] = React.useState(false);
    const [selectedAction, setSelectedAction] = React.useState<string | null>(null);
    const router = useRouter();
    const { data: resourceData, resourceType, userPermissions, ...resourceActionProps } = props;

    const handleClose = (actionType?: actionType) => {
        setShowActionsheet(false);
        router.push({ pathname: "/(tabs)/(dashboard)/(stacks)/[type].[id].[action]", params: { type: resourceType, id: resourceData.id, action: actionType } });
    }

    //move this the screen level

    const resourceLabel = capitalize(pluralizeStr(resourceType ?? "household"));
    return (
        <>
            <Button onPress={() => setShowActionsheet(true)}>
                <ButtonText>Open</ButtonText>
            </Button>
            <Actionsheet isOpen={showActionsheet} onClose={handleClose}>
                <ActionsheetBackdrop />
                <ActionsheetContent>
                    <ActionsheetDragIndicatorWrapper>
                        <ActionsheetDragIndicator />
                    </ActionsheetDragIndicatorWrapper>
                    {["product", "inventory"].includes(resourceType) ? (<ActionsheetItem onPress={() => handleClose("create")}>
                        <ActionsheetIcon className="stroke-background-700" as={DownloadIcon} />
                        <ActionsheetItemText>Save Copy to Your {`${capitalize(pluralizeStr(resourceType ?? "household"))}`}</ActionsheetItemText>
                    </ActionsheetItem>) : null}
                    <ActionsheetItem onPress={() => handleClose("read")}>
                        <ActionsheetIcon className="stroke-background-700" as={EditIcon} />
                        <ActionsheetItemText>View {resourceLabel} Details</ActionsheetItemText>
                    </ActionsheetItem>
                    {/* {
                        resourceSpecificActions ? resourceSpecificActions[resourceType as ResourceType]({ data: resourceData, handleClose }) : null
                    } */}
                    {
                        props.children
                    }
                    <ActionsheetItem onPress={() => handleClose("update")}>
                        <ActionsheetIcon className="stroke-background-700" as={EditIcon} />
                        <ActionsheetItemText>Edit {resourceLabel}</ActionsheetItemText>
                    </ActionsheetItem>
                    <ActionsheetItem isDisabled onPress={() => handleClose("delete")}>
                        <ActionsheetIcon className="stroke-background-700" as={TrashIcon} />
                        <ActionsheetItemText>Delete {resourceLabel}</ActionsheetItemText>
                    </ActionsheetItem>
                </ActionsheetContent>
            </Actionsheet>
        </>
    );
}