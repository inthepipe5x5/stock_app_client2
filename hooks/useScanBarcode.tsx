import { useQuery, UseQueryOptions, useQueryClient } from "@tanstack/react-query";
import supabase from "@/lib/supabase/supabase";
import normalizeBarcode from "@/utils/barcode";
import { useMemo, useState } from "react";
import { mmkvCache } from "@/lib/storage/mmkv";
import { MMKV } from "react-native-mmkv";



export function useBarcodeLookup({ barcode, signal, promises, options, storage }:
    {
        barcode: string | string[],
        signal?: AbortSignal,
        promises?: Promise<any>[]
        options?: UseQueryOptions<any, any, any, string[]>
        storage?: mmkvCache | MMKV
    }) {
    // const off = await axios.get(`https://world.openfoodfacts.org/api/v1/product/${barcode}`);
    // const prices = await axios.get(`https://prices.openfoodfacts.org/api/v1/product/code/${barcode}`);
    const codes = useMemo(() =>
        Array.isArray(barcode) ? barcode.map(normalizeBarcode)
            : [normalizeBarcode(barcode)]
        , [barcode]);

    const queries = [
        supabase.from("products").select("*").in("barcode", codes),
        ...(promises ?? []),
    ];

    return useQuery({
        queryKey: ["scannedBarcodes", ...(codes ?? [])],
        enabled: !!barcode,
        queryFn: async () => {
            const data = await Promise.all(queries);

            const parsed = data.reduce((acc, curr, idx) => {
                // if there is an error, throw it
                if (curr.error) {
                    throw new Error(curr.error);
                }
                // add the data to the accumulator
                else if (!!curr.data) {
                    return idx === 0 ? acc.db = curr.data : acc.other.push(curr.data as any);
                }
                return acc;
            }, { db: null, other: [] });

            return parsed;
        },
        ...options,
    });
}

export type ProductSearchOptions = {
    singleBarcode?: string;
    codes?: string[];
    source?: "supabase" | "openfoodfacts" | "prices"
    returns?: "product" | "prices" | "all"
    returnCount?: 'single' | 'multiple'
    signal?: AbortSignal;
};

export default function useProductSearch({
    singleBarcode,
    codes,
    signal }:
    ProductSearchOptions) {

    if ([singleBarcode, codes].every((code) => !code)) {
        throw new Error("No barcode provided");
    }
    const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([]);

    const queryClient = useQueryClient();
    const barcode = queryClient.getQueryData<string[]>(["barcode"]);
    const { data, isLoading, isError } = useBarcodeLookup({ barcode: singleBarcode ?? [], signal: undefined });

    return {
        data,
        isLoading,
        isError,
    };
}