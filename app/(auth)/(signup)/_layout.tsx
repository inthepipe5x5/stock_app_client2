import { useRouter, Stack, usePathname, RelativePathString } from "expo-router";
import { useState, useEffect } from "react";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import ConfirmClose from "@/components/navigation/ConfirmClose";
import defaultSession from "@/constants/defaultSession";


const _SignUpStackLayout = () => {
  const globalContext = useUserSession();
  const state = globalContext?.state ?? defaultSession;
  const isAuthenticated = state?.isAuthenticated ?? false;
  const router = useRouter();
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if the user has a session and redirect accordingly
    if (!!isAuthenticated) {
      setIsLoading(true);
      router.replace("/(tabs)")
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    router.push({
      pathname: "/" as RelativePathString,
      params: {
        nextURL: pathname, // Pass the current pathname as a parameter to the loading screen before redirected back
        message: "Loading...",
      }
    })
  }

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_left",
        animationDuration: 500,
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

      <Stack.Screen name="[step]" options={{
        headerShown: true,
        animation: "slide_from_left",
        animationDuration: 500,
        // headerLeft(props: any) {
        //   return <ConfirmClose dismissToURL={props?.dismissToURL ?? "/"} {...props} />;
        // }
      }} /> {/* Signup steps */}

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
