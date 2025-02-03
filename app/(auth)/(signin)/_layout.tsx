import React from "react";
import { Stack, Redirect, RedirectProps } from "expo-router";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
const _layout = () => {
  const { isAuthenticated } = useUserSession();
  return isAuthenticated ? (
    <Redirect href="/(tabs)/(dashboard)" />
  ) : (
    <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" /> {/* Login */}
      <Stack.Screen name="authenticate" />{" "}
      {/* Authenticate - password or SSO login */}
      <Stack.Screen name="forgot-password" /> {/* Reset password */}
      <Stack.Screen name="create-password" /> {/* Create new password */}
      {/* <Stack.Screen name="sso-login" /> Single sign-on login */}
      {/* <Stack.Screen name="sso-login-success" />{" "} */}
      {/* Successful single sign-on login */}
    </Stack>
  );
};

export default _layout;
