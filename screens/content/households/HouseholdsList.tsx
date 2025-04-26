import supabase from "@/lib/supabase/supabase";
import ComponentsListView from "@/screens/content/_layout";
import { useQuery, useIsFetching, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Database } from "@/lib/supabase/dbTypes";
import { Spinner } from "@/components/ui/spinner";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { ComponentCardProps } from "@/screens/modular/ComponentCard";
import { RelativePathString, router } from "expo-router";
import { HouseIcon } from "lucide-react-native";
import NoHouseholdsFound from "../NoHouseholdsFound";


type prefetchedHouseholdData = {
    user_households: Database['public']['Tables']['user_households']['Row'],
    households: Database['public']['Tables']["households"]['Row'],
    profiles: Partial<Database['public']['Tables']['profiles']['Row']>,
}[] | null | undefined

export default function HouseholdsList() {
    const qc = useQueryClient()
    const [user_id, setUserId] = useState<string | null>(null);

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
        enabled: !!user_id,
    })

    const isFetching = useIsFetching({ queryKey: ['households', { user_id }] }) > 0

    if (isFetching) {
        <><Center>
            <Text>...Loading</Text>
            <Spinner size="large" />
        </Center>
        </>
    }

    const households = useMemo(() => {
        const data = prefetchedHouseholds?.data as prefetchedHouseholdData ?? null;
        if (!!!data) return null;
        const mappedHouseholds = new Map<string, ComponentCardProps>();

        data.forEach((household) => {
            const { user_households, households, profiles } = household;
            const householdId = user_households?.household_id ?? null;
            if (!mappedHouseholds.has(householdId)) {
                mappedHouseholds.set(householdId, {
                    // ...user_households,
                    // ...households,
                    // ...profiles,
                    title: households?.name ?? "Household",
                    link: `/(tabs)/household/${householdId}` as RelativePathString,
                    url: (households?.media as { photo_light?: string })?.photo_light ?? require('@/assets/auth/login.png'),
                    darkUrl: (households?.media as { photo_dark?: string })?.photo_dark ?? require('@/assets/auth/login.png'),
                    CustomIcon: HouseIcon,
                    showIcon: true,
                    onPress: () => {
                        qc.setQueryData(['households', { user_id }], prefetchedHouseholds?.data)
                        router.push({ pathname: `/(tabs)/household/${householdId}` as RelativePathString });
                    }
                });
            }
        });
        return mappedHouseholds;

    }, [prefetchedHouseholds?.data]) as Map<string, ComponentCardProps>

    if (!households) {
        return <Text>No households found</Text>;
    }
    return !!households ?
        (
            <ComponentsListView
                componentsList={Array.from(households.values()) as ComponentCardProps[]}
                listTitle="Households"
                listDescription="You can create or join a household."
                listIcon={<HouseIcon size={40} color="#000" />}
                variant="list"
            />
        ) :
        <NoHouseholdsFound />
}