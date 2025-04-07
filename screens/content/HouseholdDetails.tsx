import { useEffect, useState } from "react";
import { HStack } from "@/components/ui/hstack";
import DashboardLayout from "../_layout";
import MemberActionCards from "../(tabs)/newsfeed/MemberActionCards";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchUserAndHouseholds, fetchUserHouseholdRelations } from "@/lib/supabase/session";
import { VStack } from "@/components/ui/vstack";
import { ResourceContentTemplate } from "@/screens/content/ResourceDetail";
import { UserHouseholdHelper } from "@/lib/supabase/ResourceHelper";
import { createHouseholdWithInventories, getHouseholdAndInventoryTemplates } from "@/lib/supabase/register";
import { useQuery } from "@tanstack/react-query";
import {
    Accordion,
    AccordionItem,
    AccordionHeader,
    AccordionTrigger,
    AccordionTitleText,
    AccordionContent,
    AccordionContentText,
    AccordionIcon,
} from "@/components/ui/accordion"
import defaultSession, { access_level, user_households } from "@/constants/defaultSession";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import { set } from "react-hook-form";
type HouseHoldDetailsParams = {
    householdData: { [key: string]: any },
    current_user: any,
    props: any
}

export const householdMemberAccordion = (members: {
    role: access_level,
    user_id: string,
    user_name: string,
}[]) => {

    return members && members.length > 0 ? (
        members.map((member, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
                <AccordionHeader>
                    <HStack className="justify-between items-center">
                        <AccordionTrigger className="flex-grow">
                            <AccordionTitleText>{member.user_name}</AccordionTitleText>
                        </AccordionTrigger>
                        <AccordionIcon />
                    </HStack>
                </AccordionHeader>
                <AccordionContent className="p-4">
                    {
                        member ? (
                            <MemberActionCards
                                memberData={member as unknown as user_households}
                                editAccess={member.role}
                                onEditPress={() => console.log("Edit button pressed")}
                            />
                        ) : null
                    }
                </AccordionContent>
            </AccordionItem>
        ))
    ) : null;
}

export const HouseHoldDetails = (props?: Partial<HouseHoldDetailsParams> | null | undefined) => {
    const globalContext = useUserSession();
    const router = useRouter();
    const params = useLocalSearchParams<{
        household_id: string[],
        current_user_id: string[],
        [userId: string]: access_level[] | string[] // UUID string as key, access_level[] or string[] as value
    }>();
    const { state } = globalContext || defaultSession;
    const householdId = params?.household_id[0] ?? state?.households?.[0] ?? null;
    const currentUser = params?.current_user_id[0] ?? state?.user ?? null;

    const [householdData, setHouseholdData] = useState<Partial<user_households> | null>(null);
    const [currentUserAccess, setCurrentUserAccess] = useState<access_level | null>(null);
    const [householdMembers, setHouseholdMembers] = useState<user_households[] | null>(null);

    //effect to set the current user access level
    useEffect(() => {
        //set access level if passed in as params
        if (params?.[currentUser as string]?.length) {
            setCurrentUserAccess(params?.[currentUser as string][0] as access_level);
        }
        if (!!!householdData && !!householdId) {
            setHouseholdData({ id: householdId } as unknown as user_households);
        }
    }, [params, currentUserAccess]);

    const userHouseholds = useQuery({
        queryKey: ['userHouseholds', householdId],
        queryFn: async () => {
            try {

                const householdMembers = await fetchUserHouseholdRelations({
                    user_id: currentUser as string,
                    household_id: householdId as string,
                })
                console.log("UserHouseholds: ", householdMembers);
                console.assert({ householdMembers }, "householdMembers is null or undefined");
                if (!!householdMembers && householdMembers.length > 0) {
                    setHouseholdMembers(householdMembers as unknown as user_households[]);


                    setHouseholdData(householdMembers?.[0]?.household_id as unknown as user_households);
                }
            }
            catch (error) {
                console.error("Error fetching user households: ", error);
                setHouseholdData(null);
                setCurrentUserAccess(null);

            }
        },
        refetchInterval: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: true,
        enabled: !!householdId,
    });

    useEffect(() => {
        console.log("HouseholdId: ", householdId);
        if (!!!householdId) {
            return router.replace('/+not-found?message=Household not found');
        }
    })



    return (
        <DashboardLayout>
            <VStack className="justify-center align-center">
                {/* {householdData.data ? MemberActionCards()

                ): null

                } */}
            </VStack>
        </DashboardLayout>
    );
}