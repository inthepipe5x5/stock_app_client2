import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import supabase from "@/lib/supabase/supabase";
import { fetchProfile } from "@/lib/supabase/session";
import { useUserSession } from "./contexts/UserSessionProvider";

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

  const onPressHandler = async () => {
    async () => {
      try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        //handle success
        if (userInfo?.data?.idToken && userInfo?.data?.idToken !== null) {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: userInfo.data.idToken,
          });
          const access_token = data.session?.access_token;

          const user = {
            ...data.user,
            provider: "google",
            access_token,
          };
          signIn({ email: user.email, access_token, oauthProvider: "google" });

          //update state
          // dispatch({
          //   type: "SET_SESSION",
          //   payload: { user, session: data.session, auth: user }, //TODO: change auth to have the right types
          // });

          // const authResult = await signIn({
          //   oauthProvider: "google",
          //   access_token: userInfo.data?.idToken,
          // });
          // console.log("authResult from signIn method:", authResult);
        } else {
          throw new Error("no ID token present!");
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
