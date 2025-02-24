import {
  household,
  inventory,
  product,
  sessionDrafts,
  task,
} from "@/constants/defaultSession";
import supabase from "@/lib/supabase/supabase";
import isTruthy from "@/utils/isTruthy";

/** ---------------------------
 *   Save User Drafts
 *  ---------------------------
 *  Stores the user draft in the secure store if mobile else as a cookie if a web browser.
 *  @param {@type sessionDrafts} draftObj - The draft object to store.
 */

const saveUserDrafts = async (draftObj: sessionDrafts) => {
  if (!isTruthy(draftObj)) return; // no draft to save
  const tables = Object.keys(draftObj)
    .filter((key) => isTruthy(draftObj[key]) && key !== "user")
    .join(",");
  const { data, error } = await supabase
    .from(tables)
    .upsert(draftObj, { onConflict: "id", handleDuplicates: true });

  if (error) {
    console.error("Error saving user drafts:", error);
    return null;
  }

  return data;
};

/** ---------------------------
 *   Get User Drafts
 *  ---------------------------
 *  Retrieves the user draft from the secure store if mobile else from a cookie if a web browser.
 *  @param {string} user_id - The user ID to retrieve drafts for.
 *  @param {any} draftObj - The draft object to retrieve.
 */

const getUserDrafts = async (user_id: string, draftObj: any) => {
  const tables = Object.keys(draftObj)
    .map((key) => {
      if (isTruthy(draftObj[key]) && key !== "user_id") return key;
      return null;
    })
    .filter((key) => isTruthy(key))
    .join(",");

  const { data, error } = await supabase
    .from(tables)
    .select()
    .eq("is_draft", true)
    .eq("user_id", user_id);

  if (error) {
    console.error("Error fetching user drafts:", error);
    return null;
  }

  return data;
};
