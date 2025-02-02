import { Redirect, Tabs } from "expo-router";
import ProtectedNavigation from "@/components/navigation/ProtectedNavigation";
import { useUserSession } from "@/contexts/userSessionProvider";
import { useState, useEffect } from "react";
import Colors from "@/constants/Colors";
import { Redirect } from "expo-router";
import { Appearance } from "react-native";
import { Home, Inbox, ScanSearchIcon, User } from "lucide-react-native";
/**
 * Root Tabs Navigator for authenticated users.
 *
 * Manages the top-level navigation between sections like Home, Dashboard, Search, and Profile.
 */
function RootTabLayout() {
  const { state, isAuthenticated } = useUserSession();
  const [colorTheme, setColorTheme] = useState("light");
  //set color theme based on user preferences or device appearance
  useEffect(() => {
    setColorTheme((prevColorTheme) => {
      state.preferences.theme ?? Appearance.getColorScheme() ?? "light";
    });
  }, [colorTheme]);

  return isAuthenticated ? (
    <Redirect to="/(auth)/" />
  ) : (
    <Tabs
      screenOptions={{
        //set default tab bar styles
        tabBarStyle: {
          backgroundColor: Colors[colorTheme].navigation.default,
        },
        //set active tab label styles
        tabBarActiveTintColor: Colors[colorTheme].input.primary,
        tabBarActiveBackgroundColor: Colors[colorTheme].primary.main,
      }}
    >
      <Tabs.Screen
        name="(stacks)"
        options={{
          // presentation: "modal",
          presentation: "transparentModal",
          animation: "fade",
          headerShown: false,
        }}
      />      <Tabs.Screen name="home" options={{ tabBarLabel: "Home" }} />
      <Tabs.Screen
        name="(dashboard)/index"
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, focused }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="(search)/index"
        options={{
          tabBarLabel: "Search",
          tabBarIcon: ({ color, focused }) => (
            <ScanSearchIcon color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="/(inbox)"
        options={{
          tabBarLabel: "Inbox",
          tabBarIcon: ({ color, focused }) => <Inbox color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="(profile)/index"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, focused }) => <User color={color} size={24} />,
        }}
      />
      <Tabs.Screen />
    </Tabs>
  );
}

export default ProtectedNavigation(RootTabLayout);
