import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import * as SecureStore from "expo-secure-store";
import { RelativePathString, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from "@/lib/supabase/supabase";
import { useToast } from "@/components/ui/toast";
import { AlertTriangle, CheckCircle, Info, UserCheck2Icon, X } from "lucide-react-native";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import sessionReducer, { actionTypes, sessionDispatchFn } from "@/components/contexts/sessionReducer";
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
import defaultUserPreferences from "@/constants/userPreferences";
import isTruthy from "@/utils/isTruthy";
import { Appearance, Platform } from "react-native";
import appName from "@/constants/appName";
import { Session } from "@supabase/auth-js";
import { VStack } from "@/components/ui/vstack";
import { HelloWave } from "@/components/HelloWave";
import { getLinkingURL } from "expo-linking";


type signInUserDataType = {
  data?: Partial<userProfile> | undefined | null;
  continueSignUp?: boolean | undefined | null;
}
type baseSignInProps = {
  // dispatchFn: sessionDispatchFn,
  // dispatchFn: React.Dispatch<dispatchProps>,
  credentials: Partial<authenticationCredentials>,
  user?: signInUserDataType | null | undefined
};

export type signInWrapperFnProps = (
  credentials: Partial<authenticationCredentials>,
  user?: signInUserDataType
) => Promise<void>;

/** ---------------------------
 *   Create React Context
 *  ---------------------------
 */
type dispatchProps = {
  type: keyof typeof actionTypes;
  payload?: any | null | undefined;
};
const UserSessionContext = createContext<{
  state: typeof defaultSession;
  isAuthenticated: boolean;
  dispatch: sessionDispatchFn;
  // signIn: (credentials: baseSignInProps) => Promise<void>;
  // signOut: () => void;
  addMessage: (msg: Partial<UserMessage>) => void;
  showMessage: (msg: UserMessage) => void;
  clearMessages: () => void;
  welcomeNewUser: (userData?: any) => void;
  colorScheme: "system" | "light" | "dark";
}>({
  // signIn: async ({ credentials, newUser }: signInWrapperFnProps) => {
  //   const dispatch = () => { console.log("dispatch not set"); };
  //   return await signIn(dispatch, credentials, newUser);
  // }, // accepts credentials for OAuth or password-based login
  state: defaultSession,
  isAuthenticated: false, // default to false; will be derived from state
  dispatch: () => { },
  // signOut: () => { },
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const toast = useToast();


  useEffect(() => {
    const checkAuth = async () => {
      let clientSideAuthBoolean = !!state?.user?.user_id && !!state.session && state?.user?.draft_status !== "draft";

      let { data: serverSideAuth } = Platform.OS === "web" ?
        await supabase.auth.getUser() :
        await supabase.auth.getSession();

      setIsAuthenticated(clientSideAuthBoolean && !!serverSideAuth);
    };

    checkAuth();
  }, [state]);


  /**
   * Handle fetching user profile & household data after sign-in
   */
  const handleSuccessfulAuth = async (
    state: Partial<userProfile>, //session,
    session: Partial<Session> | Partial<session>,
    dispatchFn: sessionDispatchFn,
    dismissToURL?: string | RelativePathString | null
  ) => {
    try {
      if (!!!state || !!!session) {
        console.error("Invalid state or session data provided.", { state, session });
        return;
      };

      let nextUrl = dismissToURL ?? getLinkingURL() ?? "/(tabs)";
      //convert sets to arrays and sort by: household_id
      // const parsedHouseholds = Array.from(households);
      //update state
      dispatchFn({
        type: "SUCCESSFUL_LOGIN",
        payload: {
          user: state,
        },
      });
      //ccomment out for now because it's not working as intended
      // await storeUserSession({ session, user, households });

      showAuthOutcome(true, getLinkingURL() === "/(auth)/(signin)/authenticate", { path: nextUrl, params: {} }, undefined, state);
      //redirect to home page
      router.replace(nextUrl as RelativePathString);
    } catch (err) {
      console.error("Error post-sign-in:", err);
      handleAuthError({ error: err as Error });
      const dismissURL = getLinkingURL() ?? "/(tabs)";
      showAuthOutcome(false, false, undefined, err);
    }
  };

  /**
   * Handles authentication errors and displays appropriate messages.
   */
  const handleAuthError = ({ error }: {
    error: any; //Error | NativeModuleError;
  }) => {
    // if (error.code) {
    //   if (error.code === statusCodes.SIGN_IN_CANCELLED) {
    //     console.log("User cancelled the login process.");
    //     router.replace("/(auth)/(signin)");

    //   } else if (error.code === statusCodes.IN_PROGRESS) {
    //     console.log("Sign-in is already in progress.");
    //   } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    //     console.log("Google Play Services are not available or outdated.");
    //     // const auth = performWebOAuth(dispatch, "google");
    //   }
    // } else {
    console.error("Authentication error:", error, "redirecting and clearing session.");
    router.push("/(auth)/(signin)/authenticate");
    dispatch({ type: "CLEAR_SESSION", payload: null })
    handleSignOut();
    // }
    //show error toast
    showAuthOutcome(false, error);
  };

  const showAuthOutcome = (
    success: boolean = false,
    redirectNewUser: boolean = false,
    redirectProps?: {
      path: string | RelativePathString,
      params: any
    } | undefined | null,
    error?: any,
    currentUser?: Partial<userProfile> | undefined | null,
    toastProps?: { duration: number, placement: "bottom right" } | undefined | null,
    buttonProps?: { text: string, [key: string]: any } | undefined | null,
  ) => {
    const toast = useToast();
    if (success && !redirectNewUser) {
      toast.show({
        duration: toastProps?.duration ?? 5000,
        placement: toastProps?.placement ?? "bottom right",
        onCloseComplete: () => {
          router.push(
            {
              pathname: (redirectProps?.path ?? "/(tabs)") as RelativePathString,
              params: redirectProps?.params ?? {},
            }
          )
        },
        render: ({ id }) => (
          <Toast nativeID={id} variant="outline" action="success">
            <VStack space="xs">
              <HStack space="xs">
                <HelloWave />
                <ToastTitle className="text-indicator-success">
                  Authentication Successful
                </ToastTitle>
              </HStack>

              <ToastDescription>
                Welcome back! You are now signed in as{" "}
                {currentUser?.name ?? "Existing User"}.
              </ToastDescription>
            </VStack>
          </Toast>
        ),
      });
    } else if (success && redirectNewUser) {
      toast.show({
        duration: toastProps?.duration ?? 5000,
        placement: toastProps?.placement ?? "bottom right",
        onCloseComplete: () => {
          router.push(
            {
              pathname: (redirectProps?.path ?? "/(auth)/(signin)/authenticate") as RelativePathString,
              params: redirectProps?.params ?? {},
            }
          )
        },
        render: ({ id }) => (
          <Toast nativeID={id} variant="outline" action="success">
            <VStack space="xs">
              <UserCheck2Icon size={24} />
              < ToastTitle className="text-indicator-success" >
                Welcome New User!
              </ToastTitle >
              <ToastDescription className="text-indicator-success">
                Please set up your profile to continue.
              </ToastDescription>
            </VStack >
          </Toast >
        ),
      });
    } else {
      toast.show({
        duration: toastProps?.duration ?? 10000,
        placement: toastProps?.placement ?? "bottom right",
        onCloseComplete: () => {
          router.push(
            {
              pathname: (redirectProps?.path ?? "/(auth)/(signin)/authenticate") as RelativePathString,
              params: redirectProps?.params ?? {},
            }
          )
        },
        render: ({ id }) => (
          <Toast nativeID={id} variant="outline" action="error">
            <HStack space="xs">
              <AlertTriangle size={24} />
              <ToastTitle className="text-indicator-error">
                Uh oh. Something went wrong.{" "}
              </ToastTitle>
              <ToastDescription className="text-indicator-error">
                {error?.message || "An error occurred."}
              </ToastDescription>
              <Button
                onPress={() => router.push((redirectProps?.path ?? "/(auth)/(signin)/authenticate") as RelativePathString)}
                variant="outline"
                action="primary"
                size="sm"
                className="ml-5"
                {...buttonProps}
              >
                <ButtonText>{buttonProps?.text ?? "Try again"}</ButtonText>
              </Button>
            </HStack>
          </Toast>
        ),
      });
    }
  };


  /** ---------------------------
   *   Sign In Logic (v1.2)
   *  ---------------------------
   *
   */
  const handleSignIn = useCallback(async ({ credentials, user }: baseSignInProps) => {
    const { continueSignUp, data: newUser } = user ?? {};

    //guard clause
    if (!isTruthy(credentials)) {
      throw new Error(
        "Either 'password' or 'access_token' with 'oauthProvider' must be provided"
      );
    }
    try {

      const authenticatedSessionData = await authenticate(credentials);

      if (
        ["url", "provider"].every((key) =>
          authenticatedSessionData && Object.keys(authenticatedSessionData).includes(key)
        )
      ) {
      }
      let signedInProfile: userProfile | null = null;
      if (
        isTruthy(newUser) &&
        authenticatedSessionData &&
        ["user", "session"].every((key) =>
          Object.keys(authenticatedSessionData).includes(key)
        )
      ) {
        //upsert the user profile - update an existing public.profiles entry or create a new one
        signedInProfile = await upsertUserProfile(
          newUser ?? {},
          "user" in authenticatedSessionData ? authenticatedSessionData.user : {}
        ) as userProfile;
      }
      //handle successful auth
      if (
        signedInProfile &&
        authenticatedSessionData &&
        "user" in authenticatedSessionData
      ) {
        const { user: authUser, session: authSession } = authenticatedSessionData;
        handleSuccessfulAuth(
          signedInProfile,
          { ...authUser, ...authSession },
          dispatch
        );
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      return router.replace("/(auth)/(signin)/authenticate");
    }
  }, []);

  /** ---------------------------
  *  signOut helper
  *  ---------------------------
  */
  const handleSignOut = useCallback(async () => {
    try {
      dispatch({ type: actionTypes.LOGOUT, payload: defaultSession });
      await supabase.auth.signOut();
      await SecureStore.deleteItemAsync(`${appName}_session`);
      await AsyncStorage.removeItem(`${appName}_session`);
      // router.replace("/(auth)/index");
    } catch (err) {
      console.error("Sign-out error:", err);
    }
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
                  // callToAction
                  msg?.ToastCallToAction
                    ? msg?.ToastCallToAction
                    : defaultCallToAction(id, msg)
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
    toast.closeAll();
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



  const contextValue = {
    state: state ?? defaultSession,
    isAuthenticated: useMemo(() => isAuthenticated, [state, isAuthenticated]),
    dispatch,
    signOut: handleSignOut,
    signIn: (credentials: baseSignInProps) => handleSignIn(credentials),
    addMessage: useCallback(addMessage, []),
    showMessage: useCallback(showMessage, []),
    clearMessages: useCallback(clearMessages, []),
    welcomeNewUser: useCallback(welcomeNewUser, []),
    showAuthOutcome: useCallback(showAuthOutcome, []),
    colorScheme: useMemo(() => {
      const userPreferences =
        state?.user?.preferences ?? defaultUserPreferences;
      const theme = isTruthy(userPreferences?.theme)
        ? userPreferences.theme
        : "system";
      return theme === "system"
        ? Appearance.getColorScheme() ?? "light"
        : theme;
    }, [state?.user, state?.user?.preferences]),
  };

  return (
    <UserSessionContext.Provider
      value={contextValue}>
      {children}
    </UserSessionContext.Provider>
  );
};

/** ---------------------------
 *  useUserSession Hook
 *  ---------------------------
* Custom hook to consume the UserSessionContext
* @returns {UserSessionContext} - The UserSessionContext object
 */

export function useUserSession() {
  // console.log("current global session hook:", { state: useContext(UserSessionContext).state });

  const globalContext = useContext(UserSessionContext);
  if (!!!globalContext) {
    throw new Error("useUserSession must be used within a UserSessionProvider");
  } else if (!!!globalContext.state) {
    // If the global context does not have a state, log an error message
    console.error("No global session state found in context. Returning default session", { globalContext });
    // Set the state to defaultSession if it's not set
    // This is a fallback to ensure that the context always has a valid state
    globalContext.state = defaultSession;
    globalContext.isAuthenticated = false;
  }
  return globalContext;
}
