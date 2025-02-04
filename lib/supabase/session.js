// import supabase from "@/services/supabase/supabase.js";
import supabase from "@/lib/supabase/supabase";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

//utility data fetching functions
const appName = "Home Scan"; //TODO: change this placeholder app name

//fetch user profile from profiles table
export const fetchProfile = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select()
      .eq("user_id", user_id)
      .limit(1);

    if (!data || data === null || error)
      throw new Error("Error fetching user profile");
    else {
      return data;
    }
  } catch (error) {
    console.error(error);
  }
};

export const fetchUserHouseholds = async (userId) => {
  const { data, error } = await supabase
    .from("user_households")
    .select(
      `
            household_id,
            households (
                id,
                name,
                user_inventories (
                    access_level,
                    inventory_id
                )
            )
        `
    )
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

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

export const fetchUserTasks = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select()
      .eq("user_id", userId)
      .not("completion_status", "in", ["done", "archived"])
      .order("due_date", { ascending: true });

    if (!data || data === null || error)
      throw new Error("Error fetching user tasks");
    else {
      return data;
    }
  } catch (error) {
    console.error(error);
  }
};

export const fetchOverDueTasks = async (userId) => {
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


/** ---------------------------
 *   HELPER: Fetch Session
 *  ---------------------------
 *  Restores user session from
 *  AsyncStorage if available.
 * Fetch and initialize session.
 * Combines fetching session logic and ensures the session is not expired.
 * Fetches user profile if session is valid.
 */
export const fetchSession = async () => {
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
    storedSession = await SecureStore.getItemAsync(sessionKey) || await AsyncStorage.getItem(sessionKey);

    console.log("Session key used to fetch session:", sessionKey);
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
  // } catch (error) {
  //   console.log("session key", sessionKey);
  //   console.error("Error fetching session:", error);
  //   return defaultSession;
  // }
};


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


/**
 * The `duplicateUserCheck` function checks if a user with a specific email already exists in a
 * database.
 * @param email - The `duplicateUserCheck` function is designed to check if a user with a specific
 * email already exists in a database table named `public.profiles`. The function takes an `email`
 * parameter as input, which is the email address to be checked for duplication.
 * @returns The `duplicateUserCheck` function is returning an object with two properties:
 * `existingUser` and `error`. The `existingUser` property contains the data of the user with the
 * specified email if they already exist in the database, and the `error` property contains any error
 * that occurred during the database query.
 */
export const duplicateUserCheck = async (email) => {
  //step 1: Check if the user already exists 
  const { data: existingUser, error } = await supabase
    .from('public.profiles')
    .select('email')
    .eq('email', email);

  return { existingUser, error };
}

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

export const registerUserAndCreateProfile = async ({
  email,
  password,
  first_name,
  last_name
}) => {
  try {
    //step 1: Check if the user already exists
    const { existingUser, error } = await duplicateUserCheck(email);

    // Step 2: Register the user
    const { user, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) throw signUpError;

    // Step 2: Create a profile for the user
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: user.id,
          email,
          name: first_name + ' ' + last_name,
          first_name,
          last_name
        },
      ]);

    if (profileError) throw profileError;

    return { success: true };
  } catch (error) {
    throw error;
  }
};

