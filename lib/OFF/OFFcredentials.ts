import appInfo from '../../app.json';

/**
 * @fileoverview This file contains the authentication methods for the OFF API.
 * API use @link https://openfoodfacts.github.io/openfoodfacts-server/api/#if-your-users-do-not-expect-a-result-immediately-eg-inventory-apps}
    * 
    * Auth Schemas {@link https://openfoodfacts.github.io/openfoodfacts-server/api/ref-v2/#cmp--securityschemes-useragentauth}

*/
const PROD_OFF_API_URL = process.env.EXPO_OPEN_FOOD_FACTS_API ?? "https://world.openfoodfacts.org/api/v0/";
//use staging API for development purposes as per OFN recommendation
export const BASE_URL = process.env.NODE_ENV === "development" ? String(PROD_OFF_API_URL.replace(".org", ".net")) : PROD_OFF_API_URL;


const OFF_API_URL = BASE_URL + "auth/";
const OFF_CREDENTIALS = process.env.EXPO_OPEN_FOOD_FACTS_USERNAME
    ? {
        user: process.env.EXPO_OPEN_FOOD_FACTS_USERNAME ?? process.env.CONTACT_EMAIL,
        password: process.env.EXPO_OPEN_FOOD_FACTS_PASSWORD,
        }
    : undefined;

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
            password: OFF_CREDENTIALS.password
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to authenticate: ${response.statusText}`);
    }

    const data = await response.json();
    return data.token;
}

