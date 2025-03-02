import {
  drafts,
  household,
  inventory,
  product,
  sessionDrafts,
  sessionDrafts as SessionDraftsType,
  task,
  userProfile,
  vendor,
} from "@/constants/defaultSession";
import supabase from "@/lib/supabase/supabase";
import isTruthy from "@/utils/isTruthy";
import { Action } from "@/components/contexts/sessionReducer";
import { remapKeys } from "@/utils/pick";
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

/** ---------------------------
 *   AddUserDrafts
 *  ---------------------------
 *  Adds a draft object to the app's drafts object within global state.
 *
 *  @param {Object[]} prevDraftObj - The the current draft object(s) to add to.
 *  @param {Object[]} draftObj - The draft object(s) to add.
 *  @param {Function} dispatch - The dispatch function to update the global state.
 */

interface AddUserDraftsParams {
  prevDraftObj: Partial<sessionDrafts> | null;
  draftObj: {
    key:
      | "user"
      | "inventories"
      | "products"
      | "tasks"
      | "vendors"
      | "households";
    value: Partial<
      drafts | userProfile | inventory | product | task | vendor | household
    >[];
  };

  dispatch: (action: Action) => void;
}

export const addUserDrafts = ({
  prevDraftObj,
  draftObj,
  dispatch,
}: AddUserDraftsParams) => {
  if (!isTruthy(draftObj)) return; // no draft to add
  if ("user" in draftObj) {
    const filteredDraftObj = remapKeys(draftObj, {
      user: null as any,
      users: null as any,
    });
  }
  if (isTruthy(prevDraftObj)) {
    // Iterate over each key in the draft object
    Object.keys(draftObj).forEach((key) => {
      const draftKey = key as keyof sessionDrafts;

      // Initialize the draft array if it doesn't exist in the previous draft object
      if (!prevDraftObj![draftKey]) {
        prevDraftObj![draftKey] = [];
      }

      // Iterate over each new draft in the current draft object
      draftObj[draftKey].forEach((newDraft) => {
        // Find the index of the existing draft with the same ID
        const index = prevDraftObj![draftKey]!.findIndex(
          (existingDraft) => existingDraft.id === newDraft.id
        );

        if (index !== -1) {
          // Update the existing draft if found
          prevDraftObj![draftKey]![index] = newDraft;
        } else {
          // Append the new draft if not found
          prevDraftObj![draftKey]!.push(newDraft);
        }
      });
    });
  }
};
