import { fetchUserAndHouseholds, fetchUserInventories, fetchUserTasks, getProfile } from "@/lib/supabase/session";
import supabase from "@/lib/supabase/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";

/**
 * Hook to retrieve user session data from Supabase public schema tables using parallel queries via TanStack Query.
 *
 * @param {string | null | undefined} userId - The user ID to fetch the session for.
 * @param {Object} initialData - Initial data to populate the state before fetching.
 * @param {Object} initialData.profile - Initial profile data.
 * @param {Array} initialData.households - Initial households data.
 * @param {Array} initialData.userHouseholds - Initial user-households data.
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
        userHouseholds: any[];
        inventories: any[];
        tasks: any[];
        session: any;
    } = {
            profile: {},
            households: [],
            userHouseholds: [],
            inventories: [],
            tasks: [],
            session: null,
        },
    //TODO: FIX THIS LATER
    // prefetchParams: {
    //     [key in "households" | 'userHouseholds' | "inventories" | "products" | "tasks" | "vendors" | "session" | "profile"]?: {
    //         initialPageParam?: number;
    //         getNextPageParam?: (lastPage: any) => any;
    //         pages?: number;
    //     };
    // } = {
    //         tasks: {
    //             // Removed initialPageParam as it is not supported by prefetchQuery
    //             getNextPageParam: (lastPage: any) => lastPage.nextCursor,
    //             pages: 3, // Prefetch first three pages
    //         },
    //     }
) {
    const queryClient = useQueryClient();

    // State to hold session data
    const [data, setData] = useState<{
        profile: any;
        households: any[];
        userHouseholds: any[];
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
    const getSessionData = async (userId: string, client = queryClient) => {
        try {
            const [profile, households, userHouseholds, tasks, session] = await Promise.all([
                client.prefetchQuery({
                    queryKey: ["user_id", { user_id: userId }],
                    queryFn: () => getProfile({ user_id: userId }),
                    initialData: memoizedInitialData.profile,
                    staleTime: 1000 * 60 * 5, // 5 minutes
                    initialPageParam: undefined, // Ensure compatibility
                }),
                client.prefetchQuery({
                    queryKey: ["households", { user_id: userId }],
                    queryFn: async () => {
                        const result = await fetchUserAndHouseholds({ user_id: userId });
                        return result
                    },
                    initialData: memoizedInitialData.households,
                }),
                client.prefetchQuery({
                    queryKey: ["user_households", { user_id: userId }],
                    queryFn: () =>
                        supabase
                            .from("user_households")
                            .select("*")
                            .eq("user_id", userId)
                            .order("created_at", { ascending: false }),
                }),
                client.prefetchQuery({
                    queryKey: ["task_assignments", { user_id: userId }],
                    queryFn: () => fetchUserTasks({ user_id: userId }),
                    initialData: memoizedInitialData.tasks,

                }),
                client.prefetchQuery({
                    queryKey: ["session", { user_id: userId }],
                    queryFn: () => supabase.auth.getSession(),
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
            });

            // Combine all fetched data
            return {
                profile: profile ?? {},
                households: households ?? [],
                userHouseholds: userHouseholds ?? [],
                inventories: inventories ?? [],
                tasks: tasks ?? [],
                session: session ?? null,
            };
        } catch (error) {
            console.error("Error fetching session data:", error);
            throw error;
        }
    };

    // Fetch data when userId changes
    useEffect(() => {
        if (userId) {
            getSessionData(userId)
                .then((fetchedData) => setData(fetchedData))
                .catch((error) => console.error("Error fetching session data:", error));
        }
    }, [userId]);

    return {
        data,
        setData,
        getSessionData,
    };
}