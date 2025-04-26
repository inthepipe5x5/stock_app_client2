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
 * @param {string} userId - The hashed public.profiles.user_id to be included in the header if provided.
 * 
 * @returns {HeadersInit} The headers for the OFF API request.
 * 
 * @remarks
 * - The `User-Agent` header is mandatory for all requests and must follow the format: `AppName/Version (ContactEmail)`.
 * - For global write operations, additional headers such as `Authorization` may be included if credentials are provided.
 * - Ensure that `app_name`, `app_version`, and `contact_email` are properly set in the environment or passed as parameters to avoid errors.
 * - This function is designed to support both read and write operations on the OFF API.
 */
export const CreateOFFHeader = () => {
    const contactEmail = process.env.EXPO_PUBLIC_CONTACT_EMAIL ?? null

    if (!!!contactEmail) {
        throw new Error("Contact_email is required to generate OFF headers.");
    }
    const headers = {
        'User-Agent': `${appInfo.expo.name ?? "Home Scan App"}/${appInfo.expo.version ?? `1.0.0`}(${contactEmail})`,
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    console.log("OFF Headers: ", { headers });

    return headers
};

export const CreateOFFReqBody = async ({ data, userId }: { data?: { [key: string]: any }, userId?: string | null | undefined }) => {
    const init = await globalOFFWriteQueryCredentials(userId as string)

    const extraDetails = {
        ...(init ?? {}),
        ...(data ?? {})
    }
    console.log("OFF Request Body: ", { extraDetails });
    return extraDetails
}
/**
 * Hashes a string using the SHA256 algorithm. Optionally, a salt can be provided for additional security.
 * 
 * @remarks 
 * - This method is used to hash sensitive data before sending it to the OFF API.
 * - If no salt is provided, the method will use the salt from the environment variables if available.
 * - This is a basic hashing method and should be replaced with a more secure hashing method in a production environment.
 * 
 * @param {string} string - The string to hash. Defaults to the OFF API password from the environment variables.
 * @param {string | null} [encryptionSalt] - An optional salt to use for hashing. If not provided, the method will use the salt from the environment variables.
 * 
 * @returns {Promise<string>} A promise that resolves to the hashed string.
 */
export const hash = async (
    string: string = (process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_API_PASSWORD ?? ""),
    encryptionSalt?: string | null
): Promise<string> => {
    const salt = encryptionSalt ?? process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_SALT ?? null;
    const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        salt ? `${string}${salt}` : string,
        { encoding: Crypto.CryptoEncoding.HEX }
    );
    return digest;
};

/**
 * 
 * @param {string} input - The input string to hash and compare.
 * @param {string} hashedValue - The hashed value to compare against.
 * @param {string | null} [encryptionSalt] - An optional salt used during hashing.
 * @remark  * Unhashing is not possible with SHA256 as it is a one-way hashing algorithm.
 * If you need to verify a hashed value, you can compare the hash of the input with the stored hash.
 * 
 * @returns {Promise<boolean>} A promise that resolves to true if the input matches the hashed value, otherwise false.
 */
export const verifyHash = async (
    input: string,
    hashedValue: string,
    encryptionSalt?: string | null
): Promise<boolean> => {
    const inputHash = await hash(input, encryptionSalt);
    return inputHash === hashedValue;
};

//OFF API endpoint doesn't work - fix later

// /**
//  * Retrieves an authentication token from the OFF API.
//  *
//  * @throws {Error} If the OFF credentials are not set in the environment variables.
//  * @throws {Error} If the authentication request fails.
//  *
//  * @returns {Promise<string>} A promise that resolves to the authentication token.
//  */
// export async function getOFFSessionToken(
//     user_id: string | undefined = undefined,
//     abortSignal?: AbortSignal
//         | null | undefined
// ): Promise<string> {
//     // if (!OFF_CREDENTIALS) {
//     //     throw new Error("OFF credentials are not set in the environment variables.");
//     // }

//     if (!user_id && !process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_USER_ID) {
//         throw new Error("user_id is required to generate OFF session token.");
//     }
//     const body = await globalOFFWriteQueryCredentials(user_id as string)
//     const response = await fetch(getOFFURL({
//         endpoint: "/cgi/session.pl",
//         env: (["development", "production", "staging", "testing"].includes(process.env.EXPO_NODE_ENV ?? "")
//             ? process.env.EXPO_NODE_ENV
//             : "development") as "development" | "production" | "staging" | "testing" | null | undefined,
//         apiVersion: process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_API_VERSION ?? 2,
//         countryCode: process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_COUNTRY_CODE ?? "world"
//     }) + '/cgi/session.pl', {
//         method: 'POST',
//         headers: CreateOFFHeader(),
//         body: JSON.stringify(body),
//         signal: abortSignal
//     });

//     if (!response.ok) {
//         throw new Error(`Failed to authenticate: ${response.statusText}`);
//     }
//     console.log("OFF session token Response: ", { response });
//     const data = await response.json();
//     return data.token;
// }

