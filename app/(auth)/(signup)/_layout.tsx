import { Redirect, Stack } from "expo-router";
import { useState } from "react";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
const _SignUpStackLayout = () => {
  const { user, isAuthenticated } = useUserSession();

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
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="location" />
      <Stack.Screen name="create-password" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen
        name="confirm"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          animationDuration: 300,
        }}
      />
    </Stack>
  );
};

export default _SignUpStackLayout;
