import { getSupabaseAuthStatus } from "@/lib/supabase/auth";
import { fetchUserHouseholdsByUser, fetchUserInventories, fetchUserTasks, getProfile } from "@/lib/supabase/session";
import supabase from "@/lib/supabase/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useCallback } from "react";

/**
 * Hook to retrieve user session data from Supabase public schema tables using parallel queries via TanStack Query.
 *
 * @param {string | null | undefined} userId - The user ID to fetch the session for.
 * @param {Object} initialData - Initial data to populate the state before fetching.
 * @param {Object} initialData.profile - Initial profile data.
 * @param {Array} initialData.households - Initial households data.
 * @param {Array} initialData.inventories - Initial inventories data.
 * @param {Array} initialData.tasks - Initial tasks data.
 * @param {Object} initialData.session - Initial session data.
 * @returns {Object} - Returns the session data, a setter for the data, and the `getSessionData` function.
 */
export default function useSupabaseSession(
    userId: string | null | undefined = undefined,
    initialData: {
        profile: any;
        households: any[];
        inventories: any[];
        tasks: any[];
        session: any;
    } = {
            profile: {},
            households: [],
            inventories: [],
            tasks: [],
            session: null,
        },

) {
    const queryClient = useQueryClient();

    // State to hold session data
    const [data, setData] = useState<{
        profile: any;
        households: any[];
        inventories: any[];
        tasks: any[];
        session: any;
    }>(initialData);

    // Memoize initial data to avoid unnecessary re-renders
    const memoizedInitialData = useMemo(() => initialData, [initialData]);

    /**
     * Fetch session data for the given user ID.
     *
     * @param {string} userId - The user ID to fetch the session for.
     * @param {QueryClient} client - The TanStack Query client instance.
     * @returns {Promise<Object>} - Returns the fetched session data.
     */
    const getSessionData = useCallback(() => async (client = queryClient) => {
        const { data: { session }, error } = await supabase.auth.getSession() ?? null;

        //do nothing if session is null or error is not null
        if (!!error || !!!session) {
            console.error("Error fetching session:");
            return;
        }
        const userId = session.user.id as string;
        try {
            const [profile, households, tasks, session] = await Promise.all([
                client.prefetchQuery({
                    queryKey: ["profiles", { user_id: userId }],
                    queryFn: async () => await getProfile({ user_id: userId }),
                    initialData: memoizedInitialData.profile,
                    staleTime: 1000 * 60 * 5, // 5 minutes
                    initialPageParam: undefined, // Ensure compatibility
                }),
                client.prefetchQuery({
                    queryKey: ["households", { user_id: userId }],
                    queryFn: async () => {
                        const result = await fetchUserHouseholdsByUser({ user_id: userId });
                        return result
                    },
                    initialData: memoizedInitialData.households,
                }),
                // client.prefetchQuery({
                //     queryKey: ["user_households", { user_id: userId }],
                //     queryFn: async () =>
                //         await supabase
                //             .from("user_households")
                //             .select("*")
                //             .eq("user_id", userId)
                //             .order("user_households.household_id", { ascending: false }),
                // }),
                client.prefetchInfiniteQuery({
                    queryKey: ["task_assignments", { user_id: userId }],
                    queryFn: () => fetchUserTasks({ user_id: userId }),
                    initialPageParam: undefined, // Ensure compatibility
                    // initialData: memoizedInitialData.tasks,
                }),
                client.prefetchQuery({
                    queryKey: ["session", { user_id: userId }],
                    queryFn: async () => {
                        return getSupabaseAuthStatus(true, true)
                    },
                    initialData: memoizedInitialData.session,
                }),

            ]);

            const inventories = await client.prefetchQuery({
                queryKey: ["inventories", { user_id: userId }],
                queryFn: () =>
                    fetchUserInventories(
                        { user_id: userId },
                        (households ?? []).map((h: any) => h.id)
                    ),
                initialData: memoizedInitialData.inventories,
                retry(failureCount, error) {
                    console.log("Error fetching inventories:", error, failureCount);
                    if (error instanceof Error) {
                        return error.message !== "No inventories found for this user";
                    } return true; // Retry for other errors
                },
            });

            // Combine all fetched data
            const dataFetched = {
                profile: profile ?? {},
                households: households ?? [],
                inventories: inventories ?? [],
                tasks: tasks ?? [],
                session: session ?? null,
            };
            console.log("Fetched session data:", { dataFetched });
            setData(dataFetched); // Update state with fetched data
            return dataFetched; // Return the fetched data
        } catch (error) {
            console.error("Error fetching session data:", error);
            throw error;
        }
    }, [userId]);


    return {
        data: useMemo(() => ({
            ...data,
            profile: data.profile ?? {},
            households: data.households ?? [],
            inventories: data.inventories ?? [],
            tasks: data.tasks ?? [],
            session: data.session ?? null,
        }), [data]), // Memoize the data to avoid unnecessary re-renders
        setData: useCallback((newData: any) => {
            setData((prevData) => ({ ...prevData, ...newData }));
        }
            , []),
        getSessionData,
    };
}