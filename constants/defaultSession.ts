import defaultUserPreferences, {userPreferences} from "@/constants/userPreferences";
import { AuthProviderMapper } from "./oauthProviders";
import { Session } from "@supabase/supabase-js";
import { ReactNode } from "react";


const providerTypes = AuthProviderMapper.providers(true);
export type draft_status = "draft" | "confirmed" | "published" | "archived" | "deleted";

export type userProfile = { //  user profile object  public.profiles 
    user_id: string; // uuid from auth.user
    email: string | null; // email from auth.user
    phone_number: string | null | undefined; // phone_number from public.profiles
    name?: string | null | undefined; // name from auth.user
    first_name?: string | null | undefined; // first_name from auth.user
    last_name?: string | null | undefined; // last_name from auth.user
    preferences?: userPreferences;

    //address columns
    postalcode?: string | null | undefined; // postalcode from public.profiles
    city?: string | null | undefined; // city from public.profiles
    state?: string | null | undefined; // city from public.profiles
    country?: string | null | undefined; // 3 char country code from public.profiles 
    
    //meta data table columns
    draft_status: draft_status; // draft_status from public.profiles
    created_at: string | null | undefined; // created_at 
    app_metadata?: Partial<app_metadata> | null | undefined; // app_metadata from public.profiles

};
//app_metadata column from public.profiles intended to capture metadata about the user
//automatically created by the Supabase trigger `create_profile_from_auth_trigger` upon a new entry in `auth.user`.
export type app_metadata= {
    avatar_url?: string; //avatar url
    //auth details
    is_super_admin: boolean; //from supabase.auth.user
    sso_user: boolean; //from supabase.auth.user
    provider?: typeof providerTypes;//typeof providerTypes[number]; // provider from auth.user
    setup?: authSetupData; //created when user completes auth set up (each key updated at each auth page) optionally  
    authMetaData?: any | undefined; //authMetaData from auth.user
}
//intended for Auth context to capture the user's setup progress
export type authSetupData =  {
    email?: boolean | null;
    authenticationMethod?: boolean | null;
    account?: boolean | null;
    details?: boolean | null;
    preferences?: boolean | null;
    confirmation?: boolean | null;
}
export type access_level = "guest" | "member" | "manager" | "admin";

export type household = {
    id: string; // uuid from public.households
    initial_template_name?: string; // initial_template_name from public.households
    description?: string; // description from public.households
    styling?: object; // styling from public.households
    active?: boolean; // determines if this household is active or not; only 1 household should be active at a time
    members?: userProfile[]; // array of user_id from public.user_households
    inventories?: inventory[]; // array of inventory_id from public.inventories
    products?: product[]; // array of product_id from public.products
    tasks?: task[]; // array of task_id from public.tasks
    
    // //user_households joint table columns
    // access_level?: access_level; // access_level from public.user_households
    // invited_by?: userProfile["user_id"]; // uuid from public.profiles 
    // invited_at?: string | null | undefined // timestamp with time zone
    // invite_accepted?: boolean | null | undefined; // DEFAULT null
    // invite_expires_at?: string | null | undefined; // timestamp with time zone
};
export type user_households = {
    user_id: userProfile["user_id"]; // uuid from public.profiles
    household_id: household["id"]; // uuid from public.households
    access_level: access_level; // access_level from public.user_households
    invited_by: userProfile["user_id"]; // uuid from public.profiles 
    invited_at: string; // timestamp with time zone
    invite_accepted: boolean; // DEFAULT null
    invite_expires_at: string; // timestamp with time zone
}
export type inventory = {
    id: string; // uuid from public.inventories
    name: string; // name from public.inventories
    description: string; // description from public.inventories
    household_id: household["id"]; // uuid from public.households
    category: string; // category from public.inventories
    draft_status: draft_status; // draft_status from public.inventories
    is_template: boolean; // is_template from public.inventories
    styling: object; // styling from public.inventories
    active: boolean; // determines if this inventory is active or not; only 1 household and all related inventories, products, tasks should be active at a time
};

export type product = {
    id: string; // uuid from public.products
    product_name: string; // product_name from public.products
    description: string; // description from public.products
    inventory_id: inventory["id"]; // uuid from public.inventories
    
    vendor_id: vendor["id"]; // uuid from public.suppliers
    auto_replenish: boolean; // auto_replenish from public.products
    min_quantity: number; // min_quantity from public.products
    max_quantity: number; // max_quantity from public.products
    current_quantity: number; // current_quantity from public.products
    quantity_unit: string; // quantity_unit from public.products
    current_quantity_status: string; // current_quantity_status from public.products
    barcode: string; // barcode from public.products
    qr_code: string; // qr_code from public.products
    last_scanned: string; // last_scanned from public.products
    scan_history: object; // scan_history from public.products
    expiration_date: string; // expiration_date from public.products
    updated_dt: string; // updated_dt from public.products
    draft_status: draft_status; // draft_status from public.products
    is_template: boolean; // is_template from public.products
    product_category: string; // product_category from public.products
    icon_name: string; // icon_name from public.products
    tasks: task[]; // related entries from public.tasks
};

export type task = {
    id: string; // uuid from public.tasks
    task_name: string; // task_name from public.tasks
    description: string; // description from public.tasks
    user_id: userProfile["user_id"]; // uuid from public.profiles
    product_id: product["id"]; // uuid from public.products
    due_date: string; // due_date from public.tasks
    completion_status: string; // completion_status from public.tasks
    recurrence_interval: string; // recurrence_interval from public.tasks
    recurrence_end_date: string; // recurrence_end_date from public.tasks
    is_automated: boolean; // is_automated from public.tasks
    automation_trigger: string; // automation_trigger from public.tasks
    created_by: string; // uuid from public.profiles
    created_dt: string; // created_dt from public.tasks
    updated_dt: string; // updated_dt from public.tasks
    last_updated_by: string; // uuid from public.profiles
    draft_status: draft_status; // draft_status from public.tasks
    is_template: boolean; // is_template from public.tasks
    assigned_to: userProfile; // assigned user obj from public.tasks, 
};

export type vendor = {
    id: string; // uuid from public.suppliers
    name: string; // name from public.suppliers
    description: string; // description from public.suppliers
    product_types: string[]; // product_types from public.suppliers
    vendor_type: string[]; // vendor_type from public.suppliers
    addresses: string[]; // addresses from public.suppliers
    cities: string[]; // cities from public.suppliers
    regions: string[]; // regions from public.suppliers
    countries: string[]; // countries from public.suppliers
    is_retail_chain: boolean; // is_retail_chain from public.suppliers
    draft_status: draft_status; // draft_status from public.suppliers
    vendor_scale: string; // vendor_scale from public.suppliers
    is_template: boolean; // is_template from public.suppliers
    user_ranking: number; // user_ranking from public.suppliers
    // products: product[]; // array of product_id from public.products
};

export type drafts = {
    id?: string; // uuid from public schema table
    type?: "household" | "inventory" | "product" | "task" | "vendor" | "user"; // type from public schema table
    draft_status?: draft_status | null | undefined; // status from public schema table
    data: Partial<household> | Partial<inventory> | Partial<product> | Partial<task> | Partial<vendor> | Partial<userProfile> | null | undefined; // data from public schema table
};

// export type sessionDrafts = {
//     user?: Partial<userProfile> | undefined | null; // user_id from public.profiles
//     households?: Partial<household>[] | undefined | null; // array of household_id from public.households
//     inventories?: Partial<inventory>[] | undefined | null; // array of inventory_id from public.inventories
//     products?: Partial<product>[] | undefined | null; // array of product_id from public.products
//     tasks?: Partial<task>[] | undefined | null; // array of task_id from public.tasks
//     vendors?: Partial<vendor>[] | undefined | null; // array of task_id from public.tasks
// };

export type sessionDrafts = {
    [key in "user" | "households" | "inventories" | "products" | "tasks" | "vendors"]?: Partial<drafts>[];
};

export type supabaseAuthUserRecord = {
    instance_id: string | null;
    id: string;
    aud: string | null;
    role: string | null;
    email: string | null;
    encrypted_password: string | null;
    email_confirmed_at: string | null;
    invited_at: string | null;
    confirmation_token: string | null;
    confirmation_sent_at: string | null;
    recovery_token: string | null;
    recovery_sent_at: string | null;
    email_change_token_new: string | null;
    email_change: string | null;
    email_change_sent_at: string | null;
    last_sign_in_at: string | null;
    raw_app_meta_data: object | null;
    raw_user_meta_data: object | null;
    is_super_admin: boolean | null;
    created_at: string | null;
    updated_at: string | null;
    phone: string | null;
    phone_confirmed_at: string | null;
    phone_change: string | null;
    phone_change_token: string | null;
    phone_change_sent_at: string | null;
    confirmed_at: string | null;
    email_change_token_current: string | null;
    email_change_confirm_status: number | null;
    banned_until: string | null;
    reauthentication_token: string | null;
    reauthentication_sent_at: string | null;
    is_sso_user: boolean;
    deleted_at: string | null;
    is_anonymous: boolean;
};

/** @see Session => use that type instead*/
// export type authSession = {
//     user: supabaseAuthUserRecord | null;
//     session: {
//         // required
//         access_token: string | null;
//         expires_at: string | Date | null;
//         // optional
//         created_at?: string | Date | null;
//         updated_at?: string | Date | null;
//     } | null;
// }

export type UserMessage = {
    id: string;
  type: "error" | "info" | "success";
  title?: string | undefined | null;
  subtitle?: string | undefined | null;
  description?: string | undefined | null;
  duration?: number | undefined | null;
  onDismiss?: () => void;
  ToastCallToAction?: ReactNode;
};

export type session = {
    user?: Partial<userProfile> | null | undefined;
    session?: Partial<supabaseAuthUserRecord & Session> | null | undefined;
    drafts?: sessionDrafts | null | undefined; // array of drafts from public schema table
    households?: household[] | null | undefined; // array of household_id from public.households
    inventories?: inventory[] | null | undefined; // array of inventory_id from public.inventories
    products?: product[] | null | undefined; // array of product_id from public.products
    tasks?: task[] | null | undefined; // array of task_id from public.tasks
    isAuthenticated: boolean | null | undefined;
    message?: UserMessage[] | null | undefined;
};

const defaultSession: Partial<session> = {
    user: null as unknown as Partial<userProfile>,
    session: null as unknown as Partial<supabaseAuthUserRecord & Session>,
    drafts: {} as Partial<sessionDrafts>,
    households: [], // array of household_id from public.households
    inventories: [], // array of inventory_id from public.inventories
    products: [], // array of product_id from public.products
    tasks: [], // array of task_id from public.tasks
    message: [] as UserMessage[],
    isAuthenticated: false,
};

export default defaultSession;
// export type { userPreferences, userProfile, household, inventory, product, task, vendor, drafts, sessionDrafts, session, app_metadata, authSetupData, UserMessage}//, supabaseAuthUserRecord };