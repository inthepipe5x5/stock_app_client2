import React, { useContext, createContext, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { OFFBaseProduct, OFFProductTags, OFFProductImages, OFFProductMISC } from "@/lib/OFF/types";
import { CreateOFFHeader, OFFCredentialsType, getOFFURL, globalOFFWriteQueryCredentials } from "@/lib/OFF/OFFcredentials";
import { fetchProductByBarcode, product_category_type } from '@/lib/OFF/Api';
import isTruthy from '@/utils/isTruthy';
import { useUserSession } from './UserSessionProvider';
import defaultSession from '@/constants/defaultSession';
import axios, { AxiosInstance } from 'axios';
import { router } from 'expo-router';
import supabase from '@/lib/supabase/supabase';

export type OpenFoodFactsAPIContextType = {
    apiUrl?: string;
    authToken?: string | null;
    fetchProductByBarcode: (barcode: string) => Promise<OFFBaseProduct | null>;
    fetchProductTagsByBarcode: (barcode: string) => Promise<OFFProductTags | null>;
    fetchProductImagesByBarcode: (barcode: string) => Promise<OFFProductImages | null>;
    fetchProductMISCByBarcode: (barcode: string) => Promise<OFFProductMISC | null>;
    fetchProductByOCR?: (blob: Blob) => Promise<any[] | { [key: string]: any } | { [key: string]: any }[] | null>;
};

export type OpenFoodFactsAPIProviderProps = {
    credentials?: Partial<OFFCredentialsType> | null | undefined;
    user_id?: string | null | undefined; //hashed user_id from public.profiles table
    product_category?: product_category_type | null | undefined;
    authToken?: string | null | undefined;
    apiUrl?: string | null | undefined;
    countryCode?: string | null | undefined; //2 char cca2 country code
    languageCode?: string | null | undefined; //2 char ISO639-1 language code
    controller?: AbortController | null | undefined;
    children?: React.ReactNode | React.ReactNode[] | React.ReactElement | React.ReactElement[] | JSX.Element | JSX.Element[] | null | undefined;
    requestTimeout?: number | null | undefined; //timeout in ms for the request
};

const OFFContext = createContext<Partial<OpenFoodFactsAPIContextType> | null>(null);



export const OpenFoodFactsAPIProvider: React.FC<Partial<OpenFoodFactsAPIProviderProps>> = (props: Partial<OpenFoodFactsAPIProviderProps> = {
    // credentials: OFF_CREDENTIALS,
    product_category: "all",
    countryCode: process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_COUNTRY_CODE ?? "world",
    languageCode: process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_LANGUAGE_CODE ?? "en",
    controller: new AbortController()
}) => {
    const globalContext = useUserSession();
    const { state } = globalContext || defaultSession;
    const apiBaseURL = useRef<string | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(props?.authToken ?? null);
    const [credentials, setCredentials] = useState<Partial<OFFCredentialsType> | null>(props?.credentials ?? null);
    const [hashedUserId, setHashedUserId] = useState<string | null>(null);
    const controller = useRef<AbortController | null>(props?.controller ?? new AbortController);
    const [productCategory, setProductCategory] = useState<product_category_type>(props?.product_category ?? "all");

    const appInfoRef = useRef<{ app_name: string | null; app_version: string | null; app_uuid: string | null } | null>(null);
    // const offAxios = useRef<AxiosInstance | null>(null);
    const apiUrl = useMemo(() => {
        const countryCode = state?.user?.country ?? process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_COUNTRY_CODE ?? "world";
        const languageCode = process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_LANGUAGE_CODE ?? "en";
        return `${apiBaseURL.current}${countryCode}/${languageCode}/`;
    }, [
        hashedUserId,
        props?.countryCode,
        props?.languageCode,
        apiBaseURL
    ]);
    const offAxios = useRef<AxiosInstance>(axios.create({
        baseURL: apiBaseURL?.current ?? `${process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_API}${process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_API_VERSION}`,
        timeout: props?.requestTimeout ?? 10000,
        signal: controller.current?.signal,
        method: "GET"
    }));

    // Set the app info in the ref when the component mounts or when the app info changes
    // This is to ensure that the app info is set correctly when the app info changes
    useEffect(() => {
        const initializeOFFContext = async () => {
            try {
                // Set the base URL for the Open Food Facts API
                apiBaseURL.current =
                    props?.apiUrl ??
                    getOFFURL({}) ??
                    process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_API_URL ??
                    "https://world.openfoodfacts.org/api/v2/";

                // Create an Axios instance
                if (!!!offAxios.current) {
                    offAxios.current = axios.create({
                        baseURL: apiBaseURL.current,
                        headers: CreateOFFHeader(),
                        timeout: props?.requestTimeout ?? 10000,
                        signal: controller.current?.signal,
                    });
                }
                const { data: { user } } = await supabase.auth.getUser();

                // Set the hashed user ID and app info
                const appInfo = await globalOFFWriteQueryCredentials(
                    props?.user_id ?? user?.id ?? state?.user?.user_id as string,
                );
                appInfoRef.current = appInfo;
                setHashedUserId(appInfo?.app_uuid ?? null);

            } catch (error) {
                console.error("Error initializing Open Food Facts API context:", error);
            }
        };
        // ensure user is logged in and not a draft user
        if ((props?.user_id ?? state?.user?.user_id ?? null) !== null && state?.user?.draft_status !== 'draft') {
            initializeOFFContext();
        }
    }, [props?.apiUrl, props?.authToken, hashedUserId, state?.user?.user_id]);



    /* {@link} https://openfoodfacts.github.io/openfoodfacts-server/api/ref-v2/#get-/api/v2/product/-barcode-
    * Fetch a specific product by its barcode.
    * @param @required barcode - The barcode of the product to fetch.
     */
    const searchProducts = useCallback(async (searchArgs:
        {
            barcode?: string | null | undefined,
            searchTerms?: string[] | string | null | undefined,
            params?: { [key in keyof Partial<OFFBaseProduct | OFFProductMISC | OFFProductTags>]: string | number | null | undefined
            }
        } = {}) => {

        try {
            if (!controller.current) {
                controller.current = new AbortController();
            }
            if (!!!apiBaseURL.current) {
                apiBaseURL.current = getOFFURL({
                    apiVersion: typeof searchArgs?.searchTerms === "string" ? 2 : 1,
                    countryCode: props?.countryCode ?? "world",
                    category: productCategory ?? "all",
                    endpoint: !!searchArgs?.barcode ? "products" : "search.pl"
                });
            }
            if (!!!searchArgs || !!!credentials) {
                throw new Error(`searchArgs & Auth is required to fetch product data. Received: ${{ searchArgs, credentials }}`);
            }

            //if barcode is  both provided, use barcode to fetch product
            if (!!searchArgs?.barcode) {
                return await fetchProductByBarcode(
                    searchArgs?.barcode ?? "",
                    apiBaseURL.current,
                    credentials as OFFCredentialsType,
                    controller.current,
                    productCategory ?? "all",
                    1,
                    searchArgs?.params ?? {}
                );
            }

            //handle if search term is a string
            const url = new URL(apiBaseURL.current);
            //create the url with the search term and params
            url.search = new URLSearchParams({
                ...Object.entries(searchArgs?.params ?? {}).reduce((acc, [key, value]) => {
                    acc[key] = String(value ?? "");
                    return acc;
                }, {} as Record<string, string>),
                limit: "1", // Convert number to string
                // credentials: JSON.stringify(credentials), // Convert object to string
                // search_terms: searchArgs?.searchTerms ?? ""
            }).toString();

            return await fetch(url.toString(), {
                method: "POST",
                headers: CreateOFFHeader(),
                body: JSON.stringify({
                    ...credentials,
                    search_terms: searchArgs?.searchTerms ?? ""
                }),
            });

        } catch (error) {
            console.error("Error fetching product by barcode:", error);
            return null;
        }
    }, [apiUrl]);

    const fetchProductImagesByBarcode = useCallback(async (barcode: string) => {
        try {
            const response = await offAxios.current(`${apiUrl}${barcode}`);
            if (response.status !== 200) {
                throw new Error(`Error fetching product images: ${response.statusText}`);
            }
            return response?.data?.images || [];
        } catch (error) {
            console.error("Error fetching product images by barcode:", error);
            return null;
        }
    }, [apiUrl]);

    /* {@link} https://openfoodfacts.github.io/openfoodfacts-server/api/ref-v2/#get-/cgi/suggest.pl
    * Get product suggestions eg. for autocomplete or product search
    @param tagtype: string - The type of tag to suggest (e.g. "categories", "brands", "ingredients_text", etc.)
    @param tag: string - The tag to suggest (e.g. "chocolate", "milk", etc.)
     */
    const fetchProductSuggestions = useCallback(async (
        { tagType, searchString }:
            {
                tagType: OFFProductTags,
                searchString: string
            }
    ) => {
        try {
            if (!tagType || !searchString) {
                throw new Error("tagType and searchString are required to fetch product suggestions.");
            }
            const response = await fetch(`${apiUrl}${tagType}/suggestions.json?tagtype=${tagType}&search_string=${searchString}`);

            if (!response.ok) {
                throw new Error(`Error fetching product suggestions: ${response.statusText}`);
            }
            const data = await response.json();
            return data.suggestions || null;
        } catch (error) {
            console.error("Error fetching product suggestions:", error);
            return null;
        }

    }, [apiUrl]);

    /* {@link https://openfoodfacts.github.io/openfoodfacts-server/api/ref-v2/#post-/cgi/product_jqm2.pl}
    * Post a product to Open Food Facts /cgi/product_jqm2.pl @endpoint
    * @remark This is a write query that requires authentication.
    *
     */
    const PostProduct = useCallback(async (product: Partial<OFFBaseProduct>) => {
        try {
            if (!authToken || !!!product?.code || !!!credentials || !isTruthy(credentials)) {
                throw new Error(`Authentication token, product code, and credentials are required to post a product. ${{ authToken, product, credentials }}`);
            }
            // Set the signal for the fetch request to the controller's signal
            if (!controller.current) {
                controller.current = new AbortController();
            }
            const response = await fetch(`${apiUrl}cgi/product_jqm2.pl`, {
                signal: controller.current?.signal,
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Bearer ${authToken}`,
                },
                body: JSON.stringify({ product, ...credentials }),
            });
            if (!response.ok) {
                throw new Error(`Error posting product: ${response.statusText}`);
            }
            const data = await response.json();
            return data || null;
        } catch (error) {
            console.error("Error posting product:", error);
            return null;
        }

    }, [apiUrl, authToken]);

    const value = useMemo(() => ({
        apiUrl,
        authToken,
        setAuthToken,
        controller,
        credentials,
        setCredentials,
        productCategory,
        setProductCategory,
        searchProducts,
        PostProduct,
        hashedUserId,
        appInfoRef,
        setHashedUserId,
        // fetchProductTagsByBarcode,
        fetchProductSuggestions,
        fetchProductImagesByBarcode,
        // fetchProductMISCByBarcode,
    }),
        [apiUrl, authToken, searchProducts, fetchProductImagesByBarcode, fetchProductSuggestions, PostProduct, credentials, hashedUserId, appInfoRef, setHashedUserId]
    );

    return (
        <OFFContext.Provider value={value}>
            {props?.children ?? <></>}
        </OFFContext.Provider>
    );
}

export const useOpenFoodFactsAPI = () => {
    const context = useContext(OFFContext);
    if (!context) {
        throw new Error("useOpenFoodFactsAPI must be used within an OpenFoodFactsAPIProvider");
    }
    return context;
}