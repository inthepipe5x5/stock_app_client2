import { useRouter, Stack, usePathname, RelativePathString } from "expo-router";
import { useState, useEffect } from "react";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import ConfirmClose from "@/components/navigation/ConfirmClose";
import defaultSession from "@/constants/defaultSession";


const _SignUpStackLayout = () => {
  const globalContext = useUserSession();
  const state = globalContext?.state ?? defaultSession;
  const isAuthenticated = globalContext?.isAuthenticated ?? state?.isAuthenticated ?? false;
  const router = useRouter();
  const pathname = usePathname();

  // const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if the user has a session and redirect accordingly
    if (
      [!!isAuthenticated,
      state?.user?.user_id,
      state?.user?.draft_status !== 'draft'].every(Boolean)
    ) {
      router.replace("/(tabs)" as RelativePathString)
    } else {
    }
  }, [isAuthenticated]);

  // if (isLoading) {
  //   router.push({
  //     pathname: "/" as RelativePathString,
  //     params: {
  //       nextURL: pathname, // Pass the current pathname as a parameter to the loading screen before redirected back
  //       message: "Loading...",
  //     }
  //   })
  // }

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_left",
        animationDuration: 1000,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="join-household"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          animationDuration: 500,
        }}

      />
      <Stack.Screen name="preferences" />;
      {/* Signup steps */}

      <Stack.Screen name="location" />
      <Stack.Screen name="create-password" />
      <Stack.Screen name="new-user-signin" />
      <Stack.Screen
        name="confirm"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          animationDuration: 500,
        }}
      />
    </Stack>
  );

};

export default _SignUpStackLayout;
