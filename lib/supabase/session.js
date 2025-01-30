// import supabase from "@/services/supabase/supabase.js";
import supabase from "@/lib/supabase/supabase";

//utility data fetching functions

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
