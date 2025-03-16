import normalizeBarcode from "@/utils/barcode";
import { BASE_URL } from "./OFFcredentials";


/**
 * Fetch product data by barcode
 * @param barcode - The barcode of the product
 * @param product_category - The category of the product
 * @returns The product data
 */
export async function fetchProductByBarcode(barcode: string, product_category: "all" | "food" | "beauty" | "petfood" = "all", params: { [key: string]: string | number }={}, limit: number= 100) {
    const normalizedBarcode = normalizeBarcode(barcode);
    let url = `${BASE_URL}product/${normalizedBarcode}`;
    //add category query parameter if not "all"
    if (product_category !== "all") {
        url += `?category=${product_category}`;
    }
    //apply a limit if not provided
    const resultLimit = limit &&  limit 
    //account for additional query parameters
    if (params) {
        Object.values(params).reduce((acc, param) => {
        return `${acc}&${param}`}, url);
    }
    const response = await fetch(url);
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
export async function searchProducts(query: string) {
    const response = await fetch(`${BASE_URL}search.pl?search_terms=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error(`Error searching products: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

/**
 * Fetch product data by id
 * @param id - The id of the product
 * @returns The product data
 */
export async function fetchProductById(id: string) {
    const response = await fetch(`${BASE_URL}product/${id}`);
    if (!response.ok) {
        throw new Error(`Error fetching product: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

