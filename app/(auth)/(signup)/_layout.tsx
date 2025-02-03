import { Redirect, Stack } from "expo-router";
import { useState } from "react";
// import { useSession } from "@/components/contexts/UserSessionProvider";
const _SignUpStackLayout = () => {
  // const { user, isAuthenticated } = useSession();

  // const [password, setPassword] = useState("");
  // const [location, setLocation] = useState("");
  // const [confirm, setConfirm] = useState("");

  // return isAuthenticated ? (<Redirect to="index" />) :
  return (
    <Stack initialRouteName="index">
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
