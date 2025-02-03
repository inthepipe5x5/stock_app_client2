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
import defaultUserPreferences from "@/constants/userPreferences";
// import useSupabaseQuery from "../hooks/useSupabase";
import { isExpired, ensureSessionNotExpired } from "@/utils/isExpired";
import sessionReducer from "./sessionReducer";
import {
  fetchProfile,
  fetchUserHouseholds,
  fetchOverDueTasks,
  fetchSession,
  storeUserSession,
} from "@/lib/supabase/session";

const appName = "Home Scan"; //TODO: change this placeholder app name

const defaultSession = {
  user: null,
  preferences: defaultUserPreferences,
  token: null,
  session: null,
  drafts: [],
  households: {}, // {household_id: {household_data}}
  inventories: {}, //obj of inventories within each household_id key
  products: {}, //obj of products within each household_id-inventory_id composite key
  tasks: {}, //obj of tasks within each household_id key
};

const actionTypes = Object.freeze({
  SET_SESSION: "SET_SESSION",
  SET_USER: "SET_USER",
  SET_PREFERENCES: "SET_PREFERENCES",
  LOGOUT: "LOGOUT",
});

/** ---------------------------
 *  Sign In Logic (v1.2)
 *  ---------------------------
 *  Adjust for your version of
 *  Supabase auth methods.
 */
const signIn = async (
  { email, password, access_token, oauthProvider },
  dispatch
) => {
  try {
    let data, error;
    if (access_token && oauthProvider) {
      // OAuth-based sign-in
      const { data: oauthData, error: oauthError } =
        await supabase.auth.signInWithOAuth({
          provider: oauthProvider,
          access_token,
        });
      data = oauthData;
      error = oauthError;
    } else if (password) {
      // Password-based sign-in
      const { data: passwordData, error: passwordError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });
      data = passwordData;
      error = passwordError;
    } else {
      throw new Error(
        "Either 'password' or 'access_token' with 'oauthProvider' must be provided"
      );
    }
    if (error) {
      console.error("Sign-in error:", error.message);
      return router.push("/login");
    }
    if (data.session) {
      await storeUserSession(data.session);
      dispatch({ type: actionTypes.SET_SESSION, payload: data.session });
      //reroute user to home page
      router.replace("/(tabs)/index");
    }
  } catch (err) {
    console.error("Sign-in error:", err);
    router.push("/login");
  }
};
/** ---------------------------
 *  signOut helper
 *  ---------------------------
 */
async function signOut(dispatch) {
  try {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync(`${appName}_session`);
    dispatch({ type: actionTypes.LOGOUT });
    router.replace("(auth)/index");
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
  dispatch: () => {},
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
    // const { data: subscription } = supabase.auth.onAuthStateChange(
    //   (event, session = storedSession) => {
    //     if (["SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) {
    //       dispatch({ type: actionTypes.SET_SESSION, payload: session });
    //       if (profile) {
    //         // updatePreferences(session.user.preferences);
    //         dispatch({ type: actionTypes.SET_USER, payload: profile });
    //       }
    //     } else if (event === "SIGNED_OUT") {
    //       dispatch({ type: actionTypes.LOGOUT });
    //     }
    //   }
    // );
    if (storedSession) {
      // Auto refresh the supabase token when the app is active
      AppState.addEventListener("change", (state) => {
        if (state === "active") {
          supabase.auth.startAutoRefresh();
        } else {
          supabase.auth.stopAutoRefresh();
        }
      });
    }

    // return () => subscription?.unsubscribe();
  }, []);

  const handleSignIn = useCallback((userCredentials) => {
    signIn(userCredentials, dispatch);
  }, []);

  const handleSignOut = useCallback(() => {
    signOut(dispatch);
  }, []);

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
  return useContext({ UserSessionContext });
}
