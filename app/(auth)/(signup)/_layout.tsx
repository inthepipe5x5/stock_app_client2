import { Redirect, Stack } from "expo-router";
import { useState } from "react";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import ConfirmClose from "@/components/navigation/ConfirmClose";
const _SignUpStackLayout = () => {
  const { state, dispatch, isAuthenticated } = useUserSession();

  // const [password, setPassword] = useState("");
  // const [location, setLocation] = useState("");
  // const [confirm, setConfirm] = useState("");

  return isAuthenticated ? (
    <Redirect href={"index" as any} />
  ) : (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_left",
        animationDuration: 500,
        // headerLeft(props: any) {
        //   return <triggerAlertButton displayState={false} {...props} />;
        //   // return <ConfirmClose dismissToURL={props?.dismissToURL ?? "/"} {...props} />;
        // },
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
