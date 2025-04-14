import { Database, Tables } from "@/lib/supabase/dbTypes";
import { InviteShareComponent } from "./qrView";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import * as Linking from "expo-linking";
import { useQueryClient } from "@tanstack/react-query";

type props = {
    resourceType: keyof Database['public']['Tables'];
    resourceId: { key: string, value: string };
}

export default function ResourceShareView(props: props) {
    const params = useLocalSearchParams();
    const { household_id } = params;
    const [householdId, setHouseholdId] = useState<string | null>(null);
    const [deepLink, setDeepLink] = useState<string | null>(null);
    const qc = useQueryClient();
    const [showInviteModal, setShowInviteModal] = useState(false);
    useEffect(() => {
        console.log("ResourceShareView params", params);
        setHouseholdId(!!household_id ? (Array.isArray(household_id) ? household_id[0] : household_id) : null);
    }
        , [params]);

    const createShareLink = (queryParams: any = {
        household_id: householdId,
        resourceType: props.resourceType,
        resourceId: props.resourceId,
    }) => {
        return Linking.createURL(`/(tabs)/household/[household_id]/${queryParams?.resourceType ?? 'product'}/[${queryParams?.resource_type}_id]`, {
            queryParams: queryParams ?? {},
        });
    }

    const handleShare = async () => {
        const link = createShareLink();
        setDeepLink(link);
        // await Linking.openURL(link);
    }
    const resourceData = qc.getQueryData([props.resourceType, props.resourceId.key, props.resourceId.value]);
    return (
        <InviteShareComponent
            household_id={parentHousehold}
            resourceType={props.resourceType}
            resourceId={props.resourceId}
        />
    )
}