import SearchableCountryPicker from "@/components/forms/SearchableCountryPicker";
import { useEffect, useState } from "react";
import countriesJson from "@/utils/rest_countries.json";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { useLocalSearchParams } from "expo-router";
import countryJson from "@/utils/rest_countries.json";
import { CountryDropDown } from "@/components/forms/SearchableCountryPicker";
import { countryResult } from "@/utils/countries";
import { SafeAreaView } from "react-native-safe-area-context";
import { HStack } from "@/components/ui/hstack";
// export default AppBar;

// export default genericIndex;


// import { useLocalSearchParams } from "expo-router";
// import React, { useState } from "react";

// import genericIndex from "@/screens/genericIndex";

export default function AppRoot() {
    const [selected, setSelected] = useState<{ name: string; cca3: string } | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<Partial<countryResult> | null | undefined>(null);

    useEffect(() => {
        console.log("AppRoot mounted");
        console.log(countriesJson.length, !!countriesJson);
    }, []);


    return (
        <SafeAreaView className="flex-1 min-w-9">
            <Center>
                <VStack>
                    <Text>AppRoot</Text>
                    {/* <Text>{"Local params:  "}{JSON.stringify(useLocalSearchParams())}</Text> */}
                    <SearchableCountryPicker />
                    {/* {
                        !!countryData?.data :
                    (<CountryDropDown {...{ selected: selected || { name: "", cca3: "" }, setSelected, setSelectedCountry, countries }} />)
                    : (<HStack>
                        <Text>Loading</Text>
                        <Spinner />
                    </HStack>)
                    } */}


                </VStack>
            </Center>
        </SafeAreaView>
    )
};

// import React from 'react';
// import { HStack } from '@gluestack-ui/ui';