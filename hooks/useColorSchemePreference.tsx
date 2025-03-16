import { useEffect, useMemo, useState } from "react";
import { Appearance, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import isTruthy from "@/utils/isTruthy";
import { appSlug } from "@/constants/appName";

const useColorSchemePreference = () => {
    const { state } = useUserSession();
    const [colorScheme, setColorScheme] = useState<"light" | "dark" | "system">("system");

    useMemo(() => {
        const fetchColorScheme = async () => {
            let storedPreferences;
            if (typeof window !== "undefined" && Platform.OS === "web") {
                const cookies = document.cookie.split("; ");
                const preferencesCookie = cookies.find((cookie) =>
                    cookie.startsWith(`${appSlug}_preferences`)
                );
                if (preferencesCookie) {
                    storedPreferences = preferencesCookie.split("=")[1];
                }
            } else {
                let preferencesKey = `${appSlug}_preferences`;
                storedPreferences =
                    (await SecureStore.getItemAsync(preferencesKey)) ||
                    (await AsyncStorage.getItem(preferencesKey));
            }

            if (storedPreferences) {
                const parsedPreferences = JSON.parse(storedPreferences);
                if (isTruthy(parsedPreferences?.theme)) {
                    setColorScheme(parsedPreferences.theme);
                    return;
                }
            }

            const colorScheme = state?.user?.preferences?.theme ?? Appearance.getColorScheme() ?? "light";
            setColorScheme(colorScheme);
        };

        fetchColorScheme();
    }, [state?.user?.preferences?.theme]);

    return colorScheme;
};

export default useColorSchemePreference;