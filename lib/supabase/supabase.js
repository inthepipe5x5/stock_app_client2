import { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import LargeSecureStore from "./largeSecureStore";

const createWebStorage = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    return localStorage;
  }
  // Server-side storage implementation
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
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

const storage = Platform.OS === "web" ? createWebStorage() :new LargeSecureStore();

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
