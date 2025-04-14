import React from "react";
import { Actionsheet, ActionsheetContent, ActionsheetItem, ActionsheetItemText, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper, ActionsheetBackdrop, ActionsheetIcon } from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { ClockIcon, DownloadIcon, EditIcon, EyeOffIcon, TrashIcon } from "@/components/ui/icon";
import { RelativePathString, router, useRouter } from "expo-router";
import { pluralizeStr, singularizeStr } from "@/utils/pluralizeStr";
import { capitalize } from "@/utils/capitalizeSnakeCaseInputName";
import { task, userProfile, product, access_level, household, inventory, vendor, draft_status, user_households } from "@/constants/defaultSession";
import { CalendarClock, CheckCheck, DeleteIcon, HousePlus, MessageCirclePlusIcon, UserMinus, UserPenIcon, Warehouse } from "lucide-react-native";
import { isInvitationExpired } from "@/utils/isExpired";
import { fetchSpecificUserHousehold } from "@/lib/supabase/session";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "../ui/spinner";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import supabase from "@/lib/supabase/supabase";

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
        userPermissions: rolePermissions as actionType[],
        actionLimitations: roleLimitations,
        draftRestrictions: draftLimitations
    };

    return output;
};

export const HouseHoldActions = (props: {
    data: Partial<household>;
    handleClose: (args: any) => void;
    permissions: permissionsObject,
    children: { [key in ResourceType]: (props: any) => JSX.Element }
}) => {
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

export const TaskActions = (props: {
    data: Partial<task>;
    handleClose: (args: any) => void
    handleEdit: (args: any) => void
    handleDelete?: (args: any) => void
    handleReschedule?: (args: any) => void
    handleShare?: (args: any) => void
    handleRepeat?: (args: any) => void
    handleComplete?: (args: any) => void
}) => {
    const { data: taskData, ...taskActionProps } = props;
    const [loading, setLoading] = React.useState(false);

    const modifyTask = async (
        taskData: any,
        household_id: string,
        modifyType: "delete" | "update" | "complete" | 'reschedule' = 'update',
    ) => {
        let uploadedTaskData = { ...taskData };
        switch (modifyType) {
            // case 'delete':
            //     await deleteTask(taskData, household_id);
            //     break;
            case 'update':

                break;
            case 'complete':
                uploadedTaskData = {
                    ...taskData,
                    completion_status: "completed",
                    completed_at: new Date().toISOString(),
                };
                break;
            default:
                break;
        }

        const { data, error } = await supabase.from('tasks')
            .upsert(uploadedTaskData, {
                onConflict: 'task_id',
            })
            .select('*')
            .single();
        if (error) {
            console.error("Error completing task", error);
            throw new Error(error.message);
        }
        console.log("Task completed", data);
        router.replace({
            pathname: '/(tabs)/households/[household_id]/tasks/[task_id]/complete' as RelativePathString,
            params: {
                task_id: taskData?.task_id,
                household_id,
            },
        })
    }

    return (
        <>
            <ActionsheetItem onPress={props?.handleShare ?? props.handleClose}>
                {!loading ? <ActionsheetIcon className="stroke-background-700" as={EyeOffIcon} /> : <Spinner size={'large'} />}
                <ActionsheetItemText className={cn('ml-auto px-2', loading ? 'text-info-300' : 'text-typography-500')}>Share Task</ActionsheetItemText>
            </ActionsheetItem>
            <ActionsheetItem onPress={props?.handleRepeat ?? props.handleClose}>
                {!loading ? <ActionsheetIcon className="stroke-background-700" as={ClockIcon} /> : <Spinner size={'large'} />}
                <ActionsheetItemText className={cn('ml-auto px-2', loading ? 'text-info-300' : 'text-typography-500')}>Remind Me</ActionsheetItemText>
            </ActionsheetItem>
            <ActionsheetItem onPress={props?.handleDelete ?? props.handleClose}>
                {!loading ? <ActionsheetIcon className="stroke-background-700" as={TrashIcon} /> : <Spinner size={'large'} />}
                <ActionsheetItemText className={cn('ml-auto px-2', loading ? 'text-info-300' : 'text-typography-500')}>Delete Task</ActionsheetItemText>
            </ActionsheetItem>
            {!!props?.data && props?.data?.completion_status !== 'completed' ?
                (<ActionsheetItem onPress={props?.handleComplete ?? props.handleClose}>
                    {!loading ? <ActionsheetIcon className="stroke-background-700" as={CheckCheck} /> : <Spinner size={'large'} />}
                    <ActionsheetItemText className={cn('ml-auto px-2', loading ? 'text-info-300' : 'text-typography-500')}>Delete Task</ActionsheetItemText>
                </ActionsheetItem>)
                : null
            }
            <ActionsheetItem onPress={props?.handleEdit ?? props.handleClose}>
                {!loading ? <ActionsheetIcon className="stroke-background-700" as={EditIcon} /> : <Spinner size={'large'} />}
                <ActionsheetItemText className={cn('ml-auto px-2', loading ? 'text-info-300' : 'text-typography-500')}>Edit Task</ActionsheetItemText>
            </ActionsheetItem>
            <ActionsheetItem onPress={props?.handleReschedule ?? props.handleClose}>
                {!loading ? <ActionsheetIcon className="stroke-background-700" as={CalendarClock} /> : <Spinner size={'large'} />}
                <ActionsheetItemText className={cn('ml-auto px-2', loading ? 'text-info-300' : 'text-typography-500')}>Reschedule</ActionsheetItemText>
            </ActionsheetItem>
            <ActionsheetItem onPress={props?.handleDelete ?? props.handleClose}>
                {!loading ? <ActionsheetIcon className="stroke-error-700" as={DeleteIcon} /> : <Spinner size={'large'} />}
                <ActionsheetItemText className={cn('ml-auto px-2', loading ? 'text-info-300' : 'text-typography-500')}>Delete Task</ActionsheetItemText>
            </ActionsheetItem>
        </>
    )
}

export const ProductActions = (props: {
    data: Partial<product>;
    handleClose: (args: any) => void
}) => {
    const { data: productData, ...productActionProps } = props;

    return (
        <>
            <ActionsheetItem onPress={props.handleClose}>
                <ActionsheetIcon className="stroke-background-700" as={DownloadIcon} />
                <ActionsheetItemText>Save Copy to Your Inventory</ActionsheetItemText>
            </ActionsheetItem>
            <ActionsheetItem onPress={props.handleClose}>
                <ActionsheetIcon className="stroke-background-700" as={MessageCirclePlusIcon} />
                <ActionsheetItemText>Create a task</ActionsheetItemText>
            </ActionsheetItem>
            <ActionsheetItem onPress={props.handleClose}>
                <ActionsheetIcon className="stroke-background-700" as={EditIcon} />
                <ActionsheetItemText>Edit Product</ActionsheetItemText>
            </ActionsheetItem>
            <ActionsheetItem onPress={props.handleClose}>
                <ActionsheetIcon className="stroke-error-700" as={TrashIcon} />
                <ActionsheetItemText>Delete Product</ActionsheetItemText>
            </ActionsheetItem>
        </>
    )
}

export const ProductTaskActions = (props: { data: Partial<task>; handleClose: (args: any) => void }) => {
    const { data: productData, ...ProductTaskActionProps } = props;

    return (
        <>
            <ActionsheetItem onPress={props.handleClose}>
                <ActionsheetIcon className="stroke-background-700" as={DownloadIcon} />
                <ActionsheetItemText>Save Copy to Your Inventory</ActionsheetItemText>
            </ActionsheetItem>
            <ActionsheetItem onPress={props.handleClose}>
                <ActionsheetIcon className="stroke-background-700" as={MessageCirclePlusIcon} />
                <ActionsheetItemText>Create a task</ActionsheetItemText>
            </ActionsheetItem>
            <ActionsheetItem onPress={props.handleClose}>
                <ActionsheetIcon className="stroke-background-700" as={TrashIcon} />
                <ActionsheetItemText>Delete Product</ActionsheetItemText>
            </ActionsheetItem>
        </>
    )
}

export function ResourceActionSheetWrapper(props: {
    data: userProfile | task | product | inventory | vendor | household | any;
    resourceType: ResourceType;
    userPermissions: userPermissions;
    children?: React.ReactNode;
    resourceSpecificActions?: { [key in ResourceType]: (props: any) => JSX.Element };
    showActionSheet?: boolean;
    setShowActionSheet?: (show: boolean) => void;
}) {
    const [selectedAction, setSelectedAction] = React.useState<string | null>(null);
    const router = useRouter();
    const { data: resourceData, resourceType, userPermissions, ...resourceActionProps } = props;

    const handleClose = (actionType?: actionType) => {
        if (!!props?.setShowActionSheet) props?.setShowActionSheet(false);
        router.push({
            pathname: "/(tabs)/(dashboard)/(stacks)/[type].[id].[action]",
            params: {
                type: resourceType,
                id: resourceData.id,
                action: actionType
            }
        });
    }

    //move this the screen level

    const resourceLabel = capitalize(pluralizeStr(resourceType ?? "household"));
    return (
        <>
            <Button onPress={() => { if (!!props?.setShowActionSheet) props?.setShowActionSheet(true) }}>
                <ButtonText>Open</ButtonText>
            </Button>
            <Actionsheet
                isOpen={props?.showActionSheet}
                onClose={handleClose}>
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