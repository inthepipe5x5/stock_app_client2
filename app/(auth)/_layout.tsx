import React from "react";
import { Stack, router } from "expo-router";
import { Appearance, Platform } from "react-native";
import { SwipeDirectionTypes } from "react-native-screens";
import { userSchema } from "@/lib/schemas/userSchemas";
import { AuthProvider } from "@/components/contexts/authContext";
import defaultUserPreferences from "@/constants/userPreferences";
import { userProfile } from "@/constants/defaultSession";
import { defaultAppMetaData } from "@/lib/supabase/session";
import Colors from "@/constants/Colors";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import NavigationalDrawer, { SideBarContentList } from "@/components/navigation/NavigationalDrawer";


const iOSScreenOptions = {
  gestureEnabled: true,
  gestureDirection: "horizontal" as SwipeDirectionTypes,
  animationMatchesGesture: true,
};

export const emptyUserProfileDraft = {
  user_id: "",
  email: "",
  first_name: "",
  last_name: "",
  name: "",
  phone_number: "",
  country: "",
  state: "",
  city: "",
  postalcode: "",
  preferences: defaultUserPreferences,
  created_at: new Date().toISOString(),
  avatar_photo: "https://avatar.iran.liara.run/all",
  app_metadata: defaultAppMetaData,
  updated_at: new Date().toISOString(),
  draft_status: "draft"
} as userProfile

const _AuthStackLayout = () => {
  const globalContext = useUserSession();
  const colorScheme = globalContext?.state?.user?.preferences?.theme ??
    globalContext?.colorScheme
  const colors = Colors[colorScheme === 'system' ? Appearance.getColorScheme() ?? "light" : "light"];
  const oppositeColors = Colors[colorScheme === 'system' ? Appearance.getColorScheme() ?? "dark" : "dark"];
  return (
    // <Stack initialRouteName="index" screenOptions={screenOptions}>
    <AuthProvider
      timeout={15} //global timeout in minutes
      bgTimeout={10}
      schema={userSchema}
      defaultFormValues={emptyUserProfileDraft}
    >
      {/* <NavigationalDrawer iconList={SideBarContentList} /> */}

      <Stack
        initialRouteName="index"
        screenOptions={{
          // headerShown: false,
          headerTitleAlign: 'center',
          animation: "slide_from_left",
          animationDuration: 500,

          ...(Platform.OS === "ios"
            ? iOSScreenOptions
            : {
              gestureEnabled: Platform.OS === 'macos',
              gestureDirection: "horizontal",
              animationMatchesGesture: (Platform.OS as string) === 'ios',
              animationTypeForReplace: (Platform.OS as string) === 'web' ? "pop" : "push",
            }),
          headerStyle: {
            backgroundColor: colors.primary.main,
          },
          headerTitleStyle: {
            color: colors.primary.main,
            fontSize: 18,
            fontWeight: "bold",
          },
          headerShadowVisible: true,
          headerLargeTitleShadowVisible: Platform.OS !== 'web',
          headerTintColor: oppositeColors.primary.main,
          animationMatchesGesture: Platform.OS === "ios",
          presentation: Platform.OS === 'web' ? 'modal' : 'card',
          freezeOnBlur: ['ios', 'android'].includes(Platform.OS.toLowerCase()),
          contentStyle: {
            flex: 1,
            backgroundColor: colors.background
          },

        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(signin)" />
        <Stack.Screen name="(signup)" />
      </Stack>
    </AuthProvider >
  );
};

export default _AuthStackLayout;
