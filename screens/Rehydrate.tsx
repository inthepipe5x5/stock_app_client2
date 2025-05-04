/** Screen to rehydrate the app state from local storage and update the app state.
 * 
 */

// app/rehydrate.tsx
import { useEffect, useState } from "react";
import useRedirect from "@/hooks/useRedirect";
import { getAuthSession, getSupabaseAuthStatus } from "@/lib/supabase/auth";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner } from "@/components/ui/spinner";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import defaultSession, { session } from "@/constants/defaultSession";
import { Redirect, RelativePathString } from "expo-router";
import { SplashScreen } from "expo-router";
import LoadingOverlay from "@/components/navigation/TransitionOverlayModal";

export default function RehydrateScreen() {
    const toast = useToast();
    const queryClient = useQueryClient();
    const { dispatch, openingUrl, setOpeningUrl, state } = useUserSession();
    //skip rehydration if there is no previous session
    const [skipRehydration, setSkipRehydration] = useState<Boolean>(!Object.values(state ?? defaultSession).every(Boolean)); // if all values in the session are falsy - return true and skip rehydration => return a redirect to /(auth)
    const [hydrated, setHydrated] = useState<boolean | null>(null);
    const [rehydrateError, setRehydrateError] = useState<string | null>(null);

    // SplashScreen.preventAutoHideAsync(); // Prevent splash screen from auto-hiding until rehydration is complete
    if (skipRehydration) {
        return <Redirect href="/(auth)" />; // Redirect to the login screen if rehydration is skipped
    }

    useEffect(() => {
        console.log("Rehydration effect triggered");
        //set opening url if null when the app is opened
        async function initialize() {
            if (!!!openingUrl) {
                // Get the initial URL if the app was opened from a link
                // This is only called when the app is opened from a link, not when the app is already open
                setOpeningUrl(await Linking.getInitialURL());
            }
            // Hide the splash screen after a short delay to allow for any initial loading
            // await SplashScreen.hideAsync();
        }
        initialize();
    }, []);

    const { data, isLoading, isLoadingError, isSuccess, ...sessionQueries } = useQuery({
        queryKey: ["session"],
        queryFn: async () => {
            try {

                const supabaseSession = await getSupabaseAuthStatus(true, true) as Promise<Partial<session>>;
                //handle errors
                if (!Boolean(supabaseSession)) {
                    setRehydrateError("No session found");
                    return;
                }
                queryClient.setQueryData(["session"], supabaseSession);
                return supabaseSession;
            } catch (err: any) {
                console.error("Error getting session:", err.message ?? err);
                setRehydrateError("Error getting session");
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnMount: "always"
    })

    // // Check if the session is loading or if there was an error loading it
    // if (isLoading) {
    //     return (
    //         <SafeAreaView className="flex-1">
    //             <Center style={{ flex: 1 }}>
    //                 <Spinner size="large" />
    //                 <Text className="mt-4">Loading your session...</Text>
    //             </Center>
    //         </SafeAreaView>
    //     );
    // }

    if (isSuccess && data) {
        // If the session is successfully loaded, update the state and set hydrated to true
        dispatch({ type: "SET_NEW_SESSION", payload: data });
        setHydrated(true);
        toast.show({
            placement: "bottom",
            duration: 2000,
            render: ({ id }) => (
                <Toast nativeID={id} action="success">
                    <ToastTitle>Welcome back {`${state?.user?.name ?? "User"}`}</ToastTitle>
                    <ToastDescription>Session rehydrated successfully</ToastDescription>
                </Toast>
            )
        })
    }

    if (hydrated) {
        // If the session is hydrated, redirect to the main app
        return <Redirect href={{ pathname: (openingUrl ?? "/(tabs)") as RelativePathString }} />;
    }

    //if user is not authenticated, redirect to the login screen
    if (!rehydrateError) {
        console.error("Rehydrate failed:", rehydrateError ?? "Unknown error");
        toast.show({
            placement: "bottom",
            render: ({ id }) => (
                <Toast nativeID={id} action="error">
                    <ToastTitle>Rehydration Error</ToastTitle>
                    <ToastDescription>{rehydrateError ?? "An unknown error occurred while rehydrating the session"}</ToastDescription>
                </Toast>
            ),
        });
        return <Redirect href="/(auth)" />;
    }

    return (
        <SafeAreaView className="flex-1">
            <LoadingOverlay
                background={"transparent"}
                title="Rehydrating session..."
                subtitle="Please wait while we load your session"
                visible={true}
                noRedirect={true}
            />
        </SafeAreaView>
    );
}
