import SearchableCountryPicker from "@/components/forms/SearchableCountryPicker";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";
import countriesJson from "@/utils/rest_countries.json";

// import { useLocalSearchParams } from "expo-router";
// import React, { useState } from "react";

// import genericIndex from "@/screens/genericIndex";

// export default function AppRoot() {
//     useEffect(() => {
//         console.log("AppRoot mounted");
//         console.log(countriesJson.length, !!countriesJson);
//     }, []);
//     // return (
//     //     <Center>
//     //         <VStack>
//     //             <Text>AppRoot</Text>
//     //             {/* <SearchableCountryPicker /> */}
//     //         </VStack>
//     //     </Center>
//     // )
// };

// import React from 'react';
// import { HStack } from '@gluestack-ui/ui';
import { Pressable } from 'react-native';

const AppBar = () => {
    return (
        <HStack
            className="bg-primary-500 p-4 items-center justify-between"
            space="md"
        >
            <Text className="text-white text-lg font-bold">My App</Text>
            <HStack space="sm">
                <Pressable className="p-2">
                    <Text className="text-white">Menu 1</Text>
                </Pressable>
                <Pressable className="p-2">
                    <Text className="text-white">Menu 2</Text>
                </Pressable>
                <Pressable className="p-2">
                    <Text className="text-white">Menu 3</Text>
                </Pressable>
            </HStack>
        </HStack>
    );
};

// export default AppBar;

// export default genericIndex;

import React from 'react';
import { SafeAreaView, View } from 'react-native';

export default function App() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <AppBar />
            <View className="flex-1 p-4">
                {/* Your app content goes here */}
                <VStack space="md">
                    <Text className="text-lg font-bold">Hello, world!</Text>
                    <Text className="text-typography-500">
                        This is a GlueStack app built with React Native.
                    </Text>
                    {/* <SearchableCountryPicker /> */}
                </VStack>
            </View>
        </SafeAreaView>
    );
}

