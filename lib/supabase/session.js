// import supabase from "@/services/supabase/supabase.js";
import supabase from "@/lib/supabase/supabase";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

//utility data fetching functions
const appName = "Home Scan"; //TODO: change this placeholder app name

//fetch user profile from profiles table with an object with a key of the 
export const fetchProfile = async (searchKeyObject) => {
  const searchParams = Object.values(searchKeyObject)
  //destructure search key, value
  const [searchKey, searchKeyValue] = searchParams
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select()
      .eq(searchKey, searchKeyValue)
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
                description,
                
            )
        `
    )
    .eq("user_id", userId)
    .eq({ is_template: false });

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

/**@function existingUserCheck Checks if a user with a specific email already exists in the database.
 * @param {string} email - The email address to check for duplication.
 * @returns {Promise<{existingUser: Object, error: Object}|null>} An object with `existingUser` and `error` properties if a user exists, or null if not.
 */
export const existingUserCheck = async (email) => {
  try {
    // Check if the user exists in public.profiles
    const { data: existingProfile, error: profileError } = await supabase
      .from('public.profiles')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (existingProfile && existingProfile.length > 0) {
      return { existingUser: existingProfile, error: profileError };
    }

    // If no user is found in public.profiles table, return null
    return null;
  } catch (error) {
    console.error('Error finding duplicate user:', error);
    throw error;
  }
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
  sso_provider,
  sso_token,
  first_name,
  last_name
}) => {
  try {
    //step 1: Check if the user already exists
    const { existingUser, error } = await existingUserCheck(email);
    if (existingUser) return { success: false, error: 'User already exists', user: existingUser };
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

    return { success: true, error: null, user };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

