// import SearchableCountryPicker from "@/components/forms/SearchableCountryPicker";
// import { useEffect, useRef, useState } from "react";
// import { Center } from "@/components/ui/center";
// import { VStack } from "@/components/ui/vstack";
// import { Text } from "@/components/ui/text";
// import { useLocalSearchParams } from "expo-router";
// import { CountryDropDown } from "@/components/forms/SearchableCountryPicker";
import { SafeAreaView } from "react-native-safe-area-context";
// import { HStack } from "@/components/ui/hstack";
// import { useForm } from "react-hook-form";
// import { useQuery } from '@tanstack/react-query';
// import { sortAlphabetically } from '@/utils/sort';
// import { fetchCountries, loadLocalCountriesData, CountryFilters, countryResult } from '@/utils/countries'
// export default function AppRoot() {
//     const [selected, setSelected] = useState<{ name: string; cca3: string }>({
//         name: "Canada",
//         cca3: "CAN",
//     });
//     const [selectedCountry, setSelectedCountry] = useState<{ name: string; cca3: string } | null>(null);
//     const debounceController = useRef(new AbortController());

//     const formMethods = useForm({
//         defaultValues: {
//             search: ""
//         },
//         delayError: 1000,
//         mode: "onBlur",
//     })

//     let countries = [] as countryResult[] | Promise<countryResult[] | []> | [];

//     const countryData = useQuery<CountryFilters[]>({
//         queryKey: ["countries"],
//         queryFn: () => fetchCountries(debounceController.current.signal),
//         select: (data) => sortAlphabetically(data), //sort the countries alphabetically
//         refetchOnWindowFocus: false,
//         refetchOnMount: false,
//         refetchOnReconnect: false,
//         refetchInterval: false,
//         refetchIntervalInBackground: false,
//     });

//     if (countryData.isError || !!!countryData.isSuccess) {
//         console.error("Error fetching countries:", countryData.error);
//         //set countries to local data if the API fails
//         countries = loadLocalCountriesData().then(countries => countries ?? []);
//     }

//     if (countryData.isSuccess) {
//         countries = countryData.data;
//     }
//     return (

//         <SearchableCountryPicker {...{
//             selected,
//             setSelected,
//             setSelectedCountry,
//             formMethods,
//             countries: countries ?? [],
//         }} />
//     )
// };

import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
// import { productsCompactCards, tasksCompactCards } from "@/components/CompactContentCards";
import { mapSingleProductToContentCard, mapSingleTaskToContentCard, CompactContentCard } from "@/components/CompactContentCards";
import { product, task } from "@/constants/defaultSession";
import defaultUserPreferences from "@/constants/userPreferences";
import { authProviders } from "@/constants/oauthProviders";
import { Pressable } from "react-native";
const fakeProduct = {
    id: "1",
    product_name: "Sample Product",
    description: "This is a sample product.",
    inventory_id: "1",
    vendor_id: "1",
    auto_replenish: false,
    min_quantity: 10,
    max_quantity: 100,
    current_quantity: 50,
    quantity_unit: "pcs",
    current_quantity_status: "in_stock",
    barcode: "1234567890123",
    qr_code: "sample_qr_code",
    last_scanned: new Date().toISOString(),
    scan_history: {},
    expiration_date: new Date().toISOString(),
    updated_dt: new Date().toISOString(),
    draft_status: "draft",
    is_template: false,
    product_category: "general",
    icon_name: "sample_icon",
    tasks: []
} as product;

const fakeTask = {
    id: "1",
    task_name: "Sample Task",
    description: "This is a sample task.",
    user_id: "1",
    product_id: "1",
    due_date: new Date().toISOString(),
    completion_status: "pending",
    recurrence_interval: "none",
    recurrence_end_date: new Date().toISOString(),
    is_automated: false,
    automation_trigger: "none",
    created_by: "1",
    created_dt: new Date().toISOString(),
    updated_dt: new Date().toISOString(),
    last_updated_by: "1",
    draft_status: "draft",
    is_template: false,
    assigned_to: {
        user_id: "1",
        email: "user@example.com",
        phone_number: "1234567890",
        name: "John Doe",
        first_name: "John",
        last_name: "Doe",
        preferences: defaultUserPreferences,
        postalcode: "12345",
        city: "Sample City",
        state: "Sample State",
        country: "USA",
        draft_status: "draft",
        created_at: new Date().toISOString(),
        app_metadata: {
            avatar_url: "https://example.com/avatar.png",
            is_super_admin: false,
            sso_user: false,
            provider: null,
            setup: {
                email: true,
                authenticationMethod: true,
                account: true,
                details: true,
                preferences: true,
                confirmation: true
            },
            authMetaData: {}
        }
    }
} as task;


export default function AppRoot() {
    return (
        <SafeAreaView className="flex-1 bg-white">

            <VStack space="md">
                <Text className="text-lg font-bold">Hello, world!</Text>
                <Text className="text-typography-500">
                    This is a GlueStack app built with React Native.
                </Text>
                <VStack space="md">
                    <Pressable onPress={() => console.log("Product pressed")}>
                        <CompactContentCard {...mapSingleProductToContentCard(fakeProduct)} />
                    </Pressable>
                    <CompactContentCard {...mapSingleTaskToContentCard(fakeTask)} />

                </VStack>
            </VStack>
        </SafeAreaView>
    )
}

// import AppBar from "@/components/navigation/AppBar";
// import { Icons, SideBarContentList } from "@/components/navigation/NavigationalDrawer";
// import { useRouter } from "expo-router";

// export default function AppRoot() {
//     const router = useRouter();
//     const handleIconPress = (item: Icons) => () => {
//         console.log({ item });
//         router.push(item.pathname as any);
//     };
//     return (
//         <SafeAreaView className="flex-1 bg-white">
//             <AppBar AppBarContent={SideBarContentList} handleIconPress={handleIconPress} />
//             <VStack space="md">
//                 <Text className="text-lg font-bold">Hello, world!</Text>
//                 <Text className="text-typography-500">
//                     This is a GlueStack app built with React Native.
//                 </Text>
//             </VStack>
//         </SafeAreaView>
//     )
// }