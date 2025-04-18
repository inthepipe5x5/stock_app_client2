import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import * as SecureStore from "expo-secure-store";
import { RelativePathString, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from "@/lib/supabase/supabase";
import { RealtimePresenceJoinPayload, RealtimeChannel, RealtimeChannelOptions, RealtimeChannelSendResponse, RealtimePostgresChangesFilter, RealtimePostgresInsertPayload, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { useToast } from "@/components/ui/toast";
import { AlertTriangle, CheckCircle, Eye, Info, MailboxIcon, UserCheck2Icon, X } from "lucide-react-native";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import sessionReducer, { actionTypes, sessionDispatchFn } from "@/components/contexts/sessionReducer";
import defaultSession, {
  session,
  UserMessage,
  userProfile,
} from "@/constants/defaultSession";
import { fetchUserAndHouseholds, getProfile, upsertNonUserResource, upsertUserProfile } from "@/lib/supabase/session";
import {
  authenticate,
  authenticationCredentials,
} from "@/lib/supabase/auth";
import defaultUserPreferences from "@/constants/userPreferences";
import isTruthy from "@/utils/isTruthy";
import { Appearance, AppState, Platform } from "react-native";
import appName from "@/constants/appName";
import { AuthChangeEvent, Session, Subscription } from "@supabase/auth-js";
import { VStack } from "@/components/ui/vstack";
import { HelloWave } from "@/components/HelloWave";
import { getLinkingURL } from "expo-linking";
import { ToastComponentProps, ToastPlacement } from "@gluestack-ui/toast/lib/types";
import { formatDatetimeObject } from "@/utils/date";
import { setAbortableTimeout } from "@/hooks/useDebounce";
import { useQueryClient } from "@tanstack/react-query";
import useSupabaseSession from "@/hooks/useSupabaseSession";

type captchaToken = {
  token: string | null | undefined;
  created_dt: string | null | undefined;
}

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
  const [captchaToken, setCaptchaToken] = useState<captchaToken | null>(null)
  const toast = useToast();
  const globalAborter = useRef<AbortController | null>(null);
  useEffect(() => {
    const checkAuth = async () => {
      let clientSideAuthBoolean = !!state?.user?.user_id && !!state.session && state?.user?.draft_status !== "draft";

      let { data: serverSideAuth } = Platform.OS === "web" ?
        await supabase.auth.getUser() :
        await supabase.auth.getSession();

      setIsAuthenticated(clientSideAuthBoolean && !!serverSideAuth);
    };

    checkAuth();
  }, [state?.session, state?.user?.user_id, state?.user?.draft_status]);

  // Listen to updates to auth.user tables
  useEffect(() => {
    const userChanges = supabase.channel('user_changes') //as RealtimeChannel<RealtimeChannelOptions<RealtimePostgresChangesFilter<any>>>()
    // .on('postgres_changes', { event: '*', schema: 'public', table: 'auth.users' }, (payload: RealtimePostgresInsertPayload<any> | RealtimePostgresChangesPayload<any>) => {
    //   console.log("User table changed", payload);
    // })

    const handleUserChange = (payload: RealtimePostgresInsertPayload<any> | RealtimePostgresChangesPayload<any> | any) => {
      // Check if the email matches the current user's email
      if (payload.new.email === state?.user?.email) {
        if (payload.eventType === "UPDATE") {
          console.log("User table updated", payload);
          dispatch({ type: actionTypes.UPDATE_USER, payload: payload.new });
        }
        if (payload.eventType === "INSERT") {
          console.log("User table inserted", payload);
          dispatch({ type: actionTypes.SET_USER, payload: payload.new });
        }
      }
    };

    // Subscribe to the channel
    userChanges
      .on('BROADCAST', { event: "*" }, handleUserChange)
      .subscribe();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed", event, session);
      if (event === "SIGNED_IN") {
        // Handle successful sign in
        handleSuccessfulAuth(state?.user, session, dispatch);
      } else if (event === "SIGNED_OUT") {
        // Handle sign out
        handleSignOut();
      } else if (event === "USER_UPDATED") {
        // Handle user updated
        dispatch({ type: actionTypes.SET_USER, payload: session?.user });
      }
    });

    const handleAuthChange = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        dispatch({ type: actionTypes.SET_NEW_SESSION, payload: session });
      } else {
        dispatch({ type: actionTypes.CLEAR_SESSION, payload: null });
      }
    };

    // Cleanup function to remove the subscriptions on unmount
    return () => {
      userChanges.unsubscribe();
      subscription.unsubscribe();
      console.log("Unsubscribed from user changes channel");
    };
  }, [state?.user?.email]);

  const logSubscription = useCallback((status: string, err: any) => {
    if (status === 'SUBSCRIBED') {
      console.log('Connected')
    }
    else if (status === 'TIMED_OUT') {
      console.log('Connection timed out')
    } else if (status === 'CLOSED') {
      console.log('Connection closed')
    } else if (status === 'ERROR') {
      console.log('Error subscribing to task changes channel', err)
    }
    else if (status === 'SUBSCRIPTION_ERROR') {
      console.log('Subscription error', err)
    }
    else if (status === 'SUBSCRIPTION_SUCCESS') {
      console.log('Subscription successful')
    }
    else if (status === 'SUBSCRIPTION_PENDING') {
      console.log('Subscription pending')
    }

    if (err) {
      console.error('Error subscribing to task changes:', err)
      throw new Error(`Error subscribing to task changes: ${err}`);
    }
  }, [])

  //effect to listen to changes to public.tasks, public.task_assignments
  useEffect(() => {
    const taskChanges = supabase.channel('task_changes') //listen for any insert/update/delete events on the public.tasks table

    taskChanges.on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' },
      (payload: RealtimePostgresInsertPayload<{ [key: string]: any }> | RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
        console.log("Task table changed", payload);

        let taskUpdateToast = {
          title: "Task Updated",
          description: "Task updated successfully!",
          action: "info", // Expected action string props
          variant: "outline",
          placement: "top right", // Adjusted to match expected ToastPlacement format
          duration: 5000,
        } as {
          title?: string | null | undefined;
          description?: string | null | undefined;
          action?: "info" | "success" | "error" | "warning" | null | undefined; // Updated to match expected action string props
          variant?: "outline" | "solid" | "subtle" | null | undefined;
          placement?: ToastPlacement | null | undefined;
          duration?: number | null | undefined;
        };

        let globalStateUpdates = {
          type: actionTypes?.UPDATE_TASKS,
          payload: payload.new ?? {},
        } as {
          type: keyof typeof actionTypes;
          payload: any | null | undefined;
        }

        switch (payload.eventType) {
          case "INSERT":
            console.log("Task created", payload.new);
            taskUpdateToast.title = "New Task Added" + (payload.new.title ?? "");
            taskUpdateToast.description = payload.new.created_by === state?.user?.user_id ? `Task ${payload.new.title} added successfully!` : `Task ${payload.new.title} assigned to you!`;
            taskUpdateToast.action = "success";
            taskUpdateToast.variant = "solid";
            break;
          case "UPDATE":
            console.log("Task updated", payload.new);
            //handle task updates
            if (payload.new.due_date !== payload.old.due_date) {
              taskUpdateToast.title = (payload.new.updated_by === state?.user?.user_id ? "Rescheduled to" : "New Due Date") + (payload.new.due_date ?? formatDatetimeObject(new Date(), state?.user?.country ?? "CA"));
            }
            taskUpdateToast.description = `Task ${payload.new.title} updated successfully!`;
            taskUpdateToast.action = "success";
            taskUpdateToast.variant = "solid";

            break;
          case "DELETE":
            console.log("Task deleted", payload.old);
            taskUpdateToast.title = "Task Deleted" + (payload.old.title ?? "");
            taskUpdateToast.description = `Task ${payload.old.title} deleted successfully!`;
            taskUpdateToast.action = "error";
            taskUpdateToast.variant = "solid";
            //update the state objects
            const newTasks = !!state?.tasks ? state?.tasks.filter(task => task?.id !== payload.old?.task_id) : [];
            globalStateUpdates = { type: actionTypes.SET_TASKS, payload: newTasks }
            break;
          default:
            console.log("Unknown task event", payload);
        }
        //update global tasks
        dispatch(globalStateUpdates);

        useToast().show({
          duration: taskUpdateToast.duration ?? 5000,
          placement: taskUpdateToast?.placement ?? "top right",
          render: ({ id }) => (
            <Toast nativeID={id} variant="outline" action={taskUpdateToast?.action ?? "info"}>
              <VStack space="xs" className="flex-1 space-evenly align-items-center p-2 m-2">
                <HStack className="flex-1 flex-start align-top" space="md">
                  <HStack space="xs" className="flex-auto">
                    <MailboxIcon size={24} color={"white"} />
                    <ToastTitle className={`text-indicator-${taskUpdateToast?.action ?? "info"}`}>
                      {taskUpdateToast?.title ?? "Task Updated"}
                    </ToastTitle>
                  </HStack>
                  <Button onPress={() => {
                    console.log("Toast pressed", payload);
                    router.push({
                      pathname: `/(tabs)/tasks/${payload.new.task_id}` as RelativePathString,
                      params: {
                        ...Object.entries((payload.new ?? {} as { [key: string]: any })).reduce((acc, [key, value]: [key: string, value: any]) => {
                          if (['id', 'task_id'].includes(key.toLowerCase())) {
                            acc["task_id"] = value;
                          } else if (!!value && key in payload.new) {
                            acc[key] = value;
                          }
                          return acc;
                        }, {} as { [key: string]: any }),
                        action: payload.eventType ?? "UPDATE",
                        action_type: payload.eventType ?? "UPDATE",
                        user_id: payload.new.user_id ?? state?.user?.user_id,
                        // access_level: state?.user?.access_level ?? "guest",
                      },
                    });
                  }}>
                    <ButtonText>View Task</ButtonText>
                    <ButtonIcon as={Eye} size="sm" color="white" />
                  </Button>
                </HStack>
                <ToastDescription className={`text-indicator-${taskUpdateToast?.action ?? "info"}`}>
                  {taskUpdateToast?.description ?? `Task ${payload.eventType} successfully!`}
                </ToastDescription>
                <ToastDescription className={`text-indicator-${taskUpdateToast?.action ?? "info"}`}>
                  {payload.new.title ?? payload.new.task_id ?? payload.new.id}
                </ToastDescription>
              </VStack>
            </Toast>
          ),
        });

      }) //log any subscription events
      .subscribe(logSubscription);

    () => {
      taskChanges.unsubscribe();
      console.log("Unsubscribed from task changes channel");
    }

  }, [state?.user?.email, state?.user?.draft_status, state?.tasks]);


  useEffect(() => {
    let saveDraftsIntervalId: NodeJS.Timeout | null = null;
    // Create a controller for aborting requests
    globalAborter.current = globalAborter?.current ?? new AbortController();
    const controller = globalAborter.current;

    // Utility function to save drafts periodically
    const saveDrafts = async () => {
      console.log("App is in background or inactive: Saving session...");
      supabase.auth.stopAutoRefresh();
      // Save session to local storage 
      //       // TODO: FIX THIS //await storeUserSession(state);
      //save drafts to supabase
      if (!!state?.drafts && typeof state?.drafts === "object") {
        let saveDraftQuery = []
        Object.entries(state?.drafts ?? {}).map(([table, tableDrafts]) => {
          if (["household", "inventory", "task", "product"].includes(table)) {
            const typedTable = table as "household" | "inventory" | "task" | "product";
            saveDraftQuery.push(
              upsertNonUserResource({
                asDrafts: true,
                resource: tableDrafts,
                resourceType: typedTable,
              }));
          }
          else if (['user', 'users', 'profile', 'profiles'].includes(table)) {
            //do nothing
            return;
          }
        });
      }
    }


    // Handle app state changes
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === "active") {
        console.log("App is active: Restoring session...");
        if (state?.session && state?.user?.user_id) {
          dispatch({ type: actionTypes.SET_NEW_SESSION, payload: state });
          supabase.auth.startAutoRefresh();
          if (saveDraftsIntervalId) clearInterval(saveDraftsIntervalId);
          controller.abort(); // Abort any pending requests
        }
      } else if (nextAppState === "background" || nextAppState === "inactive") {
        console.log("App is in background or inactive: Setting up save drafts...");
        saveDraftsIntervalId = setInterval(saveDrafts, 1000 * 60 * 5); // Save drafts every 5 minutes

        // Set a timeout to clear the session after 5 minutes
        setAbortableTimeout({
          callback: () => {
            console.log("Clearing session...");
            dispatch({ type: actionTypes.CLEAR_SESSION, payload: null });
            supabase.auth.stopAutoRefresh();
          },
          delay: 1000 * 60 * 5, // 5 minutes
          signal: controller.signal,
        });
      }
    };

    // Handle authentication state changes
    const handleAuthStateChange = async (event: AuthChangeEvent, session: Session | null) => {
      console.log("SupabaseAuthEvent:", event);
      console.log("SupabaseSession:", session);

      if (["SIGNED_IN", "INITIAL_SESSION", "USER_UPDATED"].includes(event)) {
        showMessage({
          id: Math.random().toString(),
          title: "Signed In",
          description: "You are now signed in",
          type: "success",
        });

        // Fetch user profile and update state
        const user = await getProfile({ user_id: session?.user?.id ?? "" });
        dispatch({ type: actionTypes.SET_USER, payload: user });

        if (event === "INITIAL_SESSION") {
          router.replace({
            pathname: "/(tabs)/(dashboard)/(stacks)/[type].new",
            params: { type: "household" },
          });
        }

        else if (event === "SIGNED_OUT") {
          saveDrafts()
          handleSignOut();
        }
      };
    }

    // Add event listeners
    const appStateListener = AppState.addEventListener("change", handleAppStateChange);
    const authListener = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Cleanup function
    return () => {
      if (saveDraftsIntervalId) clearInterval(saveDraftsIntervalId);
      controller.abort();
      appStateListener.remove();
      authListener.data.subscription.unsubscribe();
    };
  }, [state?.session, state?.user?.user_id, dispatch]);

  //preFetching useQuery hooks
  const { data } = useSupabaseSession(
    state?.user?.user_id ?? null,
    {
      profile: state?.user ?? {},
      households: state?.households ?? [],
      userHouseholds: [],
      inventories: state?.inventories ?? [],
      tasks: state?.tasks ?? [],
      session: state?.session ?? null,
    }
  );
  if (!!data) dispatch({
    type: actionTypes.UPDATE_SESSION,
    payload: {
      ...state,
      ...data,
    },
  })


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
    captchaToken: useMemo(() => {
      return captchaToken?.token ?? null;
    }
      , [captchaToken?.token]),
    setCaptchaToken,
    colorScheme: useMemo(() => {
      const userPreferences =
        state?.user?.preferences ?? defaultUserPreferences;
      const theme = isTruthy(userPreferences?.theme)
        ? userPreferences.theme
        : "system";
      return theme === "system" && ['light', 'dark', 'system'].includes(String(theme))
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
    globalContext.colorScheme = Appearance.getColorScheme() ?? "light";
  }
  return globalContext;
}
