import React from "react";
import { Stack } from "expo-router";
const _AuthStackLayout = () => {
  return (
    <Stack initialRouteName="(index)">
      <Stack.Screen name="index" />
      <Stack.Screen name="(signin)" />
      <Stack.Screen name="(signup)" />
    </Stack>
  );
};

export default _AuthStackLayout;
