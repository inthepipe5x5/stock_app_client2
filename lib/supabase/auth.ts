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
import { fetchProfile, getProfile, getUserProfileByEmail, upsertUserProfile } from "@/lib/supabase/session";
import { userProfile, app_metadata, authSetupData, access_level, draft_status, session } from "@/constants/defaultSession";
import { getLinkingURL } from "expo-linking";
import { AuthUser, Session, SignInWithIdTokenCredentials, SignInWithOAuthCredentials, SignInWithPasswordCredentials, SignInWithPasswordlessCredentials } from "@supabase/supabase-js";
import { fakeUserAvatar } from "../placeholder/avatar";
import defaultUserPreferences from "@/constants/userPreferences";
import isTruthy from "@/utils/isTruthy";
import { randomUUID } from "expo-crypto";
import { hash } from "@/lib/OFF/OFFcredentials";
import { getHouseholdAndInventoryTemplates } from "./register";

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

/** Function to send a magic link to the user's email address
 * 
 * @param email - The email address of the user to send the magic link to.
 * @param redirectTo 
 * @example use to in invite new users to the app
 */

export const sendMagicLink = async ({ email, redirectTo = null }: {
  email: string,
  redirectTo?: string | null
}) => {
  if (!!!email) throw new Error("Email is required");

  const existingUser = await getUserProfileByEmail(email);

  const newUserFlag = [!!!existingUser?.user, !!!existingUser?.error, existingUser?.user?.draft_status === 'draft'].some(Boolean);

  const emailRedirectTo = redirectTo ?? !!newUserFlag ? "/(auth)/(signup)/create-password" : getLinkingURL() ?? Linking.createURL("/(tabs)");

  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: emailRedirectTo,
      shouldCreateUser: true,
      data: {
        newUserFlag,
        invitedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7).toISOString(), // 1 week expiration
      },
    },
  });

  if (error) throw error;

  // Check if the user is new and needs to be created
  if (newUserFlag) {
    const newUserProfile = await getUserProfileByEmail(email) || null;
    //handle successful new user creation
    if (!!newUserProfile?.user?.user_id) {
      const templates = await getHouseholdAndInventoryTemplates();
      
    }
  }

  // Email sent.
  console.log("Email sent to: ", email, 'supabase response', { data, error });
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

/** Function to check if the user is authenticated using Supabase auth session
 * * Leverage @function supabase.auth.getSession() to check if the user is authenticated Reads the session (including access token and user info) from local storage (e.g. MMKV ).
 * @remarks more immediate than @function supabase.auth.getUser() (no network request) 
 * @remarks use for UI purposes or to check if the user is authenticated while in the app.
 * @remarks DO NOT USE FOR CRITICAL AUTH CHECKS, as it may not be up to date with the server state.
 * */

export const getAuthSession = async (
  userId?: string,
  setStorage?: (key: string, data: any) => void //optional function to update the db
): Promise<Session | null> => {
  //check if user is authenticated via supabase session
  const { data: { session }, error } = await supabase.auth.getSession();

  if ([
    !!error,// if errors
    !!!session, //if no session
    session?.user?.aud !== 'authenticated', //if aud (the auth state) of auth.users isn't authenticated
    userId && session?.user?.id !== userId,
  ].some(Boolean)) {
    console.error("Auth error =>", `${error?.message ?? " Error getting supabase auth session"}`);
    return null;
  }
  if (!!session && !!setStorage) {
    setStorage("auth", session);
  }

  return session
}

/** Simple utility auth function to check the current user is authenticated
 * 
 * @returns {Promise<Boolean>} - Returns true if the user is authenticated, false otherwise.
 */
export const getSupabaseAuthStatus = async (
  slowCheck: boolean = false,
  returnData: boolean = false
): Promise<Boolean | Partial<session>> => {
  // Fast check
  const { data: { session } } = await supabase.auth.getSession();
  if (!!!session || !!!session?.user) return false;

  // Check if the user is authenticated via supabase auth request and db call
  if (slowCheck) {
    // Secure check (optional, but recommended on app init)
    const [User, profile] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("profiles")
        .select()
        .eq("user_id", session.user.id)
        .single()
    ]
    );
    const authConditions = [
      !!User?.data?.user,
      User?.data?.user?.aud === 'authenticated',
      !!profile,
      !!profile?.data,
      ![profile?.data?.user_id,
      User?.data?.user?.id].includes(session?.user.id)
    ]

    return returnData ? authConditions.every(Boolean) : {
      user: {
        user_id: session.user.id,
        email: session.user.email,
        ...{
          ...(profile?.data ?? profile) ?? {}
        }
      },
      session: session
    };
  }
  // If the user is authenticated, return the session data if the option is set to true
  return !!returnData ?
    {
      user: {
        user_id: session.user.id,
        email: session.user.email,
      },
      session: session
    }
    : true;
};


export const authenticate = async (credentials: Partial<CombinedAuthCredentials> & {
  access_token?: string | null | undefined
  oauthProvider?: Provider | null | undefined;
  idToken?: string | null | undefined;
}) => {
  //throw error if no email is provided
  if (!isTruthy(credentials?.email)) {
    // if (!user || !credentials || !user.email) {
    console.error("authenticate() => Invalid credentials");
    throw new Error("Email is required");
  }

  // let authenticatedSession = undefined;
  // const {email } = credentials;
  // For redirecting to the app after authentication
  const options = {
    redirectTo: getLinkingURL() || Linking.createURL("/(tabs)"),
    ..."access_token" in credentials ? { access_token: credentials.access_token } : {},
  }
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
        // authenticatedSession = data;
      }
      if ("idToken" in credentials && typeof credentials.idToken === "string") {
        // Sign in with OAuth id token
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: credentials.oauthProvider ?? "google",
          token: credentials.idToken,

        });
        if (error) throw error;
        // authenticatedSession = data;
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
      // authenticatedSession = data;
    }
    // Return the authenticated session
  }
  // if (authenticatedSession) {
  //   // If the user is authenticated, return the session data
  //   console.log("Authenticated session:", authenticatedSession);
  //   return authenticatedSession;
  // }
  // If no credentials are provided, throw an error
  // throw new Error("Invalid credentials");

  // If the user is authenticated, return the session data
  return await getSupabaseAuthStatus(true, true) as Partial<session> | null;
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

//util function to create a UUID and hash it if required
export const generateUUID = async ({ options = {} }: {
  options: {
    hash?: boolean;
  }
}): Promise<{
  uuid: string;
  hashed?: string | null;
}> => {
  const newUUID = randomUUID();
  const hashed = !!options?.hash ? await hash(newUUID) : null;
  console.log("Generated UUID:", newUUID, "Hash:", hash);
  return { uuid: newUUID, hashed };
}