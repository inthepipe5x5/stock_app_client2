import { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";
import { createClient, SupabaseClientOptions, RealtimeMessage, RealtimeClientOptions } from "@supabase/supabase-js";

import LargeSecureStore from "./largeSecureStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GeneralCache, GeneralStorage } from "../storage/mmkv";

// /**
//  * The function `createWebStorage` creates a web storage object that uses `localStorage` if available
//  * in the browser, otherwise it provides methods for storing data.
//  * @returns The `createWebStorage` function returns an object with methods `getItem`, `setItem`, and
//  * `removeItem` that interact with the `localStorage` if it is available in the `window` object. If
//  * `localStorage` is not available, it returns an object with the same methods that mimic the behavior
//  * of `localStorage`.
//  */
// const createWebStorage = () => {
//   if (typeof window !== "undefined" && window.localStorage) {
//     return localStorage;
//   }

//   return {
//     getItem: async (key) => {
//       return localStorage.getItem(key);
//     },
//     setItem: async (key, value) => {
//       localStorage.setItem(key, value);
//     },
//     removeItem: async (key) => {
//       localStorage.removeItem(key);
//     },
//   };
// };

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "SUPABASE_URL";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "SUPABASE_ANON_KEY";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase URL or Anon Key, ${JSON.stringify({
      url: supabaseUrl,
      key: supabaseAnonKey,
    }, null, 2)} `
  );
}

// const storage = Platform.OS === "web" ? createWebStorage() : LargeSecureStore;
const storage = GeneralCache; //TODO: Change to LargeSecureStore after refactoring it to use MMKV
/**
 * Create Supabase client with chosen storage for auth tokens.
 */
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web" ?? false, // Prevents Supabase from evaluating window.location.href, breaking mobile
  } as SupabaseClientOptions<string>["auth"],
  realtime: {
    params: {
      eventsPerSecond: 10, // Limit to 10 events per second
      log_level: 'info',
      logger: ( //log real time messages
        level: 'info' | 'debug' | 'warn' | 'error',
        message: RealtimeMessage | any) => {
        switch (level) {
          case 'info':
            console.log('Realtime info:', level, "REAL TIME MESSAGE OBJECT", { message });
            break;
          case 'debug':
            console.debug('Realtime debug:', level, "REAL TIME MESSAGE OBJECT", { message });
            break;
          case 'warn':
            console.warn('Realtime warning:', level, "REAL TIME MESSAGE OBJECT", { message });
            break;
          case 'error':
            console.error('Realtime error:', level, "REAL TIME MESSAGE OBJECT", { message });
            break;
          default:
            console.log('Realtime unknown level:', level, "REAL TIME MESSAGE OBJECT", { message });
        }
      },
    },
    // broadcast: {
    //   type: "websocket",
    //   options: {
    //     maxReconnectAttempts: 5,
    //     minReconnectInterval: 1000,
    //     maxReconnectInterval: 30000,
    //   },
    // },
  }
});

export default supabase;
