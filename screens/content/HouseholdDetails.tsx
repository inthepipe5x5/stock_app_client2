import { useEffect, useState } from "react";
import { HStack } from "@/components/ui/hstack";
import DashboardLayout from "../_layout";
import MemberActionCards, { HouseholdMemberList } from "@/screens/(tabs)/newsfeed/MemberActionCards";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchUserHouseholdsByUser, fetchUserHouseholdProfiles } from "@/lib/supabase/session";
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
import supabase from "@/lib/supabase/supabase";
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
                    {/* {
                        member ? (
                            <MemberActionCards
                                memberData={member as unknown as user_households}
                                editAccess={member.role}
                                onEditPress={() => console.log("Edit button pressed")}
                            />
                        ) : null
                    } */}
                </AccordionContent>
            </AccordionItem>
        ))
    ) : null;
}
/**
 * This component represents the household details page in the application.
 * It is an Expo route that dynamically handles household data based on the provided ID.
 *
 * @remarks
 * - The route expects a `household ID` as a parameter.
 * - If no `household ID` is provided, the user will be redirected to an appropriate page.
 *
 * @module HouseholdDetails
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.id - The unique identifier for the household.
 */
/**
 * *
 * 
//  */
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

    // const [householdData, setHouseholdData] = useState<Partial<user_households> | null>(null);
    // const [currentUserAccess, setCurrentUserAccess] = useState<access_level | null>(null);
    // const [householdMembers, setHouseholdMembers] = useState<user_households[] | null>(null);


    const prefetchedData = useQuery({
        queryKey: ['households', { user_id: currentUser }]
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