import {
  drafts,
  household,
  inventory,
  product,
  sessionDrafts as SessionDraftsType,
  task,
  vendor,
} from "@/constants/defaultSession";
import supabase from "@/lib/supabase/supabase";
import isTruthy from "@/utils/isTruthy";

/** ---------------------------
 *   Save User Drafts
 *  ---------------------------
 *  Stores the user draft in the secure store if mobile else as a cookie if a web browser.
 *  @param {@type sessionDrafts} draftObj - The draft object to store.
 */
export const saveUserDrafts = async (
  draftObj: SessionDraftsType & { [key: string]: any }
) => {
  if (!isTruthy(draftObj)) return; // no draft to save

  const tables = Object.keys(draftObj).filter((key) => key !== "user");

  //filter out non-draft objects and flatten the draft object to be the proper upsert format
  const draftUpsertData = tables.flatMap((table) => {
    return (
      draftObj[table]
        ?.filter((draft: drafts) => draft.draft_status === "draft")
        .map((draft: drafts) => ({
          ...draft.data,
          draft_status: "draft",
        })) || []
    );
  });

  const { data, error } = await supabase
    .from(tables.join(", "))
    .upsert(draftUpsertData, { onConflict: "id", ignoreDuplicates: true });

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

export const getUserDrafts = async (user_id: string, draftObj: any) => {
  //remove falsy values and user_id from the draft object
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
    .eq("draft_status", "draft")
    .eq("user_id", user_id);

  if (error) {
    console.error("Error fetching user drafts:", error);
    return null;
  }

  return data;
};
