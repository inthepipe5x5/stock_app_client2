import { StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import React from "react";

const scanRouteLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Scan",
          statusBarStyle: "auto",
        }}
      />
    </Stack>
  );
};

export default scanRouteLayout;
