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

/**
 * The `RoundedAppHBar` component in TypeScript React renders a horizontal bar with rounded icons that
 * can be pressed to navigate to different paths.
 * @param props - The `RoundedAppHBar` component takes the following props:
 * @returns The `RoundedAppHBar` component is being returned. It is a functional component that renders
 * a horizontal bar with rounded icons/buttons based on the provided props. The icons/buttons are
 * generated based on the `SideBarContentList` array and each item in the array is rendered as a
 * Pressable component containing an icon and text. When an icon/button is pressed, it logs the pressed
 * item's
 */
export const RoundedAppHBar = (props: {
    placement: "top" | "bottom" | "left" | "right";
    onPress: (item: Icons) => void;
    AppBarContent?: Icons[];
}) => {
    const router = useRouter();
    return (
        <HStack space="md" className={`fixed ${!!props?.placement ? props?.placement : "bottom"}-3 gap-2 justify-evenly rounded-full bg-primary-500 p-2`}>
            {
                (props?.AppBarContent ?? SideBarContentList).map((item, index) => {
                    return (
                        <Pressable key={index} className="rounded-full gap-2 w-20 h-40 py-4 justify-center items-center shadow-md"
                            onPress={() => {
                                console.log("Pressed:", item.iconText);
                                router.push({ pathname: item.pathname as any });
                            }}>
                            <Icon as={item.iconName} size="xl" color="white" />
                            <Text className="text-typography-100">{item.iconText}</Text>
                        </Pressable>
                    )
                }
                )
            }
        </HStack>
    );
}

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

