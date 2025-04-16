import { useUserSession } from "@/components/contexts/UserSessionProvider";
import defaultSession from "@/constants/defaultSession";
import { useLocalSearchParams, usePathname, router, RelativePathString } from "expo-router";
import { useCallback } from "react";

type RedirectProps = {
    start: RelativePathString;
    end?: RelativePathString | null | undefined;
};
/** @remark This hook is used to redirect the user to a different page based on their authentication status. 
 * It also handles the redirection after the user has logged in or registered.
 *  @remark This hook is used in the following routes:
 * * *  - Login / Register routes
 * * *  - Add / Update / Delete routes
 * * @param param0
 * * @param start - The path to redirect to if the user is not authenticated. Default is '/(auth)'.
 * * @param end - The path to redirect to after the user has logged in or registered. Default is '/(tabs)'.
 * * @returns {Object} - An object containing the following properties:
 * * * * startRedirect: A function to redirect the user to the specified path.
 * * * * goBack: A function to go back to the previous page.
 *  
 *  * @example
 * * const { startRedirect, goBack } = useRedirect({ start: '/(auth)', end: '/(tabs)' });
 * * * startRedirect(); // Redirects the user to the specified path.
 * * * goBack(); // Goes back to the previous page.
 * */
export default function useRedirect({ start, end }: RedirectProps) {
    const state = useUserSession()?.state ?? defaultSession;

    const pathname = usePathname(); //current path
    const params = useLocalSearchParams(); //current params

    const redirectTo = start ?? (!!state?.isAuthenticated ? '/(tabs)' : '/(auth)'); //path to redirectTo
    const redirectToEnd = end ?? pathname; //original path 

    const startRedirect = useCallback(() => {
        router.replace({
            pathname: redirectTo as RelativePathString,
            params: {
                ...params,
                ...{
                    dismissToURL: redirectTo,
                    nextURL: redirectTo,
                    user_id: state?.user?.user_id ?? "",
                    household_id: state?.households?.[0]?.id ?? "",
                }
            }
        })
    }, [])
    const goBack = useCallback(() => {
        const returnParams = params?.nextURL ?? params?.dismissToURL ?? null;

        if (!!!returnParams) router.canGoBack() ? router.back() : router.push("/(tabs)");
        //grab the return path and params before resetting params
        const dismissPath = Array.isArray(returnParams) ? returnParams[0] : returnParams.includes(',') ? returnParams.split(',')[0] : returnParams;
        const additionalReturnParams = Object.keys(params ?? {}).reduce((acc: Record<string, any>, key) => {
            if (key !== "nextURL" && key !== "dismissToURL") {
                acc[key] = params[key];
            }
            return acc;
        }, {} as Record<string, any>);

        router.setParams({}); // reset params to avoid infinite loop

        router.dismissTo({
            pathname: dismissPath as RelativePathString,
            params: {
                ...additionalReturnParams ?? {}
            }
        })

    }, [])
    return {
        startRedirect,
        goBack,
        redirectTo,
        redirectToEnd,
    }
}