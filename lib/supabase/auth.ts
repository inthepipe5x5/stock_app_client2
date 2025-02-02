import * as AuthSession from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import supabase from "@/lib/supabase/supabase.js";
import { EmailOtpType } from "@supabase/supabase-js";

//I THINK THIS NEEDS TO BE ARCHIVED

WebBrowser.maybeCompleteAuthSession(); // required for web only
const redirectTo = AuthSession.makeRedirectUri();

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;

  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  return data.session;
};

type Provider = "google" | "facebook" | "apple";


const sendMagicLink = async (email:string) => {
    if (!email) throw new Error("Email is required");

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
  
    if (error ) throw error;
    // Email sent.
  };

const performOAuth = async (provider: Provider = "google") => {
    const redirectUrl = AuthSession.makeRedirectUri({ useProxy: true });
  
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    });
  
    if (error) throw error;
  
    if (data?.url) {
      const result = await AuthSession.startAsync({ authUrl: data.url });
      if (result.type === "success") {
        // Send tokens to your backend
        await (result.params.access_token, result.params.refresh_token);
        // Your backend handles session creation and returns necessary info
        // You can then update your app's state accordingly
      }
    }
  };

  export { createSessionFromUrl, sendMagicLink, performOAuth };