import React from "react";
import defaultSession, {
  household,
  inventory,
  session,
  userProfile,
} from "@/constants/defaultSession";
import { AuthUser, Session } from "@supabase/supabase-js";
import {
  existingUserCheck,
  fetchUserAndHouseholds,
  storeUserSession,
} from "@/lib/supabase/session";
import {
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast";
import { router } from "expo-router";
import { statusCodes } from "@react-native-google-signin/google-signin";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { AlertTriangle, HomeIcon, UserCheck2Icon } from "lucide-react-native";
import { actionTypes } from "@/components/contexts/sessionReducer";
import { HelloWave } from "@/components/HelloWave";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import supabase from "@/lib/supabase/supabase";
import { fakeUserAvatar } from "@/lib/placeholder/avatar";
import { completeUserProfile } from "@/lib/supabase/register";

const createUserProfileAppMetaData = async (
  newUser: userProfile,
  session: session | Session
) => {
  const { user: sessionUser } = session || {};
  const user = {
    ...sessionUser,
    ...newUser,
  };

  //check if user exists in user_households table
  const existingUser = await supabase
    .from("user_households")
    .select("*")
    .eq("user_id", user.user_id);

  const defaultAppMetaData = {
    is_super_admin: false,
    sso_user: false,
    setup: {
      auth: {
        email: true,
        authenticationMethod: true,
        account: true,
        details: true,
        preferences: true,
        confirmation: true,
      },
      resources: {
        joinHousehold: existingUser && existingUser !== null,
        joinInventory: existingUser && existingUser !== null,
        addProduct: existingUser && existingUser !== null,
        addTask: existingUser && existingUser !== null,
      },
    },
  };

  const { app_metadata } = user || null || undefined;
  if (!app_metadata || app_metadata === null) {
    user.app_metadata = {
      ...defaultAppMetaData,
      provider: sessionUser.sso_user,
      photo:
        sessionUser.user_metadata?.avatar_url || fakeUserAvatar(sessionUser),
    };
  }
  app_metadata.provider = sessionUser.provider || undefined;
  // const user = {

  //   email,
  //   first_name: first_name,
  //   last_name: familyName,
  //   name: name || `${first_name} ${familyName}`,
  //   app_metadata: JSON.stringify({
  //     provider: "google",
  //     avatar_url: photo,
  //   }),
  // };

  // if (session.property("user_metadata")) {
  //   newUser.app_metadata = {
  //     ...defaultAppMetaData,
  //     provider: session.user.provider || undefined,
  //     photo:
  //       session.user.user_metadata?.avatar_url || fakeUserAvatar(session.user),
  //   };
  // }
};
/**Handle successful initial session after sign-in
 *
 */

const handleSuccessfulInitialSession = async (
  newUser: userProfile,
  newUserHousehold: household[],
  newUserInventories: inventory[],
  state: session,
  session: Session,
  dispatch: (arg: {
    type: (typeof actionTypes)[keyof typeof actionTypes];
    payload: any;
  }) => void
) => {
  const user_id = newUser.user_id || state.user?.user_id || session.user.id;
  if (!user_id) return;

  //check if user exists in user_households table
  const existingUser = await supabase
    .from("user_households")
    .select("*")
    .eq("user_id", user_id);
  const newUserMetaData = await createUserProfileAppMetaData(newUser, session);
  //if doesn't exist, insert new user
  if (!existingUser || existingUser === null) {
    const newUserProfile = await completeUserProfile(
      newUser,
      newUser.app_metadata.sso_user
    );
  }

  //continue with signin
  return handleSuccessfulAuth(session, dispatch);
};

/**
 * Handle fetching user profile & household data after sign-in
 */
const handleSuccessfulAuth = async (
  state: userProfile | AuthUser, //session,
  session: Session,
  dispatch: (arg: {
    type: (typeof actionTypes)[keyof typeof actionTypes];
    payload: any;
  }) => void
) => {
  if (!session?.user?.id || session?.user?.id === null) return;
  //   //handle existing state
  // if (state?.session?.id !== session.user?.id)
  //   dispatch({ type: "LOGOUT", payload: defaultSession });

  const { user: authUser } = session;
  const user_id = authUser.id || state.user_id;
  try {
    const { user, households } = await fetchUserAndHouseholds(user_id);
    //debugging
    console.log(
      "User households table data:",
      "USER:",
      user,
      "households:",
      households
    );

    //convert sets to arrays and sort by: household_id
    // const parsedHouseholds = Array.from(households);
    //update state
    dispatch({
      type: "SET_NEW_SESSION",
      // state?.user?.id !== session?.user?.id
      //   ? "SET_NEW_SESSION"
      //   : "UPDATE_SESSION", //update session if user is already signed in
      payload: {
        session,
        user,
        households,
      },
    });
    storeUserSession({ session, user, households });
    showAuthOutcome(true);
    //redirect to home page
    router.replace("/(tabs)" as any);
  } catch (err) {
    console.error("Error post-sign-in:", err);
    handleAuthError(err);
  }
};

/**
 * Handles authentication errors and displays appropriate messages.
 */
const handleAuthError = (error: any) => {
  if (error.code === statusCodes.SIGN_IN_CANCELLED) {
    console.log("User cancelled the login process.");
    router.replace("/(auth)/(signin)");
  } else if (error.code === statusCodes.IN_PROGRESS) {
    console.log("Sign-in is already in progress.");
  } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    console.log("Google Play Services are not available or outdated.");
    // const auth = performWebOAuth(dispatch, "google");
  } else {
    console.error("Authentication error:", error);
    router.push("/(auth)/(signin)/authenticate");
  }
  //show error toast
  showAuthOutcome(false, error);
};

const showAuthOutcome = (
  success: boolean = false,
  redirectNewUser: boolean = false,
  error?: any
) => {
  const { state } = useUserSession();
  const toast = useToast();
  if (success && !redirectNewUser) {
    toast.show({
      duration: 5000,
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
              {state?.user?.name ?? "Existing User"}.
            </ToastDescription>
          </VStack>
        </Toast>
      ),
    });
  } else if (success && redirectNewUser) {
    toast.show({
      duration: 5000,
      placement: "bottom right",
      render: ({ id }) => (
        <Toast nativeID={id} variant="outline" action="success">
          <VStack space="xs">
            <UserCheck2Icon size={24} />
            <ToastTitle className="text-indicator-success">
              Welcome New User!
            </ToastTitle>
            <ToastDescription className="text-indicator-success">
              Please set up your profile to continue.
            </ToastDescription>
          </VStack>
        </Toast>
      ),
    });
  } else {
    toast.show({
      duration: 10000,
      placement: "bottom right",
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
              onPress={() => router.push("/(auth)/(signin)/authenticate")}
              variant="outline"
              action="primary"
              size="sm"
              className="ml-5"
            >
              <ButtonText>Try again</ButtonText>
            </Button>
          </HStack>
        </Toast>
      ),
    });
  }
};

export { handleSuccessfulAuth, handleAuthError, showAuthOutcome };
