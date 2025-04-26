
/*OFF API response types
* {@link https://openfoodfacts.github.io/openfoodfacts-server/api/ref-v2/#cmp--securityschemes-useragentauth}

*/


/**Query Params Type  */
export type OFFQueryParamsType = Record<keyof (OFFBaseProduct & OFFProductTags), string | number | boolean | null | undefined>;


export type OFFProducePricesResponseType = {
    id: number;
    code: string;
    source: string;
    source_last_synced: string;
    product_name: string;
    image_url: string;
    product_quantity: number;
    product_quantity_unit: string;
    categories_tags: string[];
    brands: string;
    brands_tags: string[];
    labels_tags: string[];
    nutriscore_grade: string;
    ecoscore_grade: string;
    nova_group: number;
    unique_scans_n: number;
    price_count: number;
    price_currency_count: number;
    location_count: number;
    location_type_osm_country_count: number;
    user_count: number;
    proof_count: number;
    created: string;
    updated: string;
};

/**Base product Data  */

export type OFFBaseProduct = {
    abbreviated_product_name: string;
    code: string;
    codes_tags: string[];
    generic_name: string;
    id: string;
    lc: string;
    lang: string;
    nova_group: number;
    nova_groups: string;
    obsolete: string;
    obsolete_since_date: string;
    product_name: string;
    product_name_en: string;
    product_quantity: string;
    product_quantity_unit: string;
    quantity: string;
    [key: `abbreviated_product_name_${string}`]: string;
    [key: `generic_name_${string}`]: string;
};

export type OFFProductTags = {
    brands: string;
    brands_tags: string[];
    categories: string;
    categories_hierarchy: string[];
    categories_lc: string;
    categories_tags: string[];
    checkers_tags: string[];
    cities: string;
    cities_tags: string[];
    correctors_tags: string[];
    countries: string;
    countries_hierarchy: string[];
    countries_lc: string;
    countries_tags: string[];
    ecoscore_tags: string[];
    emb_codes: string;
    emb_codes_orig: string;
    emb_codes_tags: string[];
    labels: string;
    labels_hierarchy: string[];
    labels_lc: string;
    labels_tags: string[];
    entry_dates_tags: string[];
    manufacturing_places: string;
    manufacturing_places_tags: string[];
    nova_groups_tags: string[];
    nutrient_levels_tags: string[];
};
export type OFFFoodGroupsTags = { "food_groups_tags": string[] };
export type OFFProductMISC = {
    additives_n: number;
    checked: string;
    complete: number;
    completeness: number;
    ecoscore_grade: string;
    ecoscore_score: number;
    food_groups: string;
    nutrient_levels: {
        fat: string;
        salt: string;
        'saturated-fat': string;
        sugars: string;
    };
    packaging_text: string;
    packagings: {
        number_of_units: number;
        shape: {
            id: string;
            lc_name: string;
        };
        material: {
            id: string;
            lc_name: string;
        };
        recycling: {
            id: string;
            lc_name: string;
        };
        quantity_per_unit: string;
        quantity_per_unit_value: number;
        quantity_per_unit_unit: string;
        weight_specified: number;
        weight_measured: number;
        weight_estimated: number;
        weight: number;
        weight_source_id: string;
    }[];
    packagings_complete: number;
    pnns_groups_1: string;
    pnns_groups_1_tags: string[];
    pnns_groups_2: string;
    pnns_groups_2_tags: string[];
    popularity_key: number;
    popularity_tags: string[];
    scans_n: number;
    unique_scans_n: number;
    serving_quantity: string;
    serving_quantity_unit: string;
    serving_size: string;
    [key: `food_groups_${string}`]: string;
    [key: `packaging_text_${string}`]: string;
} & OFFFoodGroupsTags;

export type OFFProductImages = {
    images: {
        front: {
            angle: number;
            coordinates_image_size: string;
            geometry: string;
            imgid: string;
            normalize: string | boolean | null;
            rev: string;
            sizes: {
                100: {
                    h: number;
                    w: number;
                };
                200: {
                    h: number;
                    w: number;
                };
                400: {
                    h: number;
                    w: number;
                };
                full: {
                    h: number;
                    w: number;
                };
            };
            white_magic: string | boolean | null;
            x1: string;
            x2: string;
            y1: string;
            y2: string;
        };
        // [key: string]: {
        //     sizes: {
        //         full: {
        //             h: number;
        //             w: number;
        //         };
        //         [key: string]: {
        //             h: number;
        //             w: number;
        //         };
        //     };
        //     uploaded_t: string;
        //     uploader: string;
        // };
    };
    last_image_dates_tags: string[];
    last_image_t: number;
    selected_images: {
        front: {
            display: {
                [key: string]: string;
            };
            small: {
                [key: string]: string;
            };
            thumb: {
                [key: string]: string;
            };
        };
        // [key: string]: {
        //     display: {
        //         [key: string]: string;
        //     };
        //     small: {
        //         [key: string]: string;
        //     };
        //     thumb: {
        //         [key: string]: string;
        //     };
        // };
    };
    image_small_url: string;
    image_thumb_url: string;
    image_url: string;
    // [key: string]: string;
};
