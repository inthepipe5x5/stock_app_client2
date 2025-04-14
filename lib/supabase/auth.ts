/**Supabase Auth Functions
 * Source: https://supabase.com/docs/guides/auth/native-mobile-deep-linking?utm_source=expo&utm_medium=referral&utm_term=expo-react-native
 * 
 */

import * as AuthSession from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import supabase from "@/lib/supabase/supabase";
import { Platform } from "react-native";
import { getUserProfileByEmail } from "@/lib/supabase/session";
import { userProfile, app_metadata, authSetupData, access_level, draft_status } from "@/constants/defaultSession";
import { getLinkingURL } from "expo-linking";
import { AuthUser, SignInWithIdTokenCredentials, SignInWithOAuthCredentials, SignInWithPasswordCredentials, SignInWithPasswordlessCredentials } from "@supabase/supabase-js";
import { fakeUserAvatar } from "../placeholder/avatar";
import defaultUserPreferences from "@/constants/userPreferences";
import isTruthy from "@/utils/isTruthy";


type Provider = "google" | "facebook" | "apple";

// WebBrowser.maybeCompleteAuthSession(); // required for web only to close the browser after redirect
// const url = Linking.useURL();

//I THINK THIS NEEDS TO BE ARCHIVED
export const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;

  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  return data.session;
};


export const sendMagicLink = async (email: string, redirectTo: string) => {
  if (!email) throw new Error("Email is required");

  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) throw error;
  // Email sent.
  console.log("Email sent to: ", email);
  //TODO later: show toast message or alert to user
};

// export  const performWebOAuth = async (dispatch: ({ type, payload }: { type: any; payload: any; }) => void, credentials: Partial<SignInWithOAuthCredentials>) => {
//     const redirectUrl = AuthSession.makeRedirectUri({
//       scheme: ".com.supabase.stockapp/**",
//       path: "/(tabs)",
//       preferLocalhost: Platform.OS === "ios",
//     });

//     const [request, response, promptAsync] = AuthSession.useAuthRequest(
//       {
//         config: {
//           provider
//         },
//       },
//       {
//         discovery: null, // Replace with actual discovery document if available
//       }
//     );


//     const { data, error } = await supabase.auth.signInWithOAuth({
//       provider: credentials.provider,
//       options: {
//         redirectTo: redirectUrl ?? "/(tabs)",
//         skipBrowserRedirect: true,
//       },
//     });


//   //handle error
//     if (error) {
//       console.error("Error signing in with OAuth:", error.message);
//       throw error};

//       //assuming OAUTH login is successful & data is not null
//       //handle success by closing the popup browser window
//       Platform.OS === "web" ?WebBrowser.maybeCompleteAuthSession() : null;
//       const result = await AuthSession.promptAsync({ authUrl: data.url });
//       //set session
//       await supabase.auth.setSession({ access_token: result.params.access_token, refresh_token: result.params.refresh_token });
//     // if (data?.url) {
//     //   const result = await AuthSession.startAsync({ authUrl: data.url });
//     //   if (result.type === "success") {
//     //     // Send tokens to your backend
//     //     await (result.params.access_token, result.params.refresh_token);
//     //     // Your backend handles session creation and returns necessary info
//     //     // You can then update your app's state accordingly
//     //   }
//     // }
//   };

export type customSignInOptionsParams = SignInWithOAuthCredentials["options"];

export interface authenticationCredentials {
  email: string;
  password?: string;
  oauthProvider?: Provider;
  access_token?: string;
  idToken?: string;
}

type ConditionalAuthenticationCredentials = authenticationCredentials["password"] extends undefined
  ? Omit<authenticationCredentials, "password"> & {
    oauthProvider?: Provider;
    access_token?: string;
    idToken?: string;
  }
  : Omit<authenticationCredentials, "oauthProvider" | "access_token" | "idToken">;

export type CombinedAuthCredentials = ConditionalAuthenticationCredentials;


export const authenticate = async (/*user: Partial<userProfile>,*/ credentials: Partial<CombinedAuthCredentials>) => {
  // Do nothing if either user or credentials are not provided
  if (!isTruthy(credentials) && !isTruthy(credentials.email)) {
    // if (!user || !credentials || !user.email) {
    console.error("authenticate() => Invalid credentials");
    throw new Error("Invalid credentials provided to authenticate()");
  }

  let authenticatedSession = undefined;
  // const {email } = credentials;
  // For redirecting to the app after authentication
  const options = {
    redirectTo: getLinkingURL() || "com.supabase.stockapp://(tabs)",
    ..."access_token" in credentials ? { access_token: credentials.access_token } : {},
  }

  // Check if the email is valid

  // let validEmail = await checkValidEmail(email);
  // if (!validEmail) {
  //     console.error("authenticate() => Invalid email");
  //     throw new Error("Invalid email");
  // }

  if (isTruthy(credentials)) {

    // Handle OAuth sign in
    if ("oauthProvider" in credentials && typeof credentials.oauthProvider === "string") {
      if ("access_token" in credentials) {
        // Sign in with OAuth access token
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: credentials.oauthProvider as Provider,
          // access_token: credentials.access_token,
          options,
        });
        if (error) throw error;
        authenticatedSession = data;
      }
      if ("idToken" in credentials && typeof credentials.idToken === "string") {
        // Sign in with OAuth id token
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: credentials.oauthProvider,
          token: credentials.idToken,
        });
        if (error) throw error;
        authenticatedSession = data;
      }
    }

    // Handle password sign in
    if (Object.keys(credentials).some((key: string) =>
      ["password", "email"].includes(key.toLowerCase()))) {
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email ?? "",
        password: credentials.password ?? "",
      });
      if (error) throw error;
      authenticatedSession = data;
    }
    // Return the authenticated session
    return authenticatedSession;
  }
  // If no credentials are provided, throw an error
  throw new Error("Invalid credentials");
}

/** * Function to check if a user has access to a household resource
 * 
 * @param data @object - Object containing household_id, user_id, and created_by
 * @param data.household_id @string - The ID of the household to check access for
 * @param data.user_id @string - The ID of the user to check access for
 * @param data.created_by @string - The ID of the user who created the resource
* @param data.draft_status @string - The status of the resource (draft or published)
 * @returns {Promise<boolean>} - Returns true if the user has access, false otherwise 
*/
export const checkAccess = async (data: {
  household_id: string;
  user_id: string;
  created_by: string;
  draft_status: draft_status
}): Promise<boolean> => {
  const { data: access, error } = await supabase.rpc('check_user_access', {
    requested_resource: {
      household_id: data.household_id,
      draft_status: data.created_by, // or 'published', depending on the context
      created_by: data.created_by // Replace with the actual user ID of the creator
    }
  });

  if (!!error) {
    console.error('Error calling RPC:', error);
    throw error; //propagate the error
  } else {
    console.log('User access result:', { data }, '=>', { access });
  }
  return access;
}