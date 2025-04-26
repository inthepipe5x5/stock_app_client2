import axios from "axios";
import supabase from "@/lib/supabase/supabase";
import { hash } from "../OFF/OFFcredentials";
import defaultSession, { session } from "@/constants/defaultSession";

export const createBackendClient = async ({
    globalState = defaultSession,
    url = process.env.NEXT_PUBLIC_BACKEND_URL_PRODUCTION ?? ""
    // isAppRequest = false, // Flag to differentiate app-level requests
}: {
    url?: string | null | undefined;
    globalState?: Partial<session & { session?: unknown }> | undefined;
    // userId?: string | null | undefined;
    // householdId: string | null | undefined;
    // isAppRequest?: boolean;
}) => {
    const isAppRequest = (!!globalState || Object.values((globalState ?? {}) as Partial<session>).some(Boolean)) // Flag to differentiate app-level requests
    // let user = await supabase.auth.getUser();
    // const agent = await hash(
    //     user?.data?.user?.id ?? process.env.EXPO_PUBLIC_SECRET_KEY ?? ""
    // );

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        // "User-Agent": agent,
    };

    if (isAppRequest) {
        // Add API key for app-level requests
        headers["x-api-key"] = process.env.EXPO_PUBLIC_BACKEND_API_KEY ?? "";
    } else {
        // Add Supabase JWT for authenticated user requests
        const token = await supabase.auth.refreshSession();
        headers["Authorization"] = `Bearer ${token.data.session?.access_token}`;
    }

    const client = axios.create({
        baseURL: url ?? process.env.EXPO_PUBLIC_BACKEND_URL_DEVELOPMENT,
        timeout: 10000,
        headers,
        validateStatus: (status) => {
            return status >= 200 && status < 500; // Default
        },
        params: {
            user_id: globalState?.user?.user_id ?? "",
            household_id: globalState?.households?.[0]?.id ?? "",
        },
    });

    return client;
};