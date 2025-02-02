import { Stack } from "expo-router";
import React from "react";

const _dashboardNavigator = () => {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="upcoming"
        options={{ headerTitle: "Upcoming Tasks" }}
      />
      <Stack.Screen
        name="overview"
        options={{ headerTitle: "Household overview" }}
      />
      <Stack.Screen name="list" options={{ headerTitle: "Shopping List" }} />
      <Stack.Screen
        name="(stacks)"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
};

export default _dashboardNavigator;
