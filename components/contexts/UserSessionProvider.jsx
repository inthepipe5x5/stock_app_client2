import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { Platform } from "react-native";

import supabase from "@/lib/supabase/supabase";
// import defaultUserPreferences from "@/constants/userPreferences";
// import useSupabaseQuery from "../hooks/useSupabase";
import { isExpired, ensureSessionNotExpired } from "@/utils/isExpired";
import sessionReducer, { actionTypes } from "./sessionReducer";
import {
  fetchProfile,
  fetchUserAndHouseholds,
  fetchOverDueTasks,
  fetchSession,
  storeUserSession,
  existingUserCheck,
} from "@/lib/supabase/session";

const appName = "Home Scan"; //TODO: change this placeholder app name

import defaultSession from "@/constants/defaultSession";
import authenticate from "@/app/(auth)/(signin)/authenticate";
import { upsertUserProfile } from "@/lib/supabase/auth";
import { handleSuccessfulAuth } from "@/hooks/authOutcomes";
const { defaultUserPreferences } = defaultSession.preferences;

/** ---------------------------
 *  Sign In Logic (v1.2)
 *  ---------------------------
 *  TODO: Adjust for Supabase auth methods.
 */
const signIn = async ({
  email,
  password,
  access_token,
  idToken,
  oauthProvider,
  ...newUser
}) => {
  try {
    //guard clause
    if (
      !password ||
      password === null ||
      !access_token ||
      access_token === null ||
      !idToken ||
      idToken === null
    ) {
      throw new Error(
        "Either 'password' or 'access_token' with 'oauthProvider' must be provided"
      );
    }
    let oauth = {
      provider: oauthProvider || undefined,
      access_token: access_token || undefined,
      idToken: idToken || undefined,
    };
    let user = newUser ? newUser : { email, app_metadata: oauth };
    const { existingUser } = await existingUserCheck(email);

    if (existingUser) {
      user = { ...user, ...existingUser };
    }
    const credentials =
      password && password !== null ? { email, password } : oauth;
    //authenticate user
    const authenticatedSessionData = await authenticate(user, credentials);

    //upsert the user profile - update an existing public.profiles entry or create a new one
    const { data: signedInProfile, error: upsertError } = upsertUserProfile(
      user,
      authenticatedSessionData.user
    );
    if (upsertError && upsertError !== null) throw upsertError;
    //handle successful auth
    if (signedInProfile) {
      handleSuccessfulAuth(signedInProfile, authenticatedSessionData);
    }
  } catch (err) {
    console.error("Sign-in error:", err);
    //update state and redirect to login
    if (state) {
      dispatch({
        type: actionTypes.LOGOUT,
        payload: defaultSession,
      });
    }
    return router.replace("/(auth)/(signin)/authenticate");
  }
};
/** ---------------------------
 *  signOut helper
 *  ---------------------------
 */
async function signOut() {
  try {
    dispatch({ type: actionTypes.LOGOUT, payload: null });
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync(`${appName}_session`);
    await AsyncStorage.removeItem(`${appName}_session`);
    // router.replace("/(auth)/index");
  } catch (err) {
    console.error("Sign-out error:", err);
  }
}
/** ---------------------------
 *   Create React Context
 *  ---------------------------
 */
const UserSessionContext = createContext({
  state: defaultSession,
  isAuthenticated: false, // default to false; will be derived from state
  dispatch: ({ type, payload }) => {},
  signIn: (credentials) => {}, // accepts credentials for OAuth or password-based login
  signOut: () => {},
});

/** ---------------------------
 *  UserSessionProvider
 *  ---------------------------
 */

// Provider Component
export const UserSessionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(sessionReducer, defaultSession);
  //   const { theme, colors, updatePreferences } = useThemeContext();

  useEffect(() => {
    const initialize = async () => {
      console.log("Initializing session...");
      // const { data, error } = await supabase.auth.getSession();
      // const { data, error } = await fetchProfile({
      //   user_id: process.env.EXPO_PUBLIC_TEST_USER_ID,
      // });
      // console.log("Fetched profile:", data);

      const { session, profile } = (await fetchSession()) || null;
      //set session
      dispatch({ type: actionTypes.SET_SESSION, payload: session });
      //set user
      dispatch({ type: actionTypes.SET_USER, payload: profile });
      //set preferences
      dispatch({
        type: actionTypes.SET_PREFERENCES,
        payload: profile?.preferences ?? defaultUserPreferences,
      });
      if (profile?.preferences) {
        //update themeContext
        // updatePreferences(profile.preferences);
      }
      return { session: session ?? null, user: profile ?? null };
    };
    const { session: storedSession, profile } = initialize();
    console.log("Stored session:", storedSession);
    console.log("Stored user:", profile);

    //TODO:fix this listener
    const { data } = supabase.auth.onAuthStateChange(
      (event, session = storedSession) => {
        console.log("Supabase auth event:", event); //debugging
        if (
          session &&
          ["SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)
        ) {
          const user = fetchProfile({ user_id: session.user.id });
        }
        if (event === "SIGNED_IN") {
          dispatch({ type: actionTypes.SET_SESSION, payload: session });
        }
        if (["TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) {
          dispatch({ type: actionTypes.SET_SESSION, payload: session });
          if (profile) {
            // updatePreferences(session.user.preferences);
            dispatch({ type: actionTypes.SET_USER, payload: profile });
          }
        } else if (event === "SIGNED_OUT") {
          dispatch({ type: actionTypes.LOGOUT });
        }
      }
    );
    if (storedSession || state?.session) {
      // Auto refresh the supabase token when the app is active
      AppState.addEventListener("change", (state) => {
        if (state === "active") {
          supabase.auth.startAutoRefresh();
        } else {
          supabase.auth.stopAutoRefresh();
        }
      });
    }

    return () => data?.subscription?.unsubscribe() ?? null;
  }, []);

  const handleSignIn = useCallback(async (userCredentials) => {
    signIn(userCredentials, dispatch);
  }, []);

  const handleSignOut = useCallback(async () => {
    signOut(dispatch);
  }, []);
  //for debugging //TODO: remove
  console.log("USER SESSION CONTEXT:", UserSessionContext);
  return (
    <UserSessionContext.Provider
      value={{
        state,
        //authentication state => true if user and session are present
        isAuthenticated: !!state?.user && !!state?.session, //double ! to turn each value into a boolean
        dispatch,
        signIn: handleSignIn,
        signOut: handleSignOut,
        // theme,
        // colors,
      }}
    >
      {children}
    </UserSessionContext.Provider>
  );
};

/** ---------------------------
 *  useUserSession Hook
 *  ---------------------------
 */

// const isAuthenticated = !!state?.user && !!state?.session;

export function useUserSession() {
  return useContext(UserSessionContext);
}
