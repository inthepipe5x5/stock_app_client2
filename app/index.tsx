import { useEffect, useState } from "react";
import countriesJson from "@/utils/rest_countries.json";
import { CountryFilters } from "@/utils/countries";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { useLocalSearchParams } from "expo-router";
// import countryJson from "@/utils/rest_countries.json";
import CountryDropDown from "@/components/forms/SearchableCountryPicker";
import { countryResult } from "@/utils/countries";
import { SafeAreaView } from "react-native-safe-area-context";
import { HStack } from "@/components/ui/hstack";
import { AnyUseQueryOptions } from "@tanstack/react-query";

export default function AppRoot() {
    // const [selected, setSelected] = useState<string>("");//useState<{ name: string; cca3: string } | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<{ [key: string]: any } | null | undefined>(null);

    useEffect(() => {
        console.log("AppRoot mounted");
        console.log({ selectedCountry });
    }, [selectedCountry]);


    return (
        <SafeAreaView>
            {/* <VStack> */}


            {/* <Text className="text-red-650">Country Picker</Text> */}
            {/* <Text>{"Local params:  "}{JSON.stringify(useLocalSearchParams())}</Text> */}
            {/* <SearchableCountryPicker 
                    
                    
                    /> */}
            {
                // : (<HStack>
                // <Text>Loading</Text>
                // <Spinner />
                // </HStack>)
            }
            <CountryDropDown
                selected={selectedCountry}//|| { "name": "Canada", "dial_code": "+1", "code": "CA", "flag": "🇨🇦" }}
                setSelected={setSelectedCountry as any}
            // countries={countries as any} 
            />
            {/* </VStack> */}
        </SafeAreaView>
    )
};

// import React from 'react';
// import { HStack } from '@gluestack-ui/ui';