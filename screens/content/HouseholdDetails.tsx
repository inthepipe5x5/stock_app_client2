import { HStack } from "@/components/ui/hstack";
import DashboardLayout from "../_layout";
import MemberActionCards from "../(tabs)/newsfeed/MemberActionCards";
import { useLocalSearchParams } from "expo-router";
import { fetchUserAndHouseholds } from "@/lib/supabase/session";
import { VStack } from "@/components/ui/vstack";

type HouseHoldDetailsParams = {
    householdData: { [key: string]: any },
    current_user: any,
    props: any
}
export const HouseHoldDetails = ({ householdData, ...props }: HouseHoldDetailsParams) => {

    console.log("HouseHoldDetails: ", householdData, props);

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