import SearchableCountryPicker, { CountryDropDown, CountryCodeProps } from "@/components/forms/SearchableCountryPicker";
import { useEffect, useRef, useState } from "react";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { HStack } from "@/components/ui/hstack";
import { useForm } from "react-hook-form";
import { useQuery } from '@tanstack/react-query';
import { sortAlphabetically } from '@/utils/sort';
import { fetchCountries, loadLocalCountriesData, CountryFilters, countryResult } from '@/utils/countries'

// import { productsCompactCards, tasksCompactCards } from "@/components/CompactContentCards";
// import { mapSingleProductToContentCard, mapSingleTaskToContentCard, CompactContentCard, ContentBadge } from "@/components/CompactContentCards";
// import defaultUserPreferences from "@/constants/userPreferences";
// import { authProviders } from "@/constants/oauthProviders";
import { Pressable } from "react-native";
// import { StatusBar } from "expo-status-bar";
import DashboardLayout from "@/screens/_layout";
import { fakeProduct, fakeTask } from "@/__mock__/ProductTasks";
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import { AlertCircleIcon } from "lucide-react-native";


export default function AppRoot() {
    const [selected, setSelected] = useState<{ name: string; cca3: string }>({
        name: "Canada",
        cca3: "CAN",
    });
    const [selectedCountry, setSelectedCountry] = useState<{ name: string; cca3: string } | null>(null);
    const debounceController = useRef(new AbortController());

    const formMethods = useForm({
        defaultValues: {
            search: ""
        },
        delayError: 1000,
        mode: "onBlur",
    })

    let countries = [] as countryResult[] | Promise<countryResult[] | []> | [];

    const countryData = useQuery<CountryFilters[]>({
        queryKey: ["countries"],
        queryFn: () => fetchCountries(debounceController.current.signal),
        select: (data) => sortAlphabetically(data), //sort the countries alphabetically
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
    });

    if (countryData.isError || !!!countryData.isSuccess) {
        console.error("Error fetching countries:", countryData.error);
        //set countries to local data if the API fails
        countries = loadLocalCountriesData().then(countries => countries ?? []);
    }

    if (countryData.isSuccess) {
        countries = countryData.data;
    }
    return (

        <SearchableCountryPicker
            {...{
                selected,
                setSelected,
                setSelectedCountry,
                formMethods,
                countries: countries ?? [],
            }}
        />
    )
};

// function AppRoot() {
//     const taskMapping = mapSingleTaskToContentCard(fakeTask);
//     console.log({ taskMapping });
//     const productMapping = mapSingleProductToContentCard(fakeProduct
//     );
//     console.log({ productMapping });

//     return (

//         <SafeAreaView className=" bg-black h-full">
//             <StatusBar style="light" />
//             <VStack space="xs">
//                 <Text className="text-lg font-bold text-typography-50 px-5">Hello, world!</Text>
//                 <Text className="text-typography-100 px-5">
//                     This is a GlueStack app built with React Native.
//                 </Text>
//                 <VStack space="xs" className="px-5 my-2">


//                 </VStack>
//             </VStack>
//         </SafeAreaView>
//     )
// }


