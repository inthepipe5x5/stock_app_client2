import { Stack } from "expo-router";

export default function SearchStackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="search"
        // options={{ headerTitle: "Search Results" }}
      />
      <Stack.Screen
        name="details"
        // options={{ headerTitle: "Details" }}
      />
      <Stack.Screen name="scan" />
    </Stack>
  );
}
