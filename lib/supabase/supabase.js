import { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import LargeSecureStore from "./largeSecureStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const createWebStorage = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    return localStorage;
  }

  return {
    getItem: async (key) => {
      return localStorage.getItem(key);
    },
    setItem: async (key, value) => {
      localStorage.setItem(key, value);
    },
    removeItem: async (key) => {
      localStorage.removeItem(key);
    },
  };
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "SUPABASE_URL";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "SUPABASE_ANON_KEY";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase URL or Anon Key, ${{
      url: supabaseUrl,
      key: supabaseAnonKey,
    }}`
  );
}

// const storage = Platform.OS === "web" ? createWebStorage() : LargeSecureStore;
const storage = AsyncStorage; //TODO: Change to LargeSecureStore when it's ready
/**
 * Create Supabase client with chosen storage for auth tokens.
 */
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web", // Prevents Supabase from evaluating window.location.href, breaking mobile
  },
});

export default supabase;
