import { useEffect, Component, useState } from "react";
import { Appearance, Platform } from "react-native";
import {
  User,
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import * as AuthSession from "expo-auth-session";
import supabase from "@/lib/supabase/supabase";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import { useRouter } from "expo-router";
import {
  handleAuthError,
  handleSuccessfulAuth,
  showAuthOutcome,
} from "@/hooks/authOutcomes";
import { getLinkingURL } from "expo-linking";
import { getUserProfileByEmail } from "@/lib/supabase/session";

// Configure Google Sign-In
GoogleSignin.configure({
  scopes: [
    "email",
    "profile",
    "https://www.googleapis.com/auth/userinfo.profile", //See your primary Google Account email address
    "https://www.googleapis.com/auth/userinfo.email", //See your personal info, including any personal info you've made publicly available
    "https://www.googleapis.com/auth/openid", //Associate you with your personal info on Google
  ],
  webClientId: process.env.EXPO_PUBLIC_WEBCLIENT_ID, // Web Client ID for OAuth
  offlineAccess: true,
  forceCodeForRefreshToken: Platform.OS === "android", // Force a code for refresh token (Android only)
});

interface GoogleSigninButtonProps {
  redirectToUrl?: string;
  enabledProp?: boolean;
}

const GoogleSigninButtonComponent: React.FC<GoogleSigninButtonProps> = ({ redirectToUrl = null, enabledProp = true }) => {
  const { state, dispatch, signIn } = useUserSession();
  const router = useRouter();
  const [enabled, setEnabled] = useState(enabledProp);
  const colorMode =
    state?.user?.preferences?.theme ?? Appearance.getColorScheme() ?? "light";

  // Listen for authentication state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session && state.user) {
          // signIn({ access_token: session.access_token, provider: "google" });
          // router.replace("/(tabs)");
          handleSuccessfulAuth(state.user, session, dispatch);
          showAuthOutcome(true);
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, [state]);

  // Function to handle Google Sign-In
  const onPressHandler = async () => {
    // Disable button while processing
    setEnabled(false);
    try {
      //redirect url
      const redirectTo = getLinkingURL() ?? redirectToUrl ?? "com.supabase.stockapp://(tabs)";
      // if (Platform.OS === "ios" || Platform.OS === "android") {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo?.type === "success" && userInfo.data.idToken) {
        signIn({
          email: userInfo.data.user.email,
          provider: "google",
          idToken: userInfo.data.idToken,
        });
        // const { idToken, user: googleUser } = userInfo.data;
        // const { email, photo, name, familyName, givenName } = googleUser;
        // const { data, error } = await supabase.auth.signInWithIdToken({
        //   provider: "google",
        //   token: idToken,
        // });
        // //handle success
        // if (data && data?.session && data?.user && !error) {
        //   const { user, session } = data;

        //   await handleSuccessfulAuth(combinedUser, session, dispatch);
        // }
        // const user = {
        //   user,
        //   email,
        //   first_name: givenName,
        //   last_name: familyName,
        //   name: name || `${givenName} ${familyName}`,
        //   app_metadata: JSON.stringify({
        //     oauthProvider: "google",
        //     avatar_url: photo,
        //   }),
        // };
        // const session = data.session;

        // const { data, error } = await supabase.auth.signInWithOAuth({
        //   redirectTo: getLinkingURL() || "com.supabase.stockapp://(tabs)",
        //   oauthProvider: "google",
        //   // email,
        //   // tokens: idToken,
        // });
      } else {
        //   const redirectUrl = AuthSession.makeRedirectUri({ useProxy: true });
        //   const { data, error } = await supabase.auth.signInWithOAuth({
        //     provider: "google",
        //     options: {
        //       redirectTo: redirectUrl,
        //     },
        //   });
        //   if (error) throw error;
        //   if (data?.url) {
        //     const result = await AuthSession.startAsync({ authUrl: data.url });
        //     if (result.type === "success") {
        //       const { access_token, refresh_token } = result.params;
        //       await supabase.auth.setSession({ access_token, refresh_token });
        //       await handleSuccessfulAuth(data, dispatch);
        //     }
        //   }
      }
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={
        colorMode === "dark"
          ? GoogleSigninButton.Color.Dark
          : GoogleSigninButton.Color.Light
      }
      onPress={onPressHandler}
      disabled={!enabled}
    />
  );
};

export default GoogleSigninButtonComponent;
