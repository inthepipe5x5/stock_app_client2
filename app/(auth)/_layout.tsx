import React from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { headingStyle } from "@/components/ui/heading/styles";
import { SwipeDirectionTypes } from "react-native-screens";

const iOSScreenOptions = {
  gestureEnabled: true,
  gestureDirection: "horizontal" as SwipeDirectionTypes,
  animationMatchesGesture: true,
};

const _AuthStackLayout = () => {
  return (
    // <Stack initialRouteName="index" screenOptions={screenOptions}>
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_left",
        animationDuration: 300,
        ...(Platform.OS === "ios"
          ? iOSScreenOptions
          : {
              gestureEnabled: false,
              // gestureDirection: "horizontal",
              animationMatchesGesture: false,
            }),
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(signin)" />
      <Stack.Screen name="(signup)" />
    </Stack>
  );
};

export default _AuthStackLayout;
