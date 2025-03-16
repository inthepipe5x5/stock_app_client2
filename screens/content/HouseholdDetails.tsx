import { HStack } from "@/components/ui/hstack";
import {useQuery} from "@tanstack/react-query"
import DashboardLayout from "../_layout";
import MemberActionCards from "../(tabs)/newsfeed/MemberActionCards";
import { useLocalSearchParams } from "expo-router";
import { fetchUserAndHouseholds } from "@/lib/supabase/session";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import { VStack } from "@/components/ui/vstack";

type HouseHoldDetailsParams = {
    householdId: string,
    props: any
}
const HouseHoldDetails = ({householdId, ...props}: HouseHoldDetailsParams) => {
    const {state, dispatch} = useUserSession();

    const params = useLocalSearchParams();
    const {userId} = params;

    const currentUser = useQuery({
        queryFn: fetchUserAndHouseholds({user_id: userId[0]}),
        enabled: !!householdId,
    })

    if (currentUser.data) {

    }
 
    return (
        <DashboardLayout>
            <VStack className="justify-center align-center">
                {householdData.data ? MemberActionCards()

                ): null

                }
            </VStack>
        </DashboardLayout>
    );
}