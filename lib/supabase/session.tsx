// import supabase from "@/services/supabase/supabase.js";
import React from "react";
import supabase from "@/lib/supabase/supabase";
import { Appearance, Platform } from "react-native";
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
  user_households,
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
import { singularizeStr } from "@/utils/pluralizeStr";
import appInfo from '../../app.json';
import getRandomHexColor from "@/utils/getRandomHexColor";
import { getAuthSession, getSupabaseAuthStatus } from "./auth";
import { createUserStorage, GeneralCache, GeneralCacheType, keySeparator, mmkvCache } from "../storage/mmkv";
import { MMKV } from "react-native-mmkv";


//utility data fetching functions
// const appName = "Home Scan"; //TODO: change this placeholder app name
const appName = appInfo.expo.name;

//fetch user profile from profiles table with an object with a key of the
export const fetchProfile = async ({
  searchKey = "user_id",
  searchKeyValue,
}: {
  searchKey: keyof userProfile;
  searchKeyValue: any;
}) => {
  console.info("Fetching user profile with:", { searchKey, searchKeyValue });
  //guard clause
  if (!searchKeyValue || searchKeyValue === null) throw new TypeError(`Search key value is required to fetch user profile. Received ${{}} AT ${this}`);
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select()
      .eq(String(searchKey), searchKeyValue)
      .limit(1);

    if (!data || data === null || error)
      throw new Error("Error fetching user profile");
    else {
      return data[0] ?? null;
    }
  } catch (error) {
    console.error(error);
    throw error; //propagate error
  }
};
// default app metadata object for user profiles
export const defaultAppMetaData = {
  avatar_url: fakeUserAvatar({
    name: "User",
    size: 100,
    fontColor: getRandomHexColor(),
    avatarBgColor: getRandomHexColor(),
  }),
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
  [K in "name" | "email" | "user_id" | "phone_number"]?: userProfile[K];
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
// Takes a user object (public.profiles table) and optionally an AuthUser object (supabase auth) and updates the user profile in the database
export const upsertUserProfile = async (
  user: Partial<userProfile>,
  authUser?: Partial<AuthUser>
) => {
  if (!user || !user.email) return;

  const { app_metadata: existingAppMetaData } = user || {};

  // Combine user and authUser objects if authUser is truthy
  const combinedAuthUser = authUser
    ? {
      email: authUser.email || user.email,
      created_at: authUser.created_at || user.created_at,
      app_metadata: authUser.app_metadata,
      user_metadata: authUser.user_metadata,
      last_sign_in_at: authUser.last_sign_in_at,
    }
    : {};

  const combinedUser = { ...user, ...combinedAuthUser };

  // Convert null values to undefined in the combined user object
  const sanitizedUser = Object.fromEntries(
    Object.entries(combinedUser).map(([key, value]) => [
      key,
      value === null ? undefined : value,
    ])
  );

  // Set up the updated app_metadata object
  let updatedAppMetadata = {
    setup: {
      email: sanitizedUser.email ? true : false,
      authenticationMethod: sanitizedUser.last_sign_in_at ? true : false,
      account: Object.values(sanitizedUser).some(
        (value) => !value || value === null
      ),
      details: Object.values(sanitizedUser).some(
        (value) => !value || value === null
      ),
      preferences:
        sanitizedUser.preferences &&
          ![null, {}].includes(sanitizedUser.preferences)
          ? true
          : false,
    } as authSetupData,
    // Spread existing app_metadata
    ...existingAppMetaData,

    // Spread existing authMetaData
    authMetaData: {
      app: sanitizedUser.app_metadata,
      user: sanitizedUser.user_metadata,
    },
    // provider: sanitizedUser?.app_metadata?.provider ?? undefined,
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
    sanitizedUser.created_at !== combinedUser.created_at
      ? combinedUser.created_at || sanitizedUser.created_at
      : sanitizedUser.created_at;

  const finalUser = {
    // Default values to be overridden by sanitizedUser object
    preferences: sanitizedUser.preferences || defaultUserPreferences,
    ...sanitizedUser,
    created_at: created_at || new Date().toISOString(),
    app_metadata: updatedAppMetadata,
    avatar_photo:
      sanitizedUser.avatar_photo || updatedAppMetadata.avatar_url,
  };

  // Upsert the user profile
  const { data, error } = await supabase
    .from("profiles")
    .upsert(finalUser, {
      onConflict: "email", // Comma-separated UNIQUE column(s) to specify how duplicate rows are determined. Two rows are duplicates if all the onConflict columns are equal.
      ignoreDuplicates: false, // Set false to merge duplicate rows
    })
    .select()
    .limit(1)
    .returns();

  if (error) {
    console.error("Error upserting user profile:", error);
    throw error;
  }
  return data;
};
/** ----------------------------------------------------------------------
 *  UserHousehold Methods
 * *
 * 
 * ----------------------------------------------------------------------- 
 * */

/** Fetches user households, households and profiles joined by a user info key
 * 
 * @param userInfo 
 * @returns 
 */
export const fetchUserHouseholdsByUser = async (userInfo: { "user_id": string },
  returnMapped: boolean = false,
  orderBy: "user_households.household_id" |
    "user_households.user_id" |
    "user_households.access_level" = "user_households.household_id"
) => {
  const [user_id, userIDValue] = Object.entries(userInfo)[0];
  const { data, error } = await supabase
    .from("user_households")
    .select("user_households(*), households(*), profiles(name, email, avatar_photo)")
    .eq(`user_households.${String(user_id)}`, userIDValue)
    .eq(`profiles.${String(user_id)}`, userIDValue)
    .eq("households.id", "user_households.household_id")
    .eq("profiles.user_id", "user_households.user_id")
    .eq("households.is_template", false)
    .eq("households.draft_status", "confirmed")
    .filter("access_level", "neq", "guest")
    .order(`${orderBy}`, { ascending: true }) as unknown as {
      data: {
        user_households: user_households[];
        households: household[];
        profiles: Partial<userProfile>[];
      }[],
      error: any
    }
  if (error) {
    console.error("User households table data fetching error:", error);
    throw new Error(error?.message
      ?? "Something went wrong fetching user households joint data.");
  }
  console.log("User households data fetched:", data);
  // return !returnMapped ? data as unknown as {
  //   user_households: user_households[],
  //   households: household[],
  //   profiles: Partial<userProfile>[],
  // } :
  //   (Object.entries(data ?? []).reduce((acc, [tableName, tableValue]) => {
  //     //check if value is not null or undefined and all values are truthy
  //     if (!!tableValue && Object.values(tableValue).every(Boolean)) {
  //       tableValue.user_households?.forEach((row: any) => {
  //         acc.set(row.household_id, {
  //           householdProfiles: tableValue.profiles,
  //           relation: tableValue,
  //           ...row.households,
  //         });
  //       });
  //     }
  //     //continue to next iteration
  //     return acc;
  //   }, new Map()));

  if (!returnMapped) return data as unknown as {
    user_households: user_households[],
    households: household[],
    profiles: Partial<userProfile>[],
  }
  const mappedHouseholds = new Map(
    (data ?? []).flatMap((item: { user_households: any[] }) =>
      item.user_households.map((userHouseholdRelationRow) => [
        userHouseholdRelationRow.household_id,
        {
          household: data?.flatMap((item) => item.households).filter((household) => household.id === userHouseholdRelationRow.household_id)[0],
          relation: userHouseholdRelationRow,
          householdProfiles: data?.flatMap((item) => item.profiles).filter((profile) => profile.user_id === userHouseholdRelationRow.user_id),
          ...userHouseholdRelationRow,
        },
      ])
    )
  );
  console.log("Mapped households:", { mappedHouseholds });

  return mappedHouseholds as unknown as {
    user_households: user_households[],
    households: household[],
    profiles: Partial<userProfile>[],
  };
  // (Object.entries(data ?? []).reduce((acc, [tableName, tableValue]) => {
  //   //check if value is not null or undefined and all values are truthy
  //   if (!!tableValue && Object.values(tableValue).every(Boolean)) {
  //     tableValue.user_households?.forEach((row: any) => {
  //       acc.set(row.household_id, {
  //         householdProfiles: tableValue.profiles,
  //         relation: tableValue,
  //         ...row.households,
  //       });
  //     });
  //   }
  //   //continue to next iteration
  //   return acc;
  // }, new Map()));

  //destructure the data object and rename profiles key to user
  // return data as { userProfile: userProfile[]; household: household[] }[];
};

export type fetchSpecificUserHouseholdParams = {
  user_id?: string;
  household_id?: string;
};

export const fetchSpecificUserHousehold = async (
  query:
    fetchSpecificUserHouseholdParams
) => {
  console.log("Query params:", query);
  const { user_id, household_id } = query;

  if (!user_id || !household_id) {
    throw new Error("Both user_id and household_id are required");
  }

  const { data, error } = await supabase
    .from("user_households")
    .select("*"
      // `
      // households: household_id (*),
      // user_id: user_id(*),`
    )
    .eq("user_id", user_id)
    .eq("household_id", household_id)
    .single();

  if (error) {
    console.error("User household data fetching error:", error);
    throw new Error(error.message);
  }
  return data as user_households ?? {};
};

export type houseHoldSearchParams = {
  [K in keyof (household | user_households)]?: string;
};
/*
*  ----------------------------
*   fetchUserHouseholdProfiles
*  ----------------------------
*   Fetches user household relations from the user_households table in Supabase.
*
*  */
export const fetchUserHouseholdProfiles = async (householdInfo: { [K in keyof (household | user_households)]: any }) => {
  const [column, value] = Object.entries(householdInfo)[0];

  const { data, error } = await supabase
    .from("user_households")
    .select("user_households(*), households(*), profiles(name, email, avatar_photo)")
    .eq(`${column.toLowerCase() !== 'id' ? `user_households.${column}` : `households.${column}`}`, value) //dynamically match the column name to the value based on the column name (eg. on user or on household)
    .eq('profiles.user_id', "user_households.user_id")
    .eq('households.id', "user_households.household_id")
    .not("access_level", "eq", "guest")
    .eq("households.is_template", false)
    .eq("households.draft_status", "confirmed")
    .order(`"households"."name"`, { ascending: true });

  if (error) {
    console.error("User households table data fetching error:", error);
    throw new Error(error.message);
  }
  console.log("User households data fetched:", { data });
  return data;
};

export const fetchUserTasks = async (userInfo: getProfileParams) => {
  const [column, value] = Object.entries(userInfo)[0];
  try {
    const { data, error } = await supabase
      .from("task_assignments")
      .select(
        `task_assignments(*),
        tasks(*),
        profiles(*),
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
      .from("task_assignments")
      .select()
      .lte("due_date", new Date().toISOString())
      .eq(`profiles.${String(column)}`, value)
      .not("draft_status", "in", ["published", "draft"])
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
  console.log("User inventories data fetched:", data);
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
    //get resource primary key
    const primaryKey = Object.keys(resource).find((key) =>
      key.toLocaleLowerCase() === "id" || key.includes(`${singularizeStr(String(resource))}_id`)
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
      console.error("post upsert error, throwing error:", error);
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
// export const restoreLocalSession = async (): Promise<session> => {
//   // try {
//   let storedSession;
//   let storedKeys = await AsyncStorage.getAllKeys();
//   console.log("All stored session keys in storage:", storedKeys);
//   if (typeof window !== "undefined" && Platform.OS === "web") {
//     const cookies = document.cookie.split("; ");
//     const sessionCookie = cookies.find((cookie) =>
//       cookie.startsWith(`${appName}_session`)
//     );
//     if (sessionCookie) {
//       storedSession = sessionCookie.split("=")[1];
//       console.log("Stored session (is cookie):", storedSession);
//     }
//   } else {
//     let sessionKey = `${appName}_session`;
//     //TODO: Change to LargeSecureStore when it's ready
//     storedSession =
//       (await SecureStore.getItemAsync(sessionKey)) ||
//       (await AsyncStorage.getItem(sessionKey));

//     console.log("Session key used to fetch session:", sessionKey);
//     console.log("Stored session:", storedSession);
//   }
//   //handle stored session found
//   if (storedSession) {
//     const parsedSession = JSON.parse(storedSession);
//     //check if session is expired
//     if (ensureSessionNotExpired(parsedSession)) {
//       const userProfile = await fetchProfile({
//         searchKey: "user_id",
//         searchKeyValue: parsedSession.user.id,
//       });
//       return {
//         ...parsedSession,
//         user: { ...parsedSession.user, profile: userProfile },
//       };
//     } else {
//       //handle no session found
//       console.warn("Stored session expired.");
//       return defaultSession;
//     }
//   }

//   const { data, error } = await supabase.auth.getSession();

//   if (error || !data?.session || !ensureSessionNotExpired(data.session)) {
//     console.warn("Supabase session expired or invalid.");
//     return defaultSession;
//   }

//   await storeUserSession({
//     token: data.session.access_token,
//     refreshToken: data.session.refresh_token,
//     user: data.session.user,
//   });
//   //get profile from public.profiles table
//   const userProfile = await fetchProfile({
//     searchKey: "user_id",
//     searchKeyValue: data.session.user.id,
//   });

//   return { ...defaultSession, session: data.session, user: userProfile };
//   // } catch (error) {
//   //   console.log("session key", sessionKey);
//   //   console.error("Error fetching session:", error);
//   //   return defaultSession;
//   // }
// };

/** ---------------------------
   *  Helper: initializeSession - initializes the session
   *  ---------------------------
  *  Stores the user session in the secure store if mobile else as a cookie if a web browser.
  *  @param {Object} sessionObj - The session object to store. 
    
  * NOTE: storing the entire user session for simplicity.
  */
//V1 - commented out due to issues
// export const initializeSession = async (dispatch: React.Dispatch<Action>) => {
//   console.log("Initializing session...");
//   // const { data, error } = await supabase.auth.getSession();
//   // const { data, error } = await fetchProfile({
//   //   user_id: process.env.EXPO_PUBLIC_TEST_USER_ID,
//   // });
//   // console.log("Fetched profile:", data);
//   let emptySession = { ...defaultSession, user: { preferences: defaultUserPreferences } };
//   const payload = (await restoreLocalSession()) || emptySession;
//   //handle success
//   if (isTruthy(payload)) {
//     console.log(
//       `Found User ID: ${payload?.user?.user_id ?? ""} Restored session:`,
//       payload
//     );
//     //set session state if found
//     dispatch({ type: actionTypes.SET_NEW_SESSION, payload });
//     Object.keys(payload).forEach((key) => {
//       console.log(`Restored ${key}:`, (payload as any)[key]);
//     });
//   }
//   //handle failure
//   //set anonymous session since nothing was fetched locally
//   dispatch({ type: actionTypes.SET_ANON_SESSION, payload: defaultSession });
//   console.log("No session found. Setting anonymous session...", defaultSession);
//   //store default session
//   storeUserSession(emptySession);
//   //hide splash screen
//   hideAsync();
// };

//v2
export const initializeSession = async (
  dispatch: React.Dispatch<Action>,
  storage?: GeneralCacheType, //eg. mmkv instance
) => {
  const userData = await getSupabaseAuthStatus(true, true) //get session from supabase and db public.profiles record
  let payload = { ...defaultSession, user: { preferences: defaultUserPreferences } };
  let type: typeof actionTypes["SET_ANON_SESSION"] | typeof actionTypes["SET_NEW_SESSION"] = actionTypes.SET_ANON_SESSION;
  let mmkvInstance = !!storage ? storage : GeneralCache as typeof GeneralCache; //use the passed storage instance or default to GeneralCache

  if (userData) {
    const { session, user } = userData as Partial<session>;
    console.log("Session initialized:", { session, user });
    payload = {
      ...defaultSession,
      session,
      user: { preferences: defaultUserPreferences, ...user }
    };
    type = actionTypes.SET_NEW_SESSION as typeof actionTypes["SET_NEW_SESSION"];
    // mmkvInstance.setItem(`${appName}${keySeparator}session`, JSON.stringify(payload)); //store session in mmkv
    mmkvInstance = !!storage && user?.user_id ? await storage.updateStorage(user?.user_id) as typeof GeneralCache : new mmkvCache(user?.user_id); //create a new storage instance for the user
  }
  const systemTheme = Appearance.getColorScheme() ?? defaultUserPreferences.theme; //get system theme
  const preferences = payload.user?.preferences ?? defaultUserPreferences
  //update preferences in storage
  if (preferences.theme === 'system') {
    preferences.theme = systemTheme;
  } else if (preferences?.theme !== systemTheme) {
    Appearance.setColorScheme(preferences.theme); //set the color scheme to the user's preference
    console.log("Setting color scheme to:", preferences.theme);
  }

  mmkvInstance.setItem(`${appName}${keySeparator}preferences`, JSON.stringify(preferences)); //store preferences in mmkv
  //update session
  dispatch({
    type,
    payload
  });


  return {
    ...payload,
    type,
    storage: mmkvInstance, //store the storage instance in the session object
  }
}
/** ---------------------------
   *  Helper: Storing the session
   *  ---------------------------
  *  Stores the user session in the secure store if mobile else as a cookie if a web browser.
  *  @param {Object} sessionObj - The session object to store. 
    
  * NOTE: storing the entire user session for simplicity.
  */

// Util Function to flatten the session object before storing
const flattenObject = (obj: any, parent: string = '', res: any = {}) => {
  for (let key in obj) {
    let propName = parent ? parent + '.' + key : key;
    if (typeof obj[key] == 'object' && obj[key] !== null) {
      flattenObject(obj[key], propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
};

export async function storeUserSession(sessionObj: Partial<session>) {
  if (!isTruthy(sessionObj)) throw new Error("Session object is required.");

  const { drafts } = sessionObj || {};
  const flattenedSession = flattenObject(sessionObj);
  const flattenedDrafts = flattenObject(drafts);
  //handle drafts
  if (isTruthy(drafts) && !!drafts) {
    console.log("Saving drafts to database...");
    await saveUserDrafts(drafts);
  }

  console.log("Storing session...: ", flattenedSession, "flattened drafts:", flattenedDrafts);

  if (typeof window !== "undefined" && Platform.OS === "web") {
    document.cookie = `${appName}_session=${JSON.stringify(flattenedSession)}; path=/;`;
  } else {
    await SecureStore.setItemAsync(
      `${appName}_session`,
      JSON.stringify(flattenedSession)
    );
  }
}
/**@function getUserProfileByEmail Checks if a user with a specific email already exists in the database.
 * @param {string} email - The email address to check for duplication.
 * @returns {Promise<{user: userProfile | null, error: Object}|null>} An object with `user` and `error` properties if a user exists, or null if not.
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
    console.log("Existing profile:", { existingProfile });

    if (!!existingProfile && existingProfile.length > 0) {
      return { user: existingProfile, error: null } as unknown as { user: userProfile | null, error: Object | null } //return the existing user profile;
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
    if (newProfile && typeof newProfile === 'object' && 'error' in newProfile && isTruthy(newProfile.error)) {
      throw (newProfile as any).error;
    }
    //return success and user profile
    return { success: isTruthy(newProfile), user: newProfile };
  } catch (error) {
    console.error("Error registering user and creating profile:", error);
    throw error;
  }
};
