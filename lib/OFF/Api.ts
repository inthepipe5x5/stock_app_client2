import normalizeBarcode from "@/utils/barcode";
import { CreateOFFHeader, OFFCredentialsType, getOFFURL, globalOFFWriteQueryCredentials } from "./OFFcredentials";
import { OFFBaseProduct, OFFProductMISC, OFFProductTags } from "./types";


/**
 * Fetch product data by barcode
 * @remarks Authentication is required for this endpoint.
 * @remarks The barcode is normalized before being sent to the API.
 * @param barcode - The barcode of the product @required
 * @param product_category - The category of the product
 * @returns The product data
 */
export async function fetchProductByBarcode(
    barcode: string,
    BASE_URL: string,
    credentials: OFFCredentialsType | null = null,
    controller: AbortController = new AbortController(),
    product_category: "all" | "food" | "beauty" | "petfood" = "all",
    limit: number = 100,
    ...params: Partial<OFFProductTags | OFFProductMISC>[]
) {
    if (!!!barcode || !!!credentials) {
        throw new Error(`Barcode & Auth is required to fetch product data. Received: ${{ barcode, credentials }}`);
    }
    const normalizedBarcode = normalizeBarcode(barcode);
    let url = `${BASE_URL}product/${normalizedBarcode}`;
    //add category query parameter if not "all"

    if (product_category !== "all") {
        url += `?category=${product_category}`;
    }
    //apply a limit if not provided
    const resultLimit = limit ?? 10;
    //account for additional query parameters
    if (params) {
        Object.values(params).reduce((acc, param) => {
            return `${acc}&${param}`
        }, url);
    }
    const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
            ...(params ?? {}),
            limit: resultLimit,
            credentials: credentials,
            barcode: normalizedBarcode,
        }),
    });
    if (!response.ok) {
        throw new Error(`Error fetching product: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

/**
 * Search for products by query
 * @param query - The search query
 * @returns The search results
 */
export async function searchProducts(
    query: string | Partial<OFFProductTags | OFFBaseProduct | OFFProductMISC>,
    BASE_URL: string) {
    if (!!!query || !!!BASE_URL) {
        throw new Error("Query and BASE_URL is required to search for products.");
    }


    const response = await fetch(`${BASE_URL}search.pl?search_terms=${encodeURIComponent(typeof query === 'string' ? query : JSON.stringify(query))}`);
    if (!response.ok) {
        throw new Error(`Error searching products: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

export const addPictureToProduct = async ({
    code,
    picture,
    fieldValue,
    imgUpload,
    imgTitle,
    category = "food",
    controller = new AbortController(),
    token = null,
    user_id = process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_USER_ID ?? process.env.EXPO_PUBLIC_CONTACT_EMAIL ?? undefined,
    password = process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_API_PASSWORD ?? undefined,
}:
    {
        category: string;
        code: string;
        picture: string;
        fieldValue: string;
        imgUpload: string;
        imgTitle: string;
        token: string | null;
        controller: AbortController;
        password: string | undefined;
        user_id?: string | undefined;
    }
): Promise<void> => {
    try {
        const requiredArgs = [code, picture, user_id, password, token, fieldValue, imgUpload, imgTitle];
        if (requiredArgs.some(arg => arg === undefined || arg === null)) {
            throw new Error(`Missing required arguments: ${requiredArgs}`);
        }
        const url = `${getOFFURL({ category: category as product_category_type })}/cgi/product_image_upload.pl`;

        const formData = new FormData();
        formData.append('code', code);
        formData.append('imagefield', fieldValue);
        const imageBlob = new Blob([picture], { type: 'image/jpg' });
        formData.append(imgUpload, imageBlob, imgTitle);

        if (user_id) {
            formData.append('userId', user_id);
        }
        if (password) {
            formData.append('password', password);
        }


        const response = await fetch(
            url, {
            method: 'POST',
            headers: CreateOFFHeader(token),
            body: {
                ...formData,
                ...await globalOFFWriteQueryCredentials(user_id as string),
            },
            signal: controller.signal
        });

        const text = await response.text();
        console.log('uploaded picture: got response text: ', text);
    } catch (error) {
        console.error(error);
    }
};

export type product_category_type = "food" | "beauty" | "petfood" | "all";

export const textSearchProducts = async ({
    query
}: {
    query: string;
    category: product_category_type;
}) => {

}