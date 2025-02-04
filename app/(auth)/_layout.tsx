import React from "react";
import { Stack } from "expo-router";

const _AuthStackLayout = () => {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_left",
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(signin)" />
      <Stack.Screen name="(signup)" />
    </Stack>
  );
};

export default _AuthStackLayout;
