import { Select, SelectTrigger, SelectInput, SelectPortal, SelectContent, SelectItem, SelectIcon } from "@/components/ui/select";

import { Center } from "@/components/ui/center";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useIsFetching, useQuery, useQueryClient } from "@tanstack/react-query";
import { mmkvCache } from "@/lib/storage/mmkv";
import { inventory } from "@/constants/defaultSession";
import { Database } from "@/lib/supabase/dbTypes";
import type { inv, prefetchedInventoryData } from "@/screens/content/inventories/InventoryList";
import { useMemo } from "react";
type InventorySelectDropDownProps = {
    setSelectedInventory: (args: any) => void
    selectedInventory: inv
    household_id: string
    user_id: string
}


const InventorySelectDropDown = ({
    user_id,
    household_id,
    setSelectedInventory }: InventorySelectDropDownProps
) => {

    const prefetchedInventoryData = useQuery({
        queryKey: ["inventories", { user_id }],
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

        return data.filter((inv: inv) => {
            return [
                inv.household_id === household_id,
                inv.is_template === false,
                inv.draft_status === 'confirmed'
            ].every(Boolean)
        });

    }, [prefetchedInventoryData?.data]) as inv[]



    return (
        <Select
            onValueChange={(value: string) => {
                const selectedInventory = inventories?.find((inv) => inv.id === value)
                if (!!selectedInventory?.id && selectedInventory?.id !== value) {
                    setSelectedInventory(selectedInventory)
                    console.log("Selected Inventory: ", { selectedInventory })
                }
            }}
        >
            <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md p-2">
                <SelectInput placeholder="Select Inventory" />
                <SelectIcon />
            </SelectTrigger>
            <SelectPortal>
                <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                    {inventories.map((inventory) => (
                        <SelectItem
                            key={inventory.id}
                            value={inventory.id}
                            label={inventory.name}
                        >
                            {inventory.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </SelectPortal>
        </Select>
    )
}

export default InventorySelectDropDown;