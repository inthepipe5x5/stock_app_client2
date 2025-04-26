import axios, { AxiosInstance } from "axios";
import { CreateOFFHeader, PROD_OFF_API_URL, getOFFURL, globalOFFWriteQueryCredentials } from "./OFFcredentials";
import normalizeBarcode from "@/utils/barcode";
import { OFFBaseProduct, OFFProductTags } from "./types";
import { OFFProductHelper } from "../supabase/ResourceHelper";

// const offClient = axios.create({
//     baseURL: PROD_OFF_API_URL,
//     headers: CreateOFFHeader(),
//     validateStatus: (status) => {
//         return status >= 200 && status < 500; // Default
//     }
// })

const createOFFClient = async ({ user_id }: { user_id: string | null | undefined } = { user_id: null },
) => {
    const headers = CreateOFFHeader();
    return axios.create({
        baseURL: PROD_OFF_API_URL,
        headers,
        validateStatus: (status) => {
            return status >= 200 && status < 500; // Default
        },
        data: {
            ...(user_id ? await globalOFFWriteQueryCredentials(user_id) : {}),
        }
    });
};
//just need a user-agent header for now
export default createOFFClient;

export class OFFClient {
    private client: AxiosInstance;
    private user_id: string | null | undefined;
    private countryCode: string | null | undefined;
    private category: 'all' | 'food' | 'beauty' | 'petfood' | null | undefined = 'food';
    private languageCode: string | null | undefined = 'en';
    private apiVersion: number | null | undefined = 2;

    constructor({
        user_id = null,
        countryCode = "CA",
        category = "all",
        languageCode = "en",
        apiVersion = 2,
    }: {
        user_id?: string | null;
        countryCode?: string | null;
        category?: "all" | "food" | "beauty" | "petfood";
        languageCode: string
        apiVersion?: number | null | undefined;

    }) {
        this.user_id = user_id;
        this.countryCode = countryCode;
        this.category = category;
        this.languageCode = languageCode;

        const url = getOFFURL({ countryCode, category, apiVersion }) ?? PROD_OFF_API_URL;

        this.client = axios.create({
            baseURL: url,
            timeout: 10000,
            headers: CreateOFFHeader(),
            validateStatus: (status) => status >= 200 && status < 500,
        });

    }

    // Helper to add user-specific headers
    private async addUserHeaders() {
        if (this.user_id) {
            const credentials = await globalOFFWriteQueryCredentials(this.user_id);
            this.client.defaults.headers.common = {
                ...this.client.defaults.headers.common,
                ...credentials,
            };
        }
    }

    // Fetch product by barcode
    async fetchProductByBarcode(barcode: string): Promise<OFFBaseProduct | null> {
        try {
            await this.addUserHeaders();
            const normalizedBarcode = normalizeBarcode(barcode);
            const response = await this.client.get(`/product/${normalizedBarcode}.json`, {
                params: { category: this.category },
            });

            if (response.status !== 200) {
                throw new Error(`Error fetching product: ${response.statusText}`);
            }

            return response.data as OFFBaseProduct;
        } catch (error) {
            console.error("Error fetching product by barcode:", error);
            return null;
        }
    }

    // Search for products
    async searchProducts(query: string): Promise<OFFBaseProduct[] | null> {
        try {
            await this.addUserHeaders();
            const response = await this.client.get(`/search.pl`, {
                params: { search_terms: query, category: this.category },
            });

            if (response.status !== 200) {
                throw new Error(`Error searching products: ${response.statusText}`);
            }

            return response.data.products as OFFBaseProduct[];
        } catch (error) {
            console.error("Error searching products:", error);
            return null;
        }
    }

    // Fetch product suggestions
    async fetchProductSuggestions(tagType: string, searchString: string): Promise<OFFProductTags[] | null> {
        try {
            const response = await this.client.get(`/cgi/suggest.pl`, {
                params: { tagtype: tagType, search_string: searchString },
            });

            if (response.status !== 200) {
                throw new Error(`Error fetching product suggestions: ${response.statusText}`);
            }

            return response.data.suggestions as OFFProductTags[];
        } catch (error) {
            console.error("Error fetching product suggestions:", error);
            return null;
        }
    }

    // Post a product
    async postProduct(product: Partial<OFFBaseProduct>): Promise<any> {
        try {
            await this.addUserHeaders();
            const response = await this.client.post(`/cgi/product_jqm2.pl`, product);

            if (response.status !== 200) {
                throw new Error(`Error posting product: ${response.statusText}`);
            }

            return response.data;
        } catch (error) {
            console.error("Error posting product:", error);
            return null;
        }
    }

    // get product prices
    async getProductPricesByBarcode(barcode: string): Promise<any> {
        try {
            await this.addUserHeaders();
            const normalizedBarcode = normalizeBarcode(barcode);
            const pricesURL = getOFFURL({
                countryCode: this.countryCode,
                category: this.category,
                apiVersion: 1,
                getPrice: true,
            }) + `/product/${normalizedBarcode}`;
            const response = await this.client.get(pricesURL, {
                params: { code: normalizedBarcode },
            });

            if (response.status !== 200) {
                throw new Error(`Error fetching product prices: ${response.statusText}`);
            }

            return response.data;
        } catch (error) {
            console.error("Error fetching product prices:", error);
            return null;
        }
    }
    async getCombinedProductData(barcode: string): Promise<any> {
        try {
            await this.addUserHeaders();
            const normalizedBarcode = normalizeBarcode(barcode);
            const [baseProduct, extraInfoData, priceData] = await Promise.all([
                this.client.get(`/product/${normalizedBarcode}.json`),
                this.client.get(`/product/${normalizedBarcode}`, {
                    params: { product_type: "all", fields: "knowledge_panels" },
                }),
                this.getProductPricesByBarcode(barcode)
            ])
            //handle errors
            if ([
                baseProduct?.status !== 200,
                extraInfoData?.status !== 200,
                priceData?.status !== 200,
                Object.values(baseProduct?.data).find(value => typeof value === 'string' && ["product not found", "product_not_found"].includes(value)) ,
                extraInfoData,
                priceData?.data?.detail === 'No Product matches the given query'].
                some(Boolean)) {
                throw new Error(`Error fetching combined product data: ${{ baseProduct, extraInfoData, priceData }}`);
            }

            const helper = new OFFProductHelper();
            const productInfo = helper.getOFFProductInfo(baseProduct.data);
            const extraInfo = helper.getExtraOFFProductInfo(extraInfoData.data);
            const parsedPrices = helper.getOFFPricesInfo(priceData.data);



            return {
                raw: {
                    baseProduct: baseProduct.data,
                    extraInfoData: extraInfoData.data,
                    priceData: priceData.data,
                },
                productInfo,
                extraInfo,
                prices: parsedPrices,
            };
        } catch (error) {
            console.error("Error fetching combined product data:", error);
            return null;
        }
    }
}