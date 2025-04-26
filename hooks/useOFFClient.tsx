import { useCallback, useMemo, useState } from "react";
import { getOFFURL } from "@/lib/OFF/OFFcredentials";
import { OFFProductHelper } from "@/lib/supabase/ResourceHelper";
import { OFFClient } from "@/lib/OFF/client";
import { session } from "@/constants/defaultSession";
import normalizeBarcode from "@/utils/barcode";

export type useOFFClientHookProps = {
    state?: Partial<session> | null | undefined;
    // user_id?: string | null | undefined;
    countryCode?: string | null | undefined;
    languageCode?: string | null | undefined;
    category?: "all" | "food" | "beauty" | "petfood" | null | undefined;
    apiVersion?: number | null | undefined;
}

export default function useOFFClient(props: Partial<useOFFClientHookProps> | null | undefined = {}) {
    const { state, category, languageCode, apiVersion, countryCode } = props || {};
    const user_id = state?.user?.user_id ?? null;
    const cca2 = countryCode ?? state?.user?.country ?? "CA";

    const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([]);

    const offClient = useMemo(() => {
        return new OFFClient({
            user_id,
            countryCode: cca2,
            category: category ?? "all",
            languageCode: languageCode ?? "en",
            apiVersion,
        });
    }, [user_id, countryCode, category, languageCode, apiVersion]);

    const handleNewBarcode = useCallback((barcode: string) => {
        const normalizedBarcode = normalizeBarcode(barcode);
        if (!scannedBarcodes.includes(normalizedBarcode)) {
            setScannedBarcodes((prev) => [...prev, normalizedBarcode]);
            console.log("New barcode added:", normalizedBarcode);
        }
    }, [scannedBarcodes]);

    return {
        client: offClient,
        barcodes: useMemo(() => scannedBarcodes, [scannedBarcodes]), //use to get cached product data from queryClient
        handleNewBarcode,
        locale: useMemo(() => {
            return {
                countryCode: cca2,
                languageCode: languageCode ?? "en",
                ...{ city: state?.user?.city ?? {} }
            };
        }, [cca2, languageCode]),
        url: useMemo(() => {
            return getOFFURL({
                countryCode: cca2,
                category: category ?? "all",
                apiVersion,
            });
        },
            [cca2, category, apiVersion]),
    };

}