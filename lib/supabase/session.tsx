// import supabase from "@/services/supabase/supabase.js";
import React from "react";
import supabase from "@/lib/supabase/supabase";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import defaultSession, {
  session,
  sessionDrafts,
  userProfile,
} from "@/constants/defaultSession";
import { ensureSessionNotExpired } from "@/utils/isExpired";
import { Action, actionTypes } from "@/components/contexts/sessionReducer";
import isTruthy from "@/utils/isTruthy";
import { saveUserDrafts } from "./drafts";

//utility data fetching functions
const appName = "Home Scan"; //TODO: change this placeholder app name

//fetch user profile from profiles table with an object with a key of the
export const fetchProfile = async ({
  searchKey = "user_id",
  searchKeyValue,
}: {
  searchKey: keyof userProfile;
  searchKeyValue: any;
}) => {
  //guard clause
  if (!searchKeyValue || searchKeyValue === null) return;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select()
      .eq(String(searchKey), searchKeyValue)
      .limit(1);

    if (!data || data === null || error)
      throw new Error("Error fetching user profile");
    else {
      return data[0];
    }
  } catch (error) {
    console.error(error);
    throw error; //propagate error
  }
};

export const fetchUserAndHouseholds = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_households")
    .select
    //   `
    //   profiles:user_id(*),
    //   households:household_id(*)
    //   user_households: (*)
    // `
    ()
    .eq("profiles.user_id", userId)
    .eq("households.is_template", false);

  // /* This reducer is creating a grouped data structure based on the `householdId` from the `data`
  // array. */
  // const groupedData = data.reduce((acc, item) => {
  //   const householdId = item.households.id;
  //   if (!acc[householdId]) {
  //     acc[householdId] = [];
  //   }
  //   acc[householdId].push(item);
  //   return acc;
  // }, {});

  if (error) {
    console.error("User households table data fetching error:", error);
    throw new Error(error.message);
  }
  //destructure the data object and rename profiles key to user
  return data;
};

/*
{@returns} 
 
[
    {
        household_id: 'household-1',
        households: {
            id: 'household-1',
            name: 'Smith Family Household',
            user_inventories: [
                {
                    access_level: 'admin',
                    inventory_id: 'inventory-1'
                },
                {
                    access_level: 'member',
                    inventory_id: 'inventory-2'
                }
            ]
        }
    },
    {
        household_id: 'household-2',
        households: {
            id: 'household-2',
            name: 'Johnson Family Household',
            user_inventories: [
                {
                    access_level: 'member',
                    inventory_id: 'inventory-3'
                }
            ]
        }
    },
    {
        household_id: 'household-3',
        households: {
            id: 'household-3',
            name: 'Doe Family Household',
            user_inventories: [
                {
                    access_level: 'admin',
                    inventory_id: 'inventory-4'
                },
                {
                    access_level: 'member',
                    inventory_id: 'inventory-5'
                }
            ]
        }
    }
]
 
 
*/

export const fetchUserTasks = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("task_assignments")
      .select(
        `
            tasks: task_id (*)
            profiles: user_id (*)
            assigned_by: assigned_by_id (*)
            created_at,
            updated_at,
            `
      )
      .eq("user_id", userId)
      .not("tasks.completion_status", "in", ["done", "archived"])
      .not("tasks.draft_status", "in", "published")
      .order("tasks.due_date", { ascending: true });

    if (!data || data === null || error)
      throw new Error("Error fetching user tasks");
    else {
      return data;
    }
  } catch (error) {
    console.error(error);
  }
};

export const fetchOverDueTasks = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select()
      .lte("due_date", new Date().toISOString())
      .eq("user_id", userId)
      .not("completion_status", "in", ["done", "archived"])
      .order("due_date", { ascending: true });

    if (!data || data === null || error)
      throw new Error("Error fetching user overdue tasks");
    else {
      return data;
    }
  } catch (error) {
    console.error(error);
  }
};

export const fetchUserInventories = async (
  userId: string,
  household_id_list: string[]
) => {
  const { data, error } = await supabase
    .from("inventories")
    .select()
    .eq("user_id", userId)
    .in("household_id", household_id_list);

  if (error) {
    console.error("User inventories table data fetching error:", error);
    throw error;
  }
  return data;
};

/** ---------------------------
 *   HELPER: restoreLocalSession
 *  ---------------------------
 *  Restores user session from
 *  AsyncStorage if available.
 * Fetch and initialize session.
 * Combines fetching session logic and ensures the session is not expired.
 * Fetches user profile if session is valid.
 */
export const restoreLocalSession = async (): Promise<session> => {
  // try {
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
    let sessionKey = `${appName}_session`;
    //TODO: Change to LargeSecureStore when it's ready
    storedSession =
      (await SecureStore.getItemAsync(sessionKey)) ||
      (await AsyncStorage.getItem(sessionKey));

    console.log("Session key used to fetch session:", sessionKey);
    console.log("Stored session:", storedSession);
  }
  //handle stored session found
  if (storedSession) {
    const parsedSession = JSON.parse(storedSession);
    //check if session is expired
    if (ensureSessionNotExpired(parsedSession)) {
      const userProfile = await fetchProfile({
        searchKey: "user_id",
        searchKeyValue: parsedSession.user.id,
      });
      return {
        ...parsedSession,
        user: { ...parsedSession.user, profile: userProfile },
      };
    } else {
      //handle no session found
      console.warn("Stored session expired.");
      return defaultSession;
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
  //get profile from public.profiles table
  const userProfile = await fetchProfile({
    searchKey: "user_id",
    searchKeyValue: data.session.user.id,
  });

  return { ...defaultSession, session: data.session, user: userProfile };
  // } catch (error) {
  //   console.log("session key", sessionKey);
  //   console.error("Error fetching session:", error);
  //   return defaultSession;
  // }
};

/** ---------------------------
   *  Helper: initializeSession - initializes the session
   *  ---------------------------
  *  Stores the user session in the secure store if mobile else as a cookie if a web browser.
  *  @param {Object} sessionObj - The session object to store. 
    
  * NOTE: storing the entire user session for simplicity.
  */

export const initializeSession = async (dispatch: React.Dispatch<Action>) => {
  console.log("Initializing session...");
  // const { data, error } = await supabase.auth.getSession();
  // const { data, error } = await fetchProfile({
  //   user_id: process.env.EXPO_PUBLIC_TEST_USER_ID,
  // });
  // console.log("Fetched profile:", data);

  const payload = (await restoreLocalSession()) || undefined;
  //handle success
  if (isTruthy(payload)) {
    console.log(
      `Found User ID: ${payload?.user?.user_id ?? ""} Restored session:`,
      payload
    );
    //set session state if found
    dispatch({ type: actionTypes.SET_NEW_SESSION, payload });
    Object.keys(payload).forEach((key) => {
      console.log(`Restored ${key}:`, (payload as any)[key]);
    });
  }
  //handle failure
  //set anonymous session since nothing was fetched locally
  dispatch({ type: actionTypes.SET_ANON_SESSION, payload: defaultSession });
  console.log("No session found. Setting anonymous session...", defaultSession);
};

/** ---------------------------
   *  Helper: Storing the session
   *  ---------------------------
  *  Stores the user session in the secure store if mobile else as a cookie if a web browser.
  *  @param {Object} sessionObj - The session object to store. 
    
  * NOTE: storing the entire user session for simplicity.
  */
export async function storeUserSession(sessionObj: any) {
  if (!isTruthy(sessionObj)) throw new Error("Session object is required.");

  //handle drafts
  const { drafts } = sessionObj || {};
  if (isTruthy(drafts)) {
    console.log("Saving drafts to database...");
    await saveUserDrafts(drafts);
  }
  console.log("Storing session...");
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

/**@function getUserProfileByEmail Checks if a user with a specific email already exists in the database.
 * @param {string} email - The email address to check for duplication.
 * @returns {Promise<{existingUser: userProfile, error: Object}|null>} An object with `existingUser` and `error` properties if a user exists, or null if not.
 */
export const getUserProfileByEmail = async (email: string) => {
  try {
    //do not proceed if email is not provided
    if (!email) return; //throw new Error("Email is required to check for existing user.");
    // Check if the user exists in public.profiles
    const existingProfile = await fetchProfile({
      searchKey: "email",
      searchKeyValue: email,
    });

    if (existingProfile && existingProfile.length > 0) {
      return { existingUser: existingProfile, error: null };
    }

    // If no user is found in public.profiles table, return null
    return null;
  } catch (error) {
    console.error("Error finding existing user:", error);
    throw error;
  }
};

/**
 * The function `signUpNewUser` asynchronously signs up a new user with the provided email and password
 * using Supabase authentication.
 * @param email - The `email` parameter in the `signUpNewUser` function is the email address of the
 * user who is signing up for a new account. It is used as part of the authentication process to create
 * a new user account with the provided email address.
 * @param password - The `password` parameter in the `signUpNewUser` function is the password that the
 * user will use to create their account. It is a sensitive piece of information that should be
 * securely stored and encrypted to protect the user's account.
 */

type RegisterUserAndCreateProfileParams = {
  email: string;
  password: string;
  sso_provider?: string;
  sso_token?: string;
  first_name: string;
  last_name: string;
  userDetails?: Partial<userProfile>;
};

export const registerUserAndCreateProfile = async ({
  email,
  password,
  sso_provider,
  sso_token,
  first_name,
  last_name,
  ...userDetails
}: RegisterUserAndCreateProfileParams) => {
  try {
    //step 1: Check if the user already exists
    const { existingUser, error } = await getUserProfileByEmail(email);
    if (existingUser)
      return {
        success: false,
        error: "User already exists",
        user: existingUser,
      };
    // Step 2: Register the user
    const { data: user, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "create_profile_from_auth",
      { email, first_name, last_name, sso_provider, sso_token }
    );

    if (signUpError) throw signUpError;
    const insertedProfile =
      userDetails && userDetails !== null
        ? { ...userDetails, email, first_name, last_name }
        : { email, first_name, last_name };
    // Step 2: Create a profile for the user
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(insertedProfile, {
        options: { ignoreDuplicates: true, onConflict: "email" },
      });

    if (profileError) throw profileError;

    return { success: true, error: null, user };
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};
