import React from "react";
import { Stack, Redirect, RedirectProps } from "expo-router";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
const _AuthSignInStackNavigator = () => {
  const { isAuthenticated } = useUserSession() || false;
  console.log("isAuthenticated", isAuthenticated);

  return isAuthenticated ? (
    <Redirect href="/(tabs)/(dashboard)" />
  ) : (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_left",
        animationDuration: 500,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />{" "}
      {/* Login */}
      <Stack.Screen name="authenticate" />{" "}
      {/* Authenticate - password or SSO login*/}
      <Stack.Screen name="forgot-password" /> {/* Reset password */}
      <Stack.Screen name="reset-password" /> {/* Create new password */}
      {/* <Stack.Screen name="sso-login" /> Single sign-on login */}
      {/* <Stack.Screen name="sso-login-success" />{" "} */}
      {/* Successful single sign-on login */}
    </Stack>
  );
};

export default _AuthSignInStackNavigator;
