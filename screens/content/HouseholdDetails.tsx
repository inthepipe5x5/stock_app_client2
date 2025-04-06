import { useEffect } from "react";
import { HStack } from "@/components/ui/hstack";
import DashboardLayout from "../_layout";
import MemberActionCards from "../(tabs)/newsfeed/MemberActionCards";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchUserAndHouseholds } from "@/lib/supabase/session";
import { VStack } from "@/components/ui/vstack";
import { ResourceContentTemplate } from "@/screens/content/ResourceDetail";
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
import { user_households } from "@/constants/defaultSession";
type HouseHoldDetailsParams = {
    householdData: { [key: string]: any },
    current_user: any,
    props: any
}

export const householdMemberAccordion = (members: { [key: string]: any }[] | user_households[]) => {
    const keysToInclude = ["name", "description", "role", "invite_expires_at", "created_at"];

    //filteredMembers are truthy member objects and have all included keys
    const filteredMembers = members.filter(member => {
        return Object.keys(member.every(item as { [key: string]: any } => { keysToInclude.includes(item) || !keysToExclude.includes(item) })
    });
    }

return members.map((member, index) => (
    !!member ? (<AccordionItem key={index} value={`item-${index}`}>
        <AccordionHeader>
            <HStack className="justify-between items-center">
                <AccordionTrigger className="flex-grow">
                    <AccordionTitleText>{member.name}</AccordionTitleText>
                </AccordionTrigger>
                <AccordionIcon />
            </HStack>
        </AccordionHeader>
        <AccordionContent className="p-4">
            {/* <AccordionContentText>{member.description}</AccordionContentText> */}
            {
                Object.keys(member).length > 0 ?
                    <MemberActionCards
                        memberData={member as user_households}
                        editAccess={member.role}
                        onEditPress={() => console.log("Edit button pressed")}
                    />
                }
        </AccordionContent>
    </AccordionItem>) : null
));

}

export const HouseHoldDetails = ({ householdData, ...props }: HouseHoldDetailsParams) => {

    console.log("HouseHoldDetails: ", householdData, props);
    const router = useRouter();
    const params = useLocalSearchParams();
    const householdId = params?.household_id[0] ?? householdData?.household_id ?? null;

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