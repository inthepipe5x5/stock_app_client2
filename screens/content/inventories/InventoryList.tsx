import supabase from "@/lib/supabase/supabase";
import ComponentsListView from "@/screens/content/_layout";
import { useQuery, useIsFetching, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Database } from "@/lib/supabase/dbTypes";
import { Spinner } from "@/components/ui/spinner";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { ComponentCardProps } from "@/screens/modular/ComponentCard";
import { RelativePathString, router, useLocalSearchParams } from "expo-router";
import { HouseIcon } from "lucide-react-native";
import NoHouseholdsFound from "../NoHouseholdsFound";


type prefetchedHouseholdData = {
    user_households: Database['public']['Tables']['user_households']['Row'],
    households: Database['public']['Tables']["households"]['Row'],
    profiles: Partial<Database['public']['Tables']['profiles']['Row']>,
}[] | null | undefined
export type inv = Database["public"]["Tables"]["inventories"]["Row"]
export type prefetchedInventoryData = inv[] | []

export default function InventoriesList() {
    const qc = useQueryClient()
    const [user_id, setUserId] = useState<string | null>(null);
    const { household_id } = useLocalSearchParams<{
        household_id: string
    }>();

    useEffect(() => {
        const fetchUserId = async () => {
            const sessionData = await supabase.auth.getSession();
            const session = sessionData?.data?.session ?? null;
            setUserId(session?.user?.id ?? null);
        };
        fetchUserId();
    }, []);

    const prefetchedHouseholds = useQuery({
        queryKey: ['households', { user_id }],
        enabled: !!user_id && !!household_id,
    })
    const prefetchedInventoryData = useQuery({
        queryKey: ["inventories"],
        enabled: !!household_id
    })

    const isFetching = useIsFetching({ queryKey: ['inventories', { user_id }] }) > 0

    if (isFetching) {
        <>
            <Center>
                <Text>...Loading</Text>
                <Spinner size="large" />
            </Center>
        </>
    }

    const inventories = useMemo(() => {
        const data = prefetchedInventoryData?.data as prefetchedInventoryData ?? null;
        if (!!!data) return null;
        const mappedInventories = new Map<string, ComponentCardProps>();

        data.forEach((inv: inv) => {
            const { id, name, household_id } = inv;
            if (!mappedInventories.has(id)) {
                mappedInventories.set(id, {

                    title: `${name}-${inv?.category}`,
                    url: "/(tabs)/inventories/[household_id]/[inventory_id]" as RelativePathString,
                    link: `/(tabs)/inventories/${household_id}/${id}` as RelativePathString,
                    showIcon: true,
                    onPress: () => {
                        router.push({
                            pathname: "/(tabs)/inventories/[household_id]/[inventory_id]" as RelativePathString,
                            params: { household_id, inventory_id: id }
                        })
                    },
                });
            }
        });
        return mappedInventories;

    }, [prefetchedInventoryData?.data]) as Map<string, ComponentCardProps>

    if (!inventories) {
        return <Text>No inventories found</Text>;
    }
    return !!inventories ?
        (
            <ComponentsListView
                componentsList={Array.from(inventories.values()) as ComponentCardProps[]}
                listTitle="Households"
                listDescription="You can create or join a household."
                listIcon={<HouseIcon size={40} color="#000" />}
                variant="list"
            />
        ) :
        <NoHouseholdsFound />
}