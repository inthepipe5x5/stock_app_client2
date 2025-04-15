import axios from "axios";
import supabase from "@/lib/supabase/supabase";

export const createBackendClient = async () => {

    let token = await supabase.auth.getUser()

    axios.create({
        baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
        timeout: 10000,
        headers: !!token ? {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        } : {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        validateStatus: (status) => {
            return status >= 200 && status < 500; // Default
        }
    });

};

