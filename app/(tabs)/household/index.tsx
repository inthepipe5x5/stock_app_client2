

import { useEffect, useRef } from "react";
import { HouseHoldDetails } from "@/screens/content/HouseholdDetails";
import { RelativePathString, useLocalSearchParams, useRouter } from "expo-router";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import { useQuery } from "@tanstack/react-query"
import supabase from "@/lib/supabase/supabase";
import { UserHouseholdHelper } from "@/lib/supabase/ResourceHelper";
import { current } from "tailwindcss/colors";
import { fetchSpecificUserHousehold } from "@/lib/supabase/session";
import { getSupabaseAuthStatus } from "@/lib/supabase/auth";

import HouseholdsList from "@/screens/content/households/HouseholdsList";
export default function HouseholdsListRoute() {
    return <HouseholdsList />;
}

// export default () => {
//     const globalContext = useUserSession();
//     const params = useLocalSearchParams();
//     const router = useRouter();
//     const householdIdRef = useRef<string | null>(null);

//     useEffect(() => {
//         // Check if the user is authenticated and has a valid session
//         const authStatus = async () => getSupabaseAuthStatus();
//         if (!!!authStatus)
//             // if (!!!globalContext || !!!globalContext?.state || !!!globalContext?.state?.user?.user_id || !!!globalContext?.isAuthenticated) {
//             router.replace("/(auth)");

//         //redirect to not-found page if householdId is not found or not in the list of households in globalContext
//         householdIdRef.current = params?.id[0] ?? globalContext?.state?.households?.[0]?.id ?? globalContext.storage?.getItem("households") ?? null;

//         if (!!!householdIdRef.current || !(globalContext?.state?.households ?? []).find((household) => household.id === householdIdRef.current)) {
//             const message = !!!householdIdRef ? `Household not found` : `You don't have access to this household`;
//             router.replace({ pathname: "/+not-found" as RelativePathString, params: { message } });
//         }

//     }, [globalContext, params]);

//     const household = useQuery({
//         queryKey: ['householdData', householdIdRef.current],
//         // queryFn: async () => {
//         //     const { data, error } = await supabase.from('user_household')
//         //         .select('user_id, household_id, households (id, name, created_at)')
//         //         .eq('household_id', householdIdRef.current)
//         //         .eq('user_id', globalContext?.state?.user?.user_id)
//         //         .single()

//         //     if (error) {
//         //         throw new Error(error.message);
//         //     }
//         //     return data;
//         // },
//         queryFn: async () => fetchSpecificUserHousehold({
//             user_id: globalContext?.state?.user?.user_id,
//             household_id: householdIdRef.current as string,
//         }),
//         enabled: !!globalContext?.state?.user?.user_id && !!householdIdRef.current && typeof householdIdRef.current === 'string',
//         refetchOnWindowFocus: false,
//     });

//     if (household.data) {
//         const householdHelper = new UserHouseholdHelper(household.data, globalContext?.state?.user ?? {});
//     }

//     return (
//         !!household && !!globalContext?.state?.user?.user_id ? (
//             <HouseHoldDetails
//                 householdData={household}
//                 current_user={globalContext?.state?.user}
//                 props={{ id: householdIdRef.current }}
//             />
//         ) : null
//     )


// }