/**Supabase Auth Functions
 * Source: https://supabase.com/docs/guides/auth/native-mobile-deep-linking?utm_source=expo&utm_medium=referral&utm_term=expo-react-native
 * 
 */

import * as AuthSession from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import supabase from "@/lib/supabase/supabase";
import { authProviders } from "@/constants/oauthProviders";
import { Platform } from "react-native";
import { existingUserCheck } from "@/lib/supabase/session";
import { userProfile, app_metadata, authSetupData } from "@/constants/defaultSession";
import { getLinkingURL } from "expo-linking";
import { AuthUser, SignInWithIdTokenCredentials, SignInWithOAuthCredentials, SignInWithPasswordCredentials, SignInWithPasswordlessCredentials } from "@supabase/supabase-js";
import { fakeUserAvatar } from "../placeholder/avatar";
import defaultUserPreferences from "@/constants/userPreferences";
import { date } from "zod";


type Provider = "google" | "facebook" | "apple";
// type Provider = keyof typeof authProviders["SOCIAL"];

WebBrowser.maybeCompleteAuthSession(); // required for web only to close the browser after redirect
const url = Linking.useURL();

//I THINK THIS NEEDS TO BE ARCHIVED
const createSessionFromUrl = async (url: string) => {
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


const sendMagicLink = async (email:string) => {
    if (!email) throw new Error("Email is required");

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
  
    if (error ) throw error;
    // Email sent.
    console.log("Email sent to: ", email);
    //TODO later: show toast message or alert to user
  };

  const performWebOAuth = async (dispatch: ({ type, payload }: { type: any; payload: any; }) => void, provider: string) => {
    const redirectUrl = AuthSession.makeRedirectUri({
      scheme: ".com.supabase.stockapp/**",
      path: "/(tabs)",
      preferLocalhost: Platform.OS === "ios",
    });
    
    AuthSession.useAuthRequest({
      config: {
        provider
      },
    });


    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: redirectUrl ?? "/(tabs)",
        skipBrowserRedirect: true,
      },
    });


  //handle error
    if (error) {
      console.error("Error signing in with OAuth:", error.message);
      throw error};

      //assuming OAUTH login is successful & data is not null
      //handle success by closing the popup browser window
      Platform.OS === "web" ?WebBrowser.maybeCompleteAuthSession() : null;
      const result = await AuthSession.promptAsync({ authUrl: data.url });
      //set session
      await supabase.auth.setSession({ access_token: result.params.access_token, refresh_token: result.params.refresh_token });
    // if (data?.url) {
    //   const result = await AuthSession.startAsync({ authUrl: data.url });
    //   if (result.type === "success") {
    //     // Send tokens to your backend
    //     await (result.params.access_token, result.params.refresh_token);
    //     // Your backend handles session creation and returns necessary info
    //     // You can then update your app's state accordingly
    //   }
    // }
  };

  export { createSessionFromUrl, sendMagicLink, performWebOAuth };

const checkValidEmail = async (email: string) => {
  if (!email) throw new Error("Email is required");

const resp = await existingUserCheck(email); 

  if (resp && resp.error !== null) return false
  
  return true;
}

type authenticationCredentials = {
  email: string;
  password: string;
} | {
  oauthProvider: Provider;
  access_token?: string | undefined;
  idToken: string;
} | {
  oauthProvider: Provider;
  idToken: string;
} 
// SignInWithIdTokenCredentials | SignInWithOAuthCredentials | SignInWithPasswordCredentials | SignInWithPasswordlessCredentials;

export const authenticate = async (user: userProfile, credentials: authenticationCredentials) => {
  // Do nothing if either user or credentials are not provided
  if (!user || !credentials || !user.email) {
      return;
  }

  let authenticatedSession = undefined;

  // For redirecting to the app after authentication
  const options = {
      redirectTo: getLinkingURL() || "com.supabase.stockapp://(tabs)",
      access_token: "access_token" in credentials ? credentials.access_token : undefined,
  }

  // Check if the email is valid
  
  let validEmail = checkValidEmail(user.email);
  if (!validEmail) {
      console.error("authenticate() => Invalid email");
      throw new Error("Invalid email");
  }

  if (credentials && credentials !== null) {

      // Handle OAuth sign in
      if ("oauthProvider" in credentials) {
          if ("access_token" in credentials) {
              // Sign in with OAuth access token
              const { data, error } = await supabase.auth.signInWithOAuth({
                  provider: credentials.oauthProvider,
                  // access_token: credentials.access_token,
                  options,
              });
              if (error) throw error;
              authenticatedSession = data;
          }
          if ("idToken" in credentials) {
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
      if ("password" in credentials) {
          // Sign in with email and password
          const { data, error } = await supabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
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

// Takes a user object (public.profiles table) and AuthUser object (supabase auth) and updates the user profile in the database
export const upsertUserProfile = async (user: userProfile, authUser: AuthUser) => {
  if (!user || !user.email) return;
  const {app_metadata: existingAppMetaData} = user || {}

  // Convert null values to undefined in the user object
  const sanitizedUser = Object.fromEntries(
    Object.entries(user).map(([key, value]) => [key, value === null ? undefined : value])
  );

  // Set up the updated app_metadata object
  let updatedAppMetadata = {
    setup: {
      email: sanitizedUser.email || authUser.email ? true : false,
      authenticationMethod: authUser.last_sign_in_at ? true : false,
      account: Object.values(user).some(value => !value || value === null),
      details: Object.values(user).some(value => !value || value === null),
      preferences: sanitizedUser.preferences && ![null, {}].includes(sanitizedUser.preferences) ? true : false,
    } as authSetupData,
    //spread existing app_metadata
    ...existingAppMetaData,

    //spread existing authMetaData
    authMetaData: {
      app: authUser.app_metadata,
      user: authUser.user_metadata,
    },
    provider: authUser?.app_metadata?.provider ?? undefined,
    avatar_url: (existingAppMetaData && "avatar_url" in existingAppMetaData)? existingAppMetaData.avatar_url : fakeUserAvatar({ name: sanitizedUser.name, size: 100, fontColor: "black", avatarBgColor: "light" }), // Default avatar
  } as app_metadata;

  // Set the created_at timestamp if public.profiles.created_at !== authUser.created_at
  const created_at = sanitizedUser.created_at !== authUser.created_at 
    ?  authUser.created_at || sanitizedUser.created_at 
    : sanitizedUser.created_at;
  
  const combinedUser = {
    //default values to be overridden by user object 
    preferences:  sanitizedUser.preferences || defaultUserPreferences,
    ...user,
    created_at: created_at || new Date().toISOString(),
    app_metadata: updatedAppMetadata,
  };

  // Upsert the user profile
  return await supabase
    .from('profiles')
    .upsert(combinedUser, { 
      onConflict: 'user_id,email', //Comma-separated UNIQUE column(s) to specify how duplicate rows are determined. Two rows are duplicates if all the onConflict columns are equal.
      ignoreDuplicates: false, //set false to merge duplicate rows
     })
    .select()
    .limit(1);

};