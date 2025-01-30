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
import isExpired from "@/utils/isExpired";
import sessionReducer from "./sessionReducer";
import {
  fetchProfile,
  fetchUserHouseholds,
  fetchOverDueTasks,
} from "@/lib/supabase/session";

const appName = "Home Scan"; //TODO: change this placeholder app name

const defaultSession = {
  user: null,
  preferences: defaultUserPreferences,
  token: null,
  session: null,
  drafts: [],
  households: {}, // {household_id: {household_data}}
  active_inventories: [], //list of inventories within active household
  // active_tasks: [],
};
/**
   * The function ensureSessionNotExpired checks if a session is still active.
   * @param {object} sessionData - Supabase session object
   * @example {object} - sessionData{
    "session": {
      "access_token": "your_access_token",
      "expires_at": 1234567890, //time in seconds since Unix Epoch
      "user": {
        "id": "user_id",
        "email": "user_email",
        "created_at": "timestamp",
        "updated_at": "timestamp",
        // other user fields
      }
    }
  }
    @returns {boolean} - true if session is fresh; false by default 
   */
const ensureSessionNotExpired = (sessionData) => {
  if (!sessionData || sessionData === null) return false;

  const findExpiryDate = (obj) => {
    if (typeof obj !== "object" || obj === null) return null;

    const keys = [
      "expires_at",
      "expiresAt",
      "expiry",
      "expiry_date",
      "expiryDate",
    ];
    for (const key of keys) {
      if (obj.hasOwnProperty(key)) {
        return obj[key];
      }
    }

    for (const key in obj) {
      if (typeof obj[key] === "object") {
        const result = findExpiryDate(obj[key]);
        if (result !== null) return result;
      }
    }

    return null;
  };

  const expiry = findExpiryDate(sessionData);
  return !expiry || expiry === null ? !isExpired(expiry) : false;
};

const actionTypes = Object.freeze({
  SET_SESSION: "SET_SESSION",
  SET_USER: "SET_USER",
  SET_PREFERENCES: "SET_PREFERENCES",
  LOGOUT: "LOGOUT",
});

/** ---------------------------
   *  Helper: Storing the session
   *  ---------------------------
  *  Stores the user session in the secure store if mobile else as a cookie if a web browser.
  *  @param {Object} sessionObj - The session object to store. 
    
  * NOTE: storing the entire user session for simplicity.
  */
async function storeUserSession(sessionObj) {
  if (typeof window !== "undefined" && Platform.OS === "web") {
    document.cookie = `${appName}_session=${JSON.stringify(
      sessionObj
    )}; path=/;`;
  } else {
    await SecureStore.setItemAsync(
      `${appName}_session`,
      JSON.stringify(sessionObj)
    );
  }
}

/** ---------------------------
 *   HELPER: Fetch Session
 *  ---------------------------
 *  Restores user session from
 *  AsyncStorage if available.
 * Fetch and initialize session.
 * Combines fetching session logic and ensures the session is not expired.
 * Fetches user profile if session is valid.
 */
const fetchSession = async () => {
  try {
    let storedSession;
    if (typeof window !== "undefined" && Platform.OS === "web") {
      const cookies = document.cookie.split("; ");
      const sessionCookie = cookies.find((cookie) =>
        cookie.startsWith(`${appName}_session`)
      );
      if (sessionCookie) {
        storedSession = sessionCookie.split("=")[1];
        console.log("Stored session (is cookie):", storedSession);
      }
    } else {
      storedSession = await SecureStore.getItemAsync(`${appName}_session`);
      console.log("Stored session:", storedSession);
    }
    //handle stored session found
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      //check if session is expired
      if (ensureSessionNotExpired(parsedSession)) {
        const userProfile = await fetchProfile(parsedSession.user.id);
        return {
          ...parsedSession,
          user: { ...parsedSession.user, profile: userProfile },
        };
      } else {
        //handle no session found
        console.warn("Stored session expired.");
        return { profile: null, session: null };
      }
    }

    const { data, error } = await supabase.auth.getSession();

    if (error || !data?.session || !ensureSessionNotExpired(data.session)) {
      console.warn("Supabase session expired or invalid.");
      return defaultSession;
    }

    await storeUserSession({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: data.session.user,
    });

    const userProfile = await fetchProfile(data.session.user.id);
    return {
      ...data.session,
      user: { ...data.session.user, profile: userProfile },
    };
  } catch (error) {
    console.error("Error fetching session:", error);
    return defaultSession;
  }
};

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
      router.push("/home");
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
      const { session, profile } = await fetchSession();
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
