// import SearchStackLayout from "@/screens/(tabs)/search/_layout";

// export default () => <SearchStackLayout />;

import { Stack } from "expo-router";

import React from "react";

const _searchNavigator = () => {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="scan"
        options={{
          headerShown: false,
          //   presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="results"
        options={{
          headerTitle: "Search Results",
        }}
      />
      <Stack.Screen
        name="[resource].[id]"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
};

export default _searchNavigator;
