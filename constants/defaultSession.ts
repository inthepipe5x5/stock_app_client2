import defaultUserPreferences from "@/constants/userPreferences";
import { AuthProviderMapper } from "./oauthProviders";

type userPreferences = {
    theme: "system";
    fontSize: "medium";
    fontFamily: "default";
    boldText: boolean;
    highContrast: boolean;
    reduceMotion: boolean;
    screenReaderEnabled: boolean;
    hapticFeedback: boolean;
    notificationsEnabled: boolean;
    soundEffects: boolean;
    language: string;
    autoPlayVideos: boolean;
    dataUsage: "low" | "normal" | "high";
    colorBlindMode: "none" | "protanopia" | "deuteranopia" | "tritanopia";
    textToSpeechRate: number;
    zoomLevel: number;
};
const providerTypes = AuthProviderMapper.providers();
type user = { // combined user object from auth.user & public.profiles 
    id: string; // uuid from auth.user
    email: string; // email from auth.user
    first_name: string; // first_name from auth.user
    last_name: string; // last_name from auth.user
    provider: typeof providerTypes[number]; // provider from auth.user

    preferences: userPreferences;
};

type household = {
    id: string; // uuid from public.households
    initial_template_name: string; // initial_template_name from public.households
    description: string; // description from public.households
    styling: object; // styling from public.households
    active: boolean; // determines if this household is active or not; only 1 household should be active at a time
    members: user[]; // array of user_id from public.user_households
    inventories: inventory[]; // array of inventory_id from public.inventories
    products: product[]; // array of product_id from public.products
    tasks: task[]; // array of task_id from public.tasks
};

type inventory = {
    id: string; // uuid from public.inventories
    name: string; // name from public.inventories
    description: string; // description from public.inventories
    household_id: string; // uuid from public.households
    category: string; // category from public.inventories
    draft_status: string; // draft_status from public.inventories
    is_template: boolean; // is_template from public.inventories
    styling: object; // styling from public.inventories
    active: boolean; // determines if this inventory is active or not; only 1 household and all related inventories, products, tasks should be active at a time
};

type product = {
    id: string; // uuid from public.products
    product_name: string; // product_name from public.products
    description: string; // description from public.products
    inventory_id: string; // uuid from public.inventories
    vendor_id: string; // uuid from public.suppliers
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
    draft_status: string; // draft_status from public.products
    is_template: boolean; // is_template from public.products
    product_category: string; // product_category from public.products
    icon_name: string; // icon_name from public.products
    tasks: task[]; // related entries from public.tasks
};

type task = {
    id: string; // uuid from public.tasks
    task_name: string; // task_name from public.tasks
    description: string; // description from public.tasks
    user_id: string; // uuid from public.profiles
    product_id: string; // uuid from public.products
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
    draft_status: string; // draft_status from public.tasks
    is_template: boolean; // is_template from public.tasks
    assigned_to: user; // assigned user obj from public.tasks
};

type vendor = {
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
    draft_status: "draft" | "submitted" | "approved" | "rejected"; // draft_status from public.suppliers
    vendor_scale: string; // vendor_scale from public.suppliers
    is_template: boolean; // is_template from public.suppliers
    user_ranking: number; // user_ranking from public.suppliers
    products: product[]; // array of product_id from public.products
};

type drafts = {
    id: string; // uuid from public schema table
    type: "household" | "inventory" | "product" | "task" | "vendor"; // type from public schema table
    status: "draft" | "submitted" | "approved" | "rejected"; // status from public schema table
    data: household | inventory | product | task | vendor; // data from public schema table
};

type sessionDrafts = {
    households: household[]; // array of household_id from public.households
    inventories: inventory[]; // array of inventory_id from public.inventories
    products: product[]; // array of product_id from public.products
    tasks: task[]; // array of task_id from public.tasks
};

type session = {
    user: user | null;
    preferences: userPreferences | null;
    access_token: string | null; //access_token from auth.user
    drafts: sessionDrafts | null; // array of drafts from public schema table
    households: household[] | null; // array of household_id from public.households
    inventories: inventory[] | null; // array of inventory_id from public.inventories
    products: product[] | null; // array of product_id from public.products
    tasks: task[] | null; // array of task_id from public.tasks
    isAuthenticated: boolean | null;
};

const defaultSession = {
    user: null,
    preferences: defaultUserPreferences,
    access_token: null,
    drafts: {
        households: [],
        inventories: [],
        products: [],
        tasks: []
    },
    households: [], // array of household_id from public.households
    inventories: [], // array of inventory_id from public.inventories
    products: [], // array of product_id from public.products
    tasks: [], // array of task_id from public.tasks
    isAuthenticated: false,
} as session;

export default defaultSession;
