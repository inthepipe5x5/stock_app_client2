import appInfo from '../../app.json';
import * as Crypto from 'expo-crypto';
import { product_category_type } from './Api';
/**
 * @fileoverview This file contains the authentication methods for the OFF API.
 * API use @link https://openfoodfacts.github.io/openfoodfacts-server/api/#if-your-users-do-not-expect-a-result-immediately-eg-inventory-apps}
    * 
    * Auth Schemas {@link https://openfoodfacts.github.io/openfoodfacts-server/api/ref-v2/#cmp--securityschemes-useragentauth}

*/
export const PROD_OFF_API_URL = process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_API ?? "https://world.openfoodfacts.org/api/v0/";
//use staging API for development purposes as per OFN recommendation

export const getOFFURL = ({
    env = (process.env.EXPO_PUBLIC_NODE_ENV as "development" | "production" | "staging" | "testing" | null) ?? "development",
    apiVersion = process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_API_VERSION ?? 2,
    countryCode = process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_COUNTRY_CODE ?? "world",
    endpoint = null,
    category = null,
    getPrice = false,
}: {
    env?: "development" | "production" | "staging" | "testing" | null | undefined,
    apiVersion?: number | string | null | undefined,
    countryCode?: string | null | undefined,
    endpoint?: string | null | undefined,
    category?: product_category_type | null | undefined,
    getPrice?: boolean | null | undefined,
}) => {

    let base = (PROD_OFF_API_URL ?? `https://world.openfoodfacts.org/api/v0`)
        .replace("world.", !!getPrice ? `prices` : `${countryCode}.`)
        .replace(/v\d+/, `v${apiVersion}`);

    if (!!env && ["development", "staging"].includes(env)) {
        base = String(PROD_OFF_API_URL.replace(".org", ".net")) + `${apiVersion}`;
    }
    else if (!!category) {
        base = base.replace('food', category);
    }
    else {
        return `${PROD_OFF_API_URL}/${apiVersion}`;
    }

    return new URL(base + (!!endpoint ? endpoint : "/")).toString();
};

// export type OFFCredentialsType = {
//     user?: string | null | undefined;
//     password?: string | null | undefined;
//     salt?: string | null | undefined;
//     token?: string | null | undefined;
// }

export type OFFCredentialsType = {
    app_name?: string | null | undefined;
    app_version?: string | null | undefined;
    app_uuid?: string | null | undefined;
};

// export const OFF_CREDENTIALS = process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_USERNAME
//     ? {
//         user: process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_USERNAME ?? process.env.EXPO_PUBLIC_CONTACT_EMAIL,
//         password: process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_PASSWORD,
//         salt: process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_SALT
//     }
//     : null



/**{@link https://openfoodfacts.github.io/openfoodfacts-server/api/} 
 * 
 * For write queries that require global account authentication on Open Food Facts, the following parameters are required:
 * - app_name: @string The name of the application.
 * - app_version: @number | @float The version of the application.
 * - user: @string The user ID from the public.profiles table.
 * 
 * @param user_id 
 * @returns the 
 */
export const globalOFFWriteQueryCredentials = async (user_id: string) => {
    if (!user_id) throw new Error("user_id is required to generate global OFF credentials.");

    return {
        app_name: appInfo.expo.name,
        app_version: appInfo.expo.version,
        app_uuid: await hash(user_id), //user_id from public.profiles
    };
}

/**
 * Creates headers for Open Food Facts (OFF) API requests.
 * 
 * @param {string} authToken - The session token from OpenFoodFacts API to be included in the header if provided.
 * 
 * @returns {HeadersInit} The headers for the OFF API request.
 * 
 * @remarks
 * - The `User-Agent` header is mandatory for all requests and must follow the format: `AppName/Version (ContactEmail)`.
 * - For global write operations, additional headers such as `Authorization` may be included if credentials are provided.
 * - Ensure that `app_name`, `app_version`, and `contact_email` are properly set in the environment or passed as parameters to avoid errors.
 * - This function is designed to support both read and write operations on the OFF API.
 */
export const CreateOFFHeader = (authToken?: string | null | undefined): HeadersInit => {

    const expoAppInfo = {
        app_name: appInfo.expo.name ?? "Home Scan App",
        app_version: appInfo.expo.version ?? `1`,
        contact_email: process.env.EXPO_PUBLIC_CONTACT_EMAIL ?? null
    }
    if (!!!expoAppInfo || !!!expoAppInfo?.contact_email) {
        throw new Error("App Info and contact_email is required to generate OFF headers.");
    }

    const headers: HeadersInit = {
        'User-Agent': `${expoAppInfo.app_name}/${expoAppInfo.app_version} (${expoAppInfo.contact_email})`,
        'Content-Type': 'application/json',
    };

    console.log("OFF Headers: ", { headers });

    return !!authToken ? {
        ...headers,
        'Authorization': `Bearer ${authToken}`
    }
        : headers;
};


/**hash is a basic method uses the SHA256 algorithm to hash the password. The digestStringAsync function returns a promise that resolves to a hexadecimal string representing the hashed password.
 * @remarks This method is used to hash the password before sending it to the OFF API.
 * @remarks This is a basic hashing method and should be replaced with a more secure hashing method in a production environment.
 * @param password: {string} - The password to hash. 
 * @returns @promise<string> A promise that resolves to the hashed password.
 */
export const hash = async (password: string = (process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_API_PASSWORD ?? "")) => {
    const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
    );
    return digest;
};


/**
 * Retrieves an authentication token from the OFF API.
 * 
 * @throws {Error} If the OFF credentials are not set in the environment variables.
 * @throws {Error} If the authentication request fails.
 * 
 * @returns {Promise<string>} A promise that resolves to the authentication token.
 */
export async function getOFFSessionToken(
    user_id: string | undefined = undefined,
    abortSignal?: AbortSignal
        | null | undefined
): Promise<string> {
    // if (!OFF_CREDENTIALS) {
    //     throw new Error("OFF credentials are not set in the environment variables.");
    // }

    if (!user_id && !process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_USER_ID) {
        throw new Error("user_id is required to generate OFF session token.");
    }
    const body = await globalOFFWriteQueryCredentials(user_id as string)
    const response = await fetch(getOFFURL({
        endpoint: "/cgi/session.pl",
        env: (["development", "production", "staging", "testing"].includes(process.env.EXPO_NODE_ENV ?? "")
            ? process.env.EXPO_NODE_ENV
            : "development") as "development" | "production" | "staging" | "testing" | null | undefined,
        apiVersion: process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_API_VERSION ?? 2,
        countryCode: process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_COUNTRY_CODE ?? "world"
    }) + '/cgi/session.pl', {
        method: 'POST',
        headers: CreateOFFHeader(),
        body: JSON.stringify(body),
        signal: abortSignal
    });

    if (!response.ok) {
        throw new Error(`Failed to authenticate: ${response.statusText}`);
    }
    console.log("OFF session token Response: ", { response });
    const data = await response.json();
    return data.token;
}

