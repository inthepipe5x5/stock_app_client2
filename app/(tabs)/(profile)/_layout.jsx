import { Stack } from "expo-router";
import React from "react";

const _ProfileLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="edit" options={{ headerTitle: "Edit Profile" }}/>
      <Stack.Screen name="settings" options={{ headerTitle: "Settings" }} />
    </Stack>
  );
};

export default _ProfileLayout;
