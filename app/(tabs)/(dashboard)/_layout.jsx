import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="upcoming" options={{ headerTitle: "Upcoming Tasks" }} />
      <Stack.Screen
        name="overview"
        options={{ headerTitle: "Household overview" }}
      />
      <Stack.Screen name="list" options={{ headerTitle: "Shopping List" }} />
    </Stack>
  );
};

export default _layout;
