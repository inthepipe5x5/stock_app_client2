import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack } from "expo-router";
import React from "react";

const scanRouteLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Scan",
          // statusBarStyle: "auto",
        }}
      />
      <Stack.Screen
        name="upload"
        options={{
          title: "Upload",
          // statusBarStyle: "auto",
          presentation: "modal",
        }}
      />
      <Stack.Screen name="detail" />
      <Stack.Screen name="gallery" />
    </Stack>
  );
};

export default scanRouteLayout;
