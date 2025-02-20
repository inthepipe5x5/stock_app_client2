import { useEffect, useState } from "react";
import { Platform } from "react-native";
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
import { existingUserCheck } from "@/lib/supabase/session";

// Configure Google Sign-In
GoogleSignin.configure({
  scopes: [
    "email",
    "profile",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/openid",
  ],
  webClientId: process.env.EXPO_PUBLIC_WEBCLIENT_ID,
  offlineAccess: true,
  forceCodeForRefreshToken: Platform.OS === "android",
});

const GoogleSigninButtonComponent = () => {
  const { state, dispatch, signIn } = useUserSession();
  const router = useRouter();
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_WEBCLIENT_ID,
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
      scopes: [
        "openid",
        "profile",
        "email",
      ],
    },
    {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
    }
  );

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session && state.user) {
          handleSuccessfulAuth(state.user, session, dispatch);
          showAuthOutcome(true);
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, [state]);

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      signIn({
        email: response.params.email,
        provider: "google",
        idToken: id_token,
      });
    }
  }, [response]);

  const onPressHandler = async () => {
    try {
      if (Platform.OS === "web") {
        promptAsync();
      } else {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();

        if (userInfo?.type === "success" && userInfo.data.idToken) {
          signIn({
            email: userInfo.data.user.email,
            provider: "google",
            idToken: userInfo.data.idToken,
          });
        }
      }
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={onPressHandler}
    />
  );
};

export default GoogleSigninButtonComponent;
