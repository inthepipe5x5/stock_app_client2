// import supabase from "./supabase"
// import { router, usePathname } from "expo-router"
// import { AuthChangeEvent, AuthSession } from "@supabase/supabase-js";
// import { getUserProfileByEmail } from "./session";
// import defaultUserPreferences from "@/constants/userPreferences";
// import { completeUserProfile, getHouseholdAndInventoryTemplates } from "./register";
// import { House } from "lucide-react-native";
// import { fakeUserAvatar } from "../placeholder/avatar";

// const supabaseAuthEvents: AuthChangeEvent[] = [
//     'INITIAL_SESSION',
//     'PASSWORD_RECOVERY',
//     'SIGNED_IN',
//     'SIGNED_OUT',
//     'TOKEN_REFRESHED',
//     'USER_UPDATED',
//     "MFA_CHALLENGE_VERIFIED",
//     "PASSWORD_RECOVERY",
// ];

// interface AuthEventHandlersParams {
//     event: AuthChangeEvent,
//     session: AuthSession,
//     dispatchFunction?: () => void
// }

// const handleInitialSession = async (event, session, dispatchFunction): Promise<AuthEventHandlersParams> => {
//     let user;
//     let households
//     let inventories;
//     let drafts = {};

//     //check if public.profiles has a record for the user
//     const existingProfile = await getUserProfileByEmail(session.user.id);
//     const initialProfile = {
//         user_id: session.user.id,
//         email: session.user.email,
//         first_name: "",
//         last_name: "",
//         name: "",
//         preferences: defaultUserPreferences,
//         created_at: new Date().toISOString(),
//         app_metadata: {
//             is_super_admin: false,
//             sso_user: false,
//             setup: {
//                 auth: {
//                     email: true,
//                     authenticationMethod: true,
//                     account: true,
//                     details: true,
//                     preferences: true,
//                     confirmation: true,
//                 }, resources: {
//                     joinHousehold: false,
//                     joinInventory: false,
//                     addProduct: false,
//                     addTask: false,
//                 }
//             },
//             provider: session.user.provider || undefined,
//             photo: session.user.user_metadata?.avatar_url ||
//                 fakeUserAvatar({ name: session.user.name, size: 100, fontColor: "black", avatarBgColor: "light" }),
//         }
//     };

//     //create new profile
//     const newProfile = !existingProfile ? { ...initialProfile, ...session.user } : { ...initialProfile, ...existingProfile };
//     let newCompletedProfile = await completeUserProfile(newProfile, false);
//     user = newCompletedProfile ? newCompletedProfile : newProfile

//     //insert new profile into public.profiles
//     const userHousehold = await supabase.from('user_households').select().eq("user_id", user.user_id);

//     if (userHousehold) {
//         households = userHousehold && userHousehold.data ? userHousehold.data.reduce((households, nextHousehold) => {
//             households[nextHousehold.household_id] ? { ...households[nextHousehold.household_id], ...nextHousehold } : households[nextHousehold.household_id] = nextHousehold;
//         }, {}) : {};
//     } else {
//         const templates = getHouseholdAndInventoryTemplates()
//         drafts = templates;


//         //check if user is in a household
//         //if not, redirect to router.replace(household/new) to create user_households record


//         // return { event, session, dispatchFunction };

//         return {
//             user, households, inventories, drafts
//         }
//     }

//     const handlePasswordRecovery = (event, session, dispatchFunction) => {
//         //manually handle password recovery event by redirecting to the password reset screen
//         if (event === "PASSWORD_RECOVERY") {
//             router.replace("/(auth)/(signin)/reset-password")
//         } else if (event === "MFA_CHALLENGE_VERIFIED") {
//             router.replace("/(auth)/(signin)/reset-password")
//         } else if (event === "USER_UPDATED") { //handle succcessful pasword reset

//         }

//         const handleSignedIn = (event, session, dispatchFunction) => { }

//         const handleSignedOut = (event, session, dispatchFunction) => { }

//         const handleTokenRefreshed = (event, session, dispatchFunction) => { }

//         const handleUserUpdated = (event, session, dispatchFunction) => { }


//         // const supabaseAuthListener = (event: AuthChangeEvent, session: AuthSession, dispatchFunction: () => void) => {
//         //     let authenticated = false;
//         //     if (!["SIGNED_OUT",])

//         //         if (event === "INITIAL_SESSION") {
//         //             handleInitialSession(session, dispatchFunction);
//         //         }
//         // }

//         export { supabaseAuthEvents, supabaseAuthListener }