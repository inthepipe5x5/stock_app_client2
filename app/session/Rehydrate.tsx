/** Screen to rehydrate the app state from local storage and update the app state.
 * 
 */

// app/rehydrate.tsx
import { useEffect, useState } from "react";
import useRedirect from "@/hooks/useRedirect";
import { getAuthSession, getSupabaseAuthStatus } from "@/lib/supabase/auth";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import { useToast } from "@/components/ui/toast";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner } from "@/components/ui/spinner";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { useQueryClient } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { session } from "@/constants/defaultSession";
import { Redirect, RelativePathString } from "expo-router";
import { SplashScreen } from "expo-router";

export default function RehydrateScreen() {
    const { dispatch, openingUrl } = useUserSession();
    const { startRedirect } = useRedirect({ start: "/(auth)" as RelativePathString, end: (openingUrl ?? "/(tabs)") as RelativePathString });
    const toast = useToast();
    const queryClient = useQueryClient();
    const [hydrated, setHydrated] = useState<boolean | null>(null);
    const [rehydrateError, setRehydrateError] = useState<string | null>(null);

    useEffect(() => {
        async function rehydrateSession() {
            try {
                // Step 1: Try get local session from MMKV
                const localSession = await getAuthSession();
                const supabaseSession = await getSupabaseAuthStatus(true, true) as Promise<Partial<session>>;
                if (![localSession, supabaseSession].some(Boolean)) {
                    setRehydrateError("No session found");
                    return;
                }
                setHydrated(true);
                dispatch({ type: "SET_NEW_SESSION", payload: localSession });
                dispatch({ type: "SET_NEW_SESSION", payload: supabaseSession });

                // Step 2: Save initial link if exists
                const initialURL = await Linking.getInitialURL();
                if (initialURL) {
                    dispatch({ type: "SET_INITIAL_LINK", payload: initialURL });
                }

                // Step 3: Prefetch critical queries
                await queryClient.prefetchQuery({
                    queryKey: ["userProfile"],
                    queryFn: () => {/* fetch user profile */ },

                });
                await queryClient.prefetchQuery({
                    queryKey: ["households"],
                    queryFn: () => {/* fetch households */ },
                });
                await queryClient.prefetchQuery({
                    queryKey: ["tasks"],
                    queryFn: () => {/* fetch tasks */ },
                });

                // Step 4: Navigate user based on session
                startRedirect();

            } catch (error: any) {
                console.error("Rehydrate failed:", error.message ?? error);
                toast.show({
                    placement: "bottom",
                    render: ({ id }) => (
                        <Text nativeID={id}>Error rehydrating session</Text>
                    ),
                });
            }
        }

        rehydrateSession();
    }, []);

    //if user is authenticated, redirect to the main app
    if (hydrated) {
        return <Redirect href="/(tabs)" />;
    }

    //if user is not authenticated, redirect to the login screen
    if (!rehydrateError) {
        return <Redirect href="/(auth)" />;
    }

    return (
        <SafeAreaView className="flex-1">
            <Center style={{ flex: 1 }}>
                <Spinner size="large" />
                <Text className="mt-4">Loading your session...</Text>
            </Center>
        </SafeAreaView>
    );
}
