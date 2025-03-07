import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from "@/lib/supabase/supabase";
import { useToast } from "@/components/ui/toast";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react-native";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonIcon } from "@/components/ui/button";

import sessionReducer, { actionTypes } from "./sessionReducer";
import { getUserProfileByEmail } from "@/lib/supabase/session";

import defaultSession, {
  session,
  UserMessage,
  userProfile,
} from "@/constants/defaultSession";
import { upsertUserProfile } from "@/lib/supabase/session";
import {
  authenticate,
  authenticationCredentials,
} from "@/lib/supabase/auth";
import { handleSuccessfulAuth } from "@/hooks/authOutcomes";
import { AuthSession, AuthUser } from "@supabase/supabase-js";
import defaultUserPreferences from "@/constants/userPreferences";
import isTruthy from "@/utils/isTruthy";
import { Appearance } from "react-native";

const appName = "Home Scan"; //TODO: change this placeholder app name
/** ---------------------------
 *   Sign In Logic (v1.2)
 *  ---------------------------
 *
 */
export type signInProps = {
  dispatch: React.Dispatch<dispatchProps>,
  credentials: Partial<authenticationCredentials>,
  newUser: Partial<userProfile> | undefined
};

const signIn = async (
  dispatch: React.Dispatch<dispatchProps>,
  credentials: Partial<authenticationCredentials>,
  newUser: Partial<userProfile> | undefined
) => {
  //guard clause
  if (!isTruthy(credentials)) {
    throw new Error(
      "Either 'password' or 'access_token' with 'oauthProvider' must be provided"
    );
  }
  try {
    // let oauth = {
    //   ...((credentials?.oauthProvider && {
    //     oauthProvider: credentials.oauthProvider,
    //   }) ||
    //     {}),
    //   ...((credentials?.access_token && {
    //     access_token: credentials.access_token,
    //   }) ||
    //     {}),
    //   ...((credentials?.idToken && { idToken: credentials.idToken }) || {}),
    // };
    // let user = newUser ? newUser : { email, app_metadata: oauth };
    // const existingUser = await getUserProfileByEmail(email || "");

    // if (isTruthy(existingUser?.existingUser)) {
    //   user = { ...user, ...existingUser };
    // }
    // const credentials =
    //   password && password !== null ? { email, password } : oauth;
    //authenticate user
    const authenticatedSessionData = await authenticate(credentials);

    if (
      ["url", "provider"].every((key) =>
        Object.keys(authenticatedSessionData).includes(key)
      )
    ) {
    }

    if (
      isTruthy(newUser) &&
      authenticatedSessionData &&
      ["user", "session"].every((key) =>
        Object.keys(authenticatedSessionData).includes(key)
      )
    ) {
      //upsert the user profile - update an existing public.profiles entry or create a new one
      const { data: signedInProfile, error: upsertError } = await upsertUserProfile(
        newUser,
        authenticatedSessionData.user
      );
    }
    if (upsertError && upsertError !== null) throw upsertError;
    //handle successful auth
    if (
      signedInProfile &&
      authenticatedSessionData &&
      "user" in authenticatedSessionData
    ) {
      const { user: authUser, session: authSession } = authenticatedSessionData;
      handleSuccessfulAuth(
        signedInProfile,
        { user: authUser, session: authSession },
        dispatch
      );
    }
  } catch (err) {
    console.error("Sign-in error:", err);
    //update state and redirect to login
    // if (state) {
    //   dispatch({
    //     type: actionTypes.LOGOUT,
    //     payload: defaultSession,
    //   });
    // }
    return router.replace("/(auth)/(signin)/authenticate");
  }
};
/** ---------------------------
 *  signOut helper
 *  ---------------------------
 */
async function signOut(dispatch: React.Dispatch<dispatchProps>) {
  try {
    dispatch({ type: actionTypes.LOGOUT, payload: defaultSession });
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
type dispatchProps = {
  type: keyof typeof actionTypes;
  payload?:
  | Object
  // | (AuthSession &
  //     Partial<session> &
  //     Partial<sessionDrafts> &
  //     Partial<userProfile> &
  //     Partial<household>[] &
  //     Partial<inventory>[] &
  //     Partial<task>[] &
  //     Partial<product>[] &
  //     Partial<UserMessage>[] &
  //     Partial<userPreferences>)
  // | null
  | undefined;
};
const UserSessionContext = createContext<{
  state: typeof defaultSession;
  isAuthenticated: boolean;
  dispatch: React.Dispatch<dispatchProps>;
  signIn: (credentials: signInProps) => Promise<void>;
  signOut: (dispatch: React.Dispatch<dispatchProps>) => void;
  addMessage: (msg: Partial<UserMessage>) => void;
  showMessage: (msg: UserMessage) => void;
  clearMessages: () => void;
  welcomeNewUser: (userData?: any) => void;
  colorScheme: "system" | "light" | "dark";
}>({
  state: defaultSession,
  isAuthenticated: false, // default to false; will be derived from state
  dispatch: () => { },
  signIn: async (credentials: signInProps) => { }, // accepts credentials for OAuth or password-based login
  signOut: () => { },
  addMessage: () => { },
  showMessage: () => { },
  clearMessages: () => { },
  welcomeNewUser: () => { },
  colorScheme: "system",
});

/** ---------------------------
 *  UserSessionProvider
 *  ---------------------------
 */

// Provider Component
export const UserSessionProvider = ({ children }: any) => {
  const [state, dispatch] = useReducer(sessionReducer, defaultSession);
  const toast = useToast();

  // useEffect(() => {

  //   const { session: storedSession, user: profile } = initialize();
  //   console.log("Stored session:", storedSession);
  //   console.log("Stored user:", profile);

  //   //TODO:fix this listener
  //   const { data } = supabase.auth.onAuthStateChange(
  //     (event, session = storedSession) => {
  //       console.log("Supabase auth event:", event); //debugging
  //       if (
  //         session &&
  //         ["SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)
  //       ) {
  //         const user = fetchProfile({
  //           searchKey: "user_id",
  //           searchKeyValue: session.user.id,
  //         }).then((res) => (isTruthy(res && isTruthy(res[0])) ? res[0] : null));
  //       }
  //       if (event === "SIGNED_IN") {
  //         dispatch({ type: actionTypes.SET_SESSION, payload: session });
  //       }
  //       if (["TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) {
  //         dispatch({ type: actionTypes.SET_SESSION, payload: session });
  //         if (profile) {
  //           // updatePreferences(session.user.preferences);
  //           dispatch({ type: actionTypes.SET_USER, payload: profile });
  //         }
  //       } else if (event === "SIGNED_OUT") {
  //         dispatch({ type: actionTypes.LOGOUT });
  //       }
  //     }
  //   );
  //   if (storedSession || state?.session) {
  //     // Auto refresh the supabase token when the app is active
  //     AppState.addEventListener("change", (state) => {
  //       if (state === "active") {
  //         supabase.auth.startAutoRefresh();
  //       } else {
  //         supabase.auth.stopAutoRefresh();
  //       }
  //     });
  //   }

  //   return () => data?.subscription?.unsubscribe() ?? null;
  // }, []);

  const handleSignIn = useCallback(async (userCredentials: signInProps) => {
    signIn(dispatch, userCredentials, (state.user ?? {}));
  }, []);

  const handleSignOut = useCallback(async () => {
    signOut(dispatch);
  }, []);

  /** {@function addMessage}
   *  ---------------------------
   * Adds a new message (error, info, or success) to global messages state.
   * @param {UserMessage} msg - The message to add.
   * @returns {void}
   *
   * @remarks
   * - The `addMessage` function is used to add a new message to the global messages state.
   *
   * @example
   * addMessage({ type: "error", title: "Error", description: "An error occurred." });
   */
  const addMessage = useCallback((msg: Partial<UserMessage>): void => {
    msg["id"] = isTruthy(msg.id)
      ? msg.id
      : `${new Crypto().getRandomValues(new Uint32Array(1))[0]}`;
    dispatch({ type: actionTypes.SET_MESSAGE, payload: msg });
    console.info(
      `Added <${msg.type ?? "info"}> message:`,
      msg?.description ?? msg
    );
  }, []);

  /** {@function showMessage}
   *  ---------------------------
   * Displays a new message (error, info, or success) using toasts.
   */
  const showMessage = useCallback((msg: UserMessage) => {
    let icon: JSX.Element | null = null;
    let variant: "solid" | "outline" | "subtle" = "solid";

    switch (msg.type) {
      case "error":
        icon = <AlertTriangle size={20} />;
        variant = "solid";
        break;
      case "info":
        icon = <Info size={20} />;
        variant = "outline";
        break;
      case "success":
        icon = <CheckCircle size={20} />;
        variant = "solid";
        break;
    }

    /* The `defaultCallToAction` function is defining a default call to action button that can be used
       in the toast message. It creates a Button component with specific styling based on the type of
       message (error, info, success). */
    const defaultCallToAction = (id: any, msg: UserMessage) => (
      <Button
        className="ml-safe-or-5"
        variant={msg.type === "error" ? "outline" : "solid"}
        action={msg.type === "error" ? "negative" : "primary"}
        size="sm"
        onPress={() => {
          if (msg.onDismiss) {
            // If user provided an onDismiss
            msg.onDismiss();
          } else {
            // Close the toast
            toast.close(id);
          }
          // Also remove from local messages array
          console.log("removing message", msg);
          dispatch({
            type: actionTypes.REMOVE_MESSAGE,
            payload: msg,
          });
        }}
      >
        <ButtonIcon as={X} size="sm" />
      </Button>
    );

    toast.show({
      placement: "bottom right",
      duration: msg.duration ?? 5000,
      avoidKeyboard: true,
      render: ({ id }) => {
        // conditionally render custom CTA
        let callToAction = msg?.ToastCallToAction
          ? msg?.ToastCallToAction
          : defaultCallToAction(id, msg);
        return (
          <Toast nativeID={id} variant={variant} action={msg.type}>
            <ToastTitle>
              <HStack className="flex-1" space="sm">
                {icon}
                {msg.title ?? msg.type.toUpperCase() ?? "Message"}
              </HStack>
            </ToastTitle>
            {msg.description && (
              <HStack>
                <ToastDescription>{msg.description}</ToastDescription>
                {
                  //custom CTA rendered here
                  callToAction
                }
              </HStack>
            )}
          </Toast>
        );
      },
    });
    // add message to local state
    dispatch({ type: actionTypes.SET_MESSAGE, payload: msg });
  }, []);

  /**
   * Clears local messages if needed.
   */
  const clearMessages = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_MESSAGES });
  }, []);

  /**
   *  welcomeNewUser method
   */
  const welcomeNewUser = useCallback(
    (userData?: any) => {
      showMessage({
        id: `${userData.user_id ??
          new Crypto().getRandomValues(new Uint32Array(1))[0]
          }`,
        type: "info",
        title: isTruthy(userData)
          ? `Welcome ${userData.name ??
          [userData.first_name, userData.last_name].join(" ")
          }!`
          : "user profile not completed yet",
        description: JSON.stringify(userData),
      });
    },
    [showMessage]
  );

  return (
    <UserSessionContext.Provider
      value={{
        state,
        //authentication state => true if user and session are present
        isAuthenticated: useMemo(
          () => (Object.values(state).some(isTruthy) && state?.user?.draft_status !== "draft") ?? false,
          [state]
        ),
        dispatch,
        signIn: handleSignIn,
        signOut: handleSignOut,
        // theme,
        signIn: (credentials: signInProps) => handleSignIn(credentials),
        addMessage,
        showMessage,
        clearMessages,
        welcomeNewUser,
        colorScheme: useMemo(() => {
          const userPreferences =
            state?.user?.preferences ?? defaultUserPreferences;
          const theme = isTruthy(userPreferences?.theme)
            ? userPreferences.theme
            : "system";
          return theme === "system"
            ? Appearance.getColorScheme() ?? "light"
            : theme;
        }, [state]),
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
