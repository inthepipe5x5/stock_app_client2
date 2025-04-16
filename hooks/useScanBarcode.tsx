import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import supabase from "@/lib/supabase/supabase";



export function useBarcodeLookup({ barcode, signal, promises, options }:
    {
        barcode: string | null,
        signal?: AbortSignal,
        promises?: Promise<any>[]
        options?: UseQueryOptions<any, any, any, string[]>
    }) {
    // const off = await axios.get(`https://world.openfoodfacts.org/api/v1/product/${barcode}`);
    // const prices = await axios.get(`https://prices.openfoodfacts.org/api/v1/product/code/${barcode}`);
    const queries = [
        supabase.from("products").select("*").eq("barcode", barcode).single(),
        ...(promises ?? []),
    ];
    return useQuery({
        queryKey: ["barcode", barcode],
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
