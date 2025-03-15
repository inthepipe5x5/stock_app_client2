//complete new user registration
import supabase from "@/lib/supabase/supabase"
import defaultUserPreferences from "@/constants/userPreferences";
import { userProfile } from "@/constants/defaultSession";

/**
 * Completes the registration process by updating the automatically created barebones entry 
 * in the `public.profiles` table. This entry is initially created by the Supabase trigger 
 * `create_profile_from_auth_trigger` upon a new entry in `auth.user`.
 * 
 * The function updates the profile with additional user details such as preferences, 
 * metadata, and timestamps.
 * 
 * @param newUser - The user profile data to be updated in the `public.profiles` table.
 * @param sso_user - A boolean indicating if the user is a Single Sign-On (SSO) user.
 * @returns The updated user profile data.
 * @throws Will throw an error if there is an issue inserting/updating the user profile.
 */
export const completeUserProfile = async (newUser: userProfile, sso_user: boolean) => {
    try {
        if (!newUser || newUser === null) return; // return if no user data

        // set default values
        sso_user = ((newUser?.app_metadata?.sso_user) ?? sso_user) || false;
        newUser.app_metadata = { ...(newUser?.app_metadata ?? {}), sso_user };//, setup: defaultProfileSetup};
        newUser.preferences = { ...(newUser?.preferences ?? {}), ...defaultUserPreferences };
        newUser.created_at = newUser?.created_at ? newUser.created_at : new Date().toISOString();

        // register new user into public.profiles table with upsert
        const { data, error } = await supabase
            .from('profiles')
            .upsert(newUser, {
                onConflict: 'user_id,email', //Comma-separated UNIQUE column(s) to specify how duplicate rows are determined. Two rows are duplicates if all the onConflict columns are equal.
                ignoreDuplicates: false, //set false to merge duplicate rows
            })
            .select()
            .limit(1);

        if (error) {
            throw new Error(`Error inserting/updating user: ${error.message}`);
        }

        return data;
    } catch (error: any) {
        console.error('Error creating profile:', error.message);
    }

}

/**
 * Inserts a user into the user_households joint table.
 * 
 * @param user_id - The ID of the user.
 * @param household_id - The ID of the existing household.
 * @returns The inserted entry from the user_households table.
 * @throws Will throw an error if there is an issue inserting the entry.
 */
export const addUserToHousehold = async (user_id: string, household_id: string, invited_at: string = new Date().toISOString()) => {
    try {
        const { data, error } = await supabase
            .from('user_households')
            .upsert({
                user_id,
                household_id,
                invited_at,
                role: "member",
                invite_accepted: true,
                options: {
                    onConflict: ["household_id", "user_id"],
                    ignoreDuplicates: true
                }
            })
            .select()
            .limit(1);

        if (error) {
            throw new Error(`Error inserting user into household: ${error.message}`);
        }

        return data;
    } catch (error: any) {
        console.error('Error adding user to household:', error.message);
    }
};

/**
 * Creates a new household and associates it with a user, then inserts inventories.
 * 
 * @param user_id - The ID of the user.
 * @param newHouseholdData - The data for the new household.
 * @param inventories_data - The data for the new inventories.
 * @returns The new household entry with associated inventories.
 * @throws Will throw an error if there is an issue creating the household or inventories.
 */
export const createHouseholdWithInventories = async (user_id: string, newHouseholdData: any, inventories_data: any[]) => {
    try {
        newHouseholdData.is_template = false;

        const { data: householdData, error: householdError } = await supabase
            .from('households')
            .insert(newHouseholdData)
            .select()
            .limit(1);

        if (householdError) {
            throw new Error(`Error creating household: ${householdError.message}`);
        }

        const household = householdData[0];

        await addUserToHousehold(user_id, household.id);

        const newInventories = inventories_data.map(inventory => ({
            ...inventory,
            household_id: household.id,
            is_template: false
        }));

        const { data: inventoriesData, error: inventoriesError } = await supabase
            .from('inventories')
            .insert(newInventories)
            .select();

        if (inventoriesError) {
            throw new Error(`Error creating inventories: ${inventoriesError.message}`);
        }

        return { ...household, inventories: inventoriesData };
    } catch (error: any) {
        console.error('Error creating household with inventories:', error.message);
    }
};

/**
 * Searches for household and inventory templates.
 * 
 * @returns The household templates with associated inventories.
 * @throws Will throw an error if there is an issue fetching the templates.
 */
export const getHouseholdAndInventoryTemplates = async () => {
    try {
        const { data, error } = await supabase
            .from('households')
            .select(`
            *,
            inventories:inventories(*)
            `)
            .eq('is_template', true);

        if (error) {
            throw new Error(`Error fetching household and inventory templates: ${error.message}`);
        }

        return data;
    } catch (error: any) {
        console.error('Error fetching household and inventory templates:', error.message);
    }
};

/**
 * Searches for product and inventory templates with specific criteria using a SQL join.
 * @param productCategories - The criteria to filter the templates.
 * @returns The product and inventory templates matching the criteria.
 * @throws Will throw an error if there is an issue fetching the templates.
 */
export const getProductAndInventoryTemplates = async (productCategories: string[]) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
                products.*,
                inventories:inventories(*)
            `)
            // .innerJoin('inventories', 'products.product_category', 'inventories.category')
            .in('products.product_category', productCategories)
            .eq('products.draft_status', 'published')
            .eq('products.is_template', true)
            .eq('inventories.is_template', true);

        if (error) {
            throw new Error(`Error fetching product and inventory templates: ${error.message}`);
        }

        return data;
    } catch (error: any) {
        console.error('Error fetching product and inventory templates:', error.message);
    }
};