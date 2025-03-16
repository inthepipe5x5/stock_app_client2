import appInfo from '../../app.json';
import * as Crypto from 'expo-crypto';
/**
 * @fileoverview This file contains the authentication methods for the OFF API.
 * API use @link https://openfoodfacts.github.io/openfoodfacts-server/api/#if-your-users-do-not-expect-a-result-immediately-eg-inventory-apps}
    * 
    * Auth Schemas {@link https://openfoodfacts.github.io/openfoodfacts-server/api/ref-v2/#cmp--securityschemes-useragentauth}

*/
const OFF_API_VERSION = process.env.EXPO_OPEN_FOOD_FACTS_API_VERSION ?? 2
const PROD_OFF_API_URL = process.env.EXPO_OPEN_FOOD_FACTS_API ?? "https://world.openfoodfacts.org/api/v0/";
//use staging API for development purposes as per OFN recommendation
export const BASE_URL = process.env.EXPO_NODE_ENV === "development" ? String(PROD_OFF_API_URL.replace(".org", ".net")) + `${OFF_API_VERSION}/` : `${PROD_OFF_API_URL}/${OFF_API_VERSION}/`;


const OFF_API_URL = BASE_URL + "auth/";
const OFF_CREDENTIALS = process.env.EXPO_OPEN_FOOD_FACTS_USERNAME
    ? {
        user: process.env.EXPO_OPEN_FOOD_FACTS_USERNAME ?? process.env.CONTACT_EMAIL,
        password: process.env.EXPO_OPEN_FOOD_FACTS_PASSWORD,
        salt: process.env.EXPO_OPEN_FOOD_FACTS_SALT
    }
    : undefined;

/**hash is a basic method uses the SHA256 algorithm to hash the password. The digestStringAsync function returns a promise that resolves to a hexadecimal string representing the hashed password.
 * @remarks This method is used to hash the password before sending it to the OFF API.
 * @remarks This is a basic hashing method and should be replaced with a more secure hashing method in a production environment.
 * @param password: {string} - The password to hash. 
 * @returns @promise<string> A promise that resolves to the hashed password.
 */
export const hash = async (password: string) => {
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
export async function getOFFAuthToken(): Promise<string> {
    if (!OFF_CREDENTIALS) {
        throw new Error("OFF credentials are not set in the environment variables.");
    }

    const response = await fetch(OFF_API_URL + 'login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': `${appInfo.expo.name}/${appInfo.expo.version} (${process.env.CONTACT_EMAIL})`
        },
        body: JSON.stringify({
            user_id: OFF_CREDENTIALS.user,
            password: await hash(OFF_CREDENTIALS.password ?? ""),
            salt: await hash(OFF_CREDENTIALS.salt ?? Crypto.getRandomValues(new Uint8Array(16)).toString())
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to authenticate: ${response.statusText}`);
    }

    const data = await response.json();
    return data.token;
}

