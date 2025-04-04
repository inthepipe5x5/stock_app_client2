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
 */

import { useEffect, useRef } from "react";
import { HouseHoldDetails } from "@/screens/content/HouseholdDetails";
import { RelativePathString, useLocalSearchParams, useRouter } from "expo-router";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import { useQuery } from "@tanstack/react-query"
import supabase from "@/lib/supabase/supabase";

export default () => {
    const globalContext = useUserSession();
    const params = useLocalSearchParams();
    const router = useRouter();
    const householdIdRef = useRef<string | null>(null);

    useEffect(() => {
        // Check if the user is authenticated and has a valid session
        if (!!!globalContext || !!!globalContext?.state || !!!globalContext?.state?.user?.user_id || !!!globalContext?.isAuthenticated) {
            router.replace("/(auth)");
        }
        //redirect to not-found page if householdId is not found
        householdIdRef.current = params?.id[0] ?? globalContext?.state?.households?.[0]?.id ?? null;
        if (!!!householdIdRef.current) {
            router.replace({ pathname: "/+not-found" as RelativePathString });
        }
    }
        , [globalContext, params]);

    const household = useQuery({
        queryKey: ['householdData', householdIdRef.current],
        queryFn: async () => {
            const { data, error } = await supabase.from('user_household')
                .select('user_id, household_id, households (id, name, created_at)')
                .eq('household_id', householdIdRef.current)
                .eq('user_id', globalContext?.state?.user?.user_id)
                .single()
            if (error) {
                throw new Error(error.message);
            }
            return data;
        },
        enabled: !!householdIdRef.current,
        refetchOnWindowFocus: false,
    });


    return (
        !!household && !!globalContext?.state?.user?.user_id ? (
            <HouseHoldDetails
                householdData={household}
                current_user={globalContext?.state?.user}
                props={{ id: householdIdRef.current }}
            />
        ) : null
    )


}