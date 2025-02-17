import { Platform } from "react-native";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as AuthSession from "expo-auth-session";
// import * as QueryParams from "expo-auth-session/build/QueryParams";
// import * as WebBrowser from "expo-web-browser";
import supabase from "@/lib/supabase/supabase";
import { useUserSession } from "./contexts/UserSessionProvider";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

GoogleSignin.configure({
  scopes: [
    ".../auth/userinfo.email",
    ".../auth/userinfo.profile",
    "https://www.googleapis.com/auth/drive.readonly",
  ],
  webClientId: process.env.EXPO_PUBLIC_WEBCLIENT_ID,
});

const GoogleSigninButtonComponent = () => {
  const { dispatch, signIn } = useUserSession();

  supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
    console.log("SupabaseAuthEvent:", event);
    console.log("SupabaseSession:", session);

    if (event === "SIGNED_IN" && session) {
      signIn({ access_token: session.access_token, provider: "google" });
    }
  });

  const onPressHandler = async () => {
    try {
      if (Platform.OS === "ios" || Platform.OS === "android") {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        //handle success
        if (userInfo?.idToken) {
        if (userInfo?.idToken) {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: userInfo.idToken,
          });
          if (error) throw error;

          const access_token = data.session?.access_token;

          const user = {
            ...data.user,
            provider: "google",
            access_token,
          };
          signIn({ email: user.email, access_token, oauthProvider: "google" });
          dispatch({ type: "SET_SESSION", payload: { session: data.session } });
        } else {
          throw new Error("No ID token present!");
        }
      } else {
        const redirectUrl = AuthSession.makeRedirectUri({ useProxy: true });
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: redirectUrl,
          },
        });

        if (error) throw error;

        if (data?.url) {
          const result = await AuthSession.startAsync({ authUrl: data.url });
            const { access_token, refresh_token } = result.params;
            // Send tokens to your backend
            await supabase.auth.setSession({ access_token, refresh_token });
            // update app's global state accordingly
            signIn({ access_token, oauthProvider: "google" });
            dispatch({ type: "SET_SESSION", payload: { session: { access_token } } });
          }
        }
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

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
