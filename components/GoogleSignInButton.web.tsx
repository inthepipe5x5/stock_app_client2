// import { useEffect } from "react";
// import { Platform } from "react-native";
// import {
//   GoogleSignin,
//   GoogleSigninButton,
// } from "@react-native-google-signin/google-signin";
// import * as AuthSession from "expo-auth-session";
// import supabase from "@/lib/supabase/supabase";
// import { useUserSession } from "@/components/contexts/UserSessionProvider";

// // Configure Google Sign-In
// GoogleSignin.configure({
//   scopes: [
//     "email",
//     "profile",
//     "https://www.googleapis.com/auth/userinfo.profile",
//     "https://www.googleapis.com/auth/userinfo.email",
//     "https://www.googleapis.com/auth/openid",
//   ],
//   webClientId: process.env.EXPO_PUBLIC_WEBCLIENT_ID,
//   offlineAccess: true,
//   forceCodeForRefreshToken: Platform.OS === "android",
// });
// webClientId: process.env.EXPO_PUBLIC_WEBCLIENT_ID || "",
// const GoogleSigninButtonComponent = () => {
//   const { state, dispatch, signIn, handleSuccessfulAuth, handleAuthOutcome, handleAuthError } = useUserSession();
//   const router = useRouter();
//   const [request, response, promptAsync] = AuthSession.useAuthRequest(
//     {
//       const { state, dispatch, signIn, handleSuccessfulAuth, handleAuthError } = useUserSession();
//       scopes: [
//         "openid",
//         "profile",
//         "email",
//         redirectUri: AuthSession.makeRedirectUri(),
//     },
//     {
//       authorizationEndpoint: "https://accounts.google.com/o/oauth2/auth",
//       tokenEndpoint: "https://oauth2.googleapis.com/token",
//     }
//   );

//   useEffect(() => {
//     const { data: authListener } = supabase.auth.onAuthStateChange(
//       (event, session) => {
//         if (event === "SIGNED_IN" && session && state.user) {
//           handleSuccessfulAuth(state.user, session, dispatch);
//           showAuthOutcome(true);
//         }
//       }
//     );

//     handleAuthOutcome(true);
//   }, [state]);

//   useEffect(() => {
//     if (response?.type === "success") {
//       const credentials = {
//         email: response.params.email,
//         provider: "google",
//       };

//       const { id_token } = response.params;

//       signIn({ ...credentials, idToken: id_token });
//     }
//     const { id_token } = response.params || null;
//     if (!!response?.params) {
//       const { id_token, email } = response.params;
//       const credentials = {
//         email,
//         provider: "google",
//       };
//     }
//     signIn({ ...credentials, idToken: id_token });
//   }, [response, state, dispatch, handleSuccessfulAuth]);
//   if (Platform.OS === "web") {
//     promptAsync();
//   } else {
//     await GoogleSignin.hasPlayServices();
//     const userInfo = await GoogleSignin.signIn();

//     if (userInfo?.type === "success" && userInfo.data.idToken) {
//       signIn({
//         email: userInfo.data.user.email,
//         provider: "google",
//         idToken: userInfo.data.idToken,
//       });
//     }
//   }
// } catch (error: any) {
//   handleAuthError(error);
// }


// return (
//   <GoogleSigninButton
//     size={GoogleSigninButton.Size.Wide}
//     color={GoogleSigninButton.Color.Dark}
//     onPress={onPressHandler}
//   />
// );
// };

// export default GoogleSigninButtonComponent;
