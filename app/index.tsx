import SearchableCountryPicker from "@/components/forms/SearchableCountryPicker";
import { useEffect } from "react";
import countriesJson from "@/utils/rest_countries.json";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { useLocalSearchParams } from "expo-router";
// export default AppBar;

// export default genericIndex;


// import { useLocalSearchParams } from "expo-router";
// import React, { useState } from "react";

// import genericIndex from "@/screens/genericIndex";

export default function AppRoot() {
    useEffect(() => {
        console.log("AppRoot mounted");
        console.log(countriesJson.length, !!countriesJson);
    }, []);


    return (
        <Center>
            <VStack>
                <Text>AppRoot</Text>
                <Text>{"Local params:  "}{JSON.stringify(useLocalSearchParams())}</Text>
                {/* <SearchableCountryPicker /> */}
            </VStack>
        </Center>
    )
};

// import React from 'react';
// import { HStack } from '@gluestack-ui/ui';