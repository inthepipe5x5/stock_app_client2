import React from 'react';
import { SafeAreaView, View } from 'react-native';
import appName from "@/constants/appName";
import { Icon } from "@/components/ui/icon";
import { StatusBar } from "expo-status-bar";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { useRouter, SplashScreen, usePathname, useSegments } from "expo-router";
import { Icons, SideBarContentList } from "@/components/navigation/NavigationalDrawer";
import { Pressable } from "@/components/ui/pressable";


const AppBar = (props: any) => {
    const router = useRouter();
    const segments = useSegments().slice(0, 2).join("/");
    // const currentSegment = (usePathname() ?? "/").split("/").reverse().slice(0, 2).reverse().join("/");

    const handlePress = (!!props.handleIconPress && typeof props.handleIconPress === "function") ? props.handleIconPress({} as any) : ({ iconText, pathname }: any) => {
        console.log(iconText, "Pressed", "navigating to", pathname);
        router.push({ pathname: pathname as any })
    }
    const content = !!props.AppBarContent ? props.AppBarContent as Icons[] : SideBarContentList;
    return (!!!props.vertical ? (
        <HStack
            className="pt-8 bg-primary-900 p-4 items-center justify-center"
            space="md"
        >
            {/* <Text className="text-white text-lg font-bold">{appName} Landing Screen</Text> */}
            <HStack space="sm">
                {
                    content.map((item, index) => (
                        <Pressable key={index} className={"p-5"} onPress={handlePress(item)}>
                            <VStack className="items-center place-content-center text-typography-white-500">
                                <Icon as={item.iconName} size="xl" fill={item.pathname?.slice(1) === segments ? "red" : "FFF"} />
                                <Text className="text-white" size="sm">{item.iconText}</Text>
                            </VStack>
                        </Pressable>
                    ))
                }
            </HStack>
        </HStack>
    ) : (
        <VStack
            className="pt-8 bg-primary-900 p-4 items-center justify-center"
            space="md"
        >
            {/* <Text className="text-white text-lg font-bold">{appName} Landing Screen</Text> */}
            <VStack space="sm">
                {
                    content.map((item, index) => (
                        <Pressable key={index} className={"p-5"} onPress={handlePress(item)}>
                            <HStack className="items-center place-content-center text-typography-white-500">
                                <Icon as={item.iconName} size="xl" fill={item.pathname?.slice(1) === segments ? "red" : "FFF"} />
                                {/* <Text className="text-white" size="sm">{item.iconText}</Text> */}
                            </HStack>
                        </Pressable>
                    ))
                }
            </VStack>
        </VStack>
    ));
};

export default function AppBarView(props: any) {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="light" />
            <AppBar />
            <View className="flex-1 p-4">
                {/* Your app content goes here */}
                <VStack space="md">
                    {!!props.children ? props.children : (
                        <>
                            <Text className="text-lg font-bold">Hello, world!</Text>
                            <Text className="text-typography-500">
                                {appName ?? "Some Expo App"} is a GlueStack app built with React Native.
                            </Text>
                        </>
                    )}
                    {/* <SearchableCountryPicker /> */}
                </VStack>
            </View>
        </SafeAreaView>
    );
}

