// import supabase from "@/services/supabase/supabase.js";
import React from "react";
import supabase from "@/lib/supabase/supabase";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import defaultSession, {
  app_metadata,
  authSetupData,
  household,
  inventory,
  product,
  session,
  sessionDrafts,
  task,
  userProfile,
} from "@/constants/defaultSession";
import { ensureSessionNotExpired } from "@/utils/isExpired";
import { Action, actionTypes } from "@/components/contexts/sessionReducer";
import isTruthy from "@/utils/isTruthy";
import { saveUserDrafts } from "./drafts";
import { hideAsync } from "expo-splash-screen";
import defaultUserPreferences from "@/constants/userPreferences";
import { fakeUserAvatar } from "../placeholder/avatar";
import { AuthUser } from "@supabase/supabase-js";
import { baseModelResource } from "../models/types";

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
// default app metadata object for user profiles
export const defaultAppMetaData = {
  is_super_admin: false,
  sso_user: false,
  setup: {
    auth: {
      email: false,
      authenticationMethod: false,
      account: false,
      details: false,
      preferences: false,
      confirmation: false,
    },
    resources: {
      joinedHousehold: false,
      joinedInventory: false,
      addedProduct: false,
      addedTask: false,
    },
  },
};

/* getProfile - wrapper function that finds the appropriate user profile from supabase */
export type getProfileParams = {
  [K in "name" | "email" | "user_id"]?: userProfile[K];
};

export const getProfile = async (filterValue: getProfileParams) => {
  //guard clause
  if (!isTruthy(filterValue)) {
    console.warn("No filter value provided to fetch profile.");
    return;
  }
  const [searchKey, searchKeyValue] = Object.entries(filterValue)[0];
  //find the user profile based on the search key and value
  return await fetchProfile({
    searchKey: searchKey as keyof userProfile,
    searchKeyValue,
  });
};

// Takes a user object (public.profiles table) and AuthUser object (supabase auth) and updates the user profile in the database
export const upsertUserProfile = async (
  user: Partial<userProfile>,
  authUser: Partial<AuthUser>
) => {
  if (!user || !user.email) return;
  const { app_metadata: existingAppMetaData } = user || {};

  // Convert null values to undefined in the user object
  const sanitizedUser = Object.fromEntries(
    Object.entries(user).map(([key, value]) => [
      key,
      value === null ? undefined : value,
    ])
  );

  // Set up the updated app_metadata object
  let updatedAppMetadata = {
    setup: {
      email: sanitizedUser.email || authUser.email ? true : false,
      authenticationMethod: authUser.last_sign_in_at ? true : false,
      account: Object.values(user).some((value) => !value || value === null),
      details: Object.values(user).some((value) => !value || value === null),
      preferences:
        sanitizedUser.preferences &&
        ![null, {}].includes(sanitizedUser.preferences)
          ? true
          : false,
    } as authSetupData,
    //spread existing app_metadata
    ...existingAppMetaData,

    //spread existing authMetaData
    authMetaData: {
      app: authUser.app_metadata,
      user: authUser.user_metadata,
    },
    provider: authUser?.app_metadata?.provider ?? undefined,
    avatar_url:
      existingAppMetaData && "avatar_url" in existingAppMetaData
        ? existingAppMetaData.avatar_url
        : fakeUserAvatar({
            name: sanitizedUser.name,
            size: 100,
            fontColor: "black",
            avatarBgColor: "light",
          }), // Default avatar
  } as app_metadata;

  // Set the created_at timestamp if public.profiles.created_at !== authUser.created_at
  const created_at =
    sanitizedUser.created_at !== authUser.created_at
      ? authUser.created_at || sanitizedUser.created_at
      : sanitizedUser.created_at;

  const combinedUser = {
    //default values to be overridden by user object
    preferences: sanitizedUser.preferences || defaultUserPreferences,
    ...user,
    created_at: created_at || new Date().toISOString(),
    app_metadata: updatedAppMetadata,
  };

  // Upsert the user profile
  return await supabase
    .from("profiles")
    .upsert(combinedUser, {
      onConflict: "user_id,email", //Comma-separated UNIQUE column(s) to specify how duplicate rows are determined. Two rows are duplicates if all the onConflict columns are equal.
      ignoreDuplicates: false, //set false to merge duplicate rows
    })
    .select()
    .limit(1);
};

export const fetchUserAndHouseholds = async (userInfo: getProfileParams) => {
  const [column, value] = Object.entries(userInfo)[0];
  const { data, error } = await supabase
    .from("user_households")
    .select()
    .eq(`profiles.${String(column)}`, value)
    .eq("households.is_template", false);

  if (error) {
    console.error("User households table data fetching error:", error);
    throw new Error(error.message);
  }
  //destructure the data object and rename profiles key to user
  return data as { userProfile: userProfile[]; household: household[] }[];
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

export const fetchUserTasks = async (userInfo: getProfileParams) => {
  const [column, value] = Object.entries(userInfo)[0];
  try {
    const { data, error } = await supabase
      .from("task_assignments")
      .select(
        ` task_assignments(*),
          tasks: task_id (*),
          profiles: ${column} (*),
          `
      )
      .eq(`task_assignments.assigned_to`, value)
      .eq(`profiles.${String(column)}`, value)
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

export const fetchOverDueTasks = async (userInfo: getProfileParams) => {
  const [column, value] = Object.entries(userInfo)[0];

  try {
    const { data, error } = await supabase
      .from("tasks")
      .select()
      .lte("due_date", new Date().toISOString())
      .eq(`profiles.${String(column)}`, value)
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
  userInfo: getProfileParams,
  household_id_list: string[]
) => {
  const [column, value] = Object.entries(userInfo)[0];

  const { data, error } = await supabase
    .from("inventories")
    .select()
    .eq(`profiles.${String(column)}`, value)
    .in("household_id", household_id_list);

  if (error) {
    console.error("User inventories table data fetching error:", error);
    throw error;
  }
  return data;
};

//upsert resource
export type upsertResourceParams = {
  resource: Partial<household | inventory | task | product>[];
  resourceType: baseModelResource["type"] &
    Exclude<baseModelResource["type"], "userProfile">;
  asDrafts?: boolean;
};
/**
 * Upserts a non-user resource into the specified resource type table in Supabase.
 *
 * @param {Object} params - The parameters for the upsert operation.
 * @param {Array<Partial<household | inventory | task | product>>} params.resource - The resource data to be upserted.
 * @param {string} params.resourceType - The type of resource table to upsert into.
 * @param {boolean} [params.asDrafts=false] - Whether to set the resource as drafts. Defaults to false.
 * @returns {Promise<Array<Partial<household | inventory | task | product>>>} - The upserted resource data.
 * @throws Will throw an error if the upsert operation fails.
 */
export const upsertNonUserResource = async ({
  resource,
  resourceType,
  asDrafts = false,
}: upsertResourceParams) => {
  try {
    const primaryKey = Object.keys(resource).find((key) =>
      key.includes(`${resource}_id`)
    );
    //set is_template to false & draft_status to draft if asDrafts is true
    const dataToUpsert = resource.map(
      (item: Partial<household | inventory | task | product>) => {
        item = asDrafts
          ? { ...item, is_template: false, draft_status: "draft" }
          : { ...item, is_template: false };
        return item;
      }
    );
    //upsert the resource
    const { data, error } = await supabase
      .from(resourceType)
      .upsert(dataToUpsert, {
        onConflict: primaryKey || "id",
        ignoreDuplicates: false,
      });

    if (error) {
      console.error("Error upserting resource:", error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error upserting resource:", error);
    throw error;
  }
};

export const confirmDraftResources = async ({
  resource,
  resourceType,
}: Partial<upsertResourceParams>) => {
  try {
    //guard clause
    if ([resource, resourceType].some((item) => !isTruthy(item))) {
      throw new Error("Resource and resource type are required");
    }

    const params = {
      //set draft_status to confirmed and is_template to false
      resource: resource?.map((item) => ({
        ...item,
        draft_status: "confirmed",
        is_template: false,
      })),
      resourceType,
      asDrafts: false,
    };

    return await upsertNonUserResource(params as upsertResourceParams);
  } catch (error) {
    console.error("Error confirming draft resources:", error);
    throw error;
  }
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
  //hide splash screen
  hideAsync();
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
    const existingUser = await getUserProfileByEmail(email);
    if (isTruthy(existingUser))
      return {
        success: isTruthy(existingUser?.existingUser) ?? false,
        error: "User already exists",
        user: existingUser?.existingUser,
      };
    // Step 2: Register the user
    const { data: authUser, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "create_profile_from_auth",
      { email, first_name, last_name, sso_provider, sso_token }
    );
    console.log("RPC data:", rpcData); //TODO: decide what to do with rpcData later

    //throw errors if any
    if (signUpError || rpcError) throw signUpError || rpcError;

    const insertedProfile = isTruthy(userDetails)
      ? { ...userDetails, ...{ email, first_name, last_name } }
      : { email, first_name, last_name };

    // Step 2: Upsert the user profile with the user's details
    const newProfile = await upsertUserProfile(
      insertedProfile,
      authUser?.user ?? {}
    );
    //throw errors if any
    if (newProfile && isTruthy(newProfile.error)) {
      throw newProfile.error;
    }
    //return success and user profile
    return { success: isTruthy(newProfile), user: newProfile };
  } catch (error) {
    console.error("Error registering user and creating profile:", error);
    throw error;
  }
};
