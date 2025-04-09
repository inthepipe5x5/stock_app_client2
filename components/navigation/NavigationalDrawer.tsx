import React, { useEffect, useState } from "react";
import { Appearance, Dimensions } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Pressable } from "@/components/ui/pressable";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { useRouter, useSegments, usePathname } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import { DraftingCompass, Icon as LCNIcon, UserCircle } from "lucide-react-native";
import { Inbox } from "lucide-react-native";
import { GlobeIcon } from "@/assets/icons/globe";
import { HomeIcon } from "@/assets/icons/home";
import { HeartIcon } from "@/assets/icons/heart";
import { ProfileIcon } from "@/assets/icons/profile";
import { LockIcon, SidebarCloseIcon, SidebarOpenIcon, UnlockIcon } from "lucide-react-native";
import { Drawer, DrawerBackdrop, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton } from "@/components/ui/drawer";
import { Heading } from "../ui/heading";
import { Button, ButtonText } from "../ui/button";
import { HStack } from "../ui/hstack";
import Colors from "@/constants/Colors";
import { viewPort } from "@/constants/dimensions";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { AltAuthLeftBackground, defaultAuthPortals } from "@/screens/(auth)/AltAuthLeftBg";

export type Icons = {
    iconName: LucideIcon | typeof LCNIcon;
    iconText?: string;
    pathname?: string;
};

export type SidebarProps = {
    iconList: Icons[];
    onClose?: (args?: any | undefined | null) => any;
    showDrawer?: boolean;
    defaultIndex?: number;
    className?: string;
    drawerProps?: {
        title: string;
        animationDuration?: number;
        animationType?: "slide" | "fade" | "none";
    };
    children?: React.ReactNode;
    onPressHandler?: () => void; //handler function for the sidebar icon eg. go home
    selectedIndex?: number;
    setSelectedIndex?: (index: number) => void | React.Dispatch<React.SetStateAction<number>>;

};

export type SideBarWrapperProps = Omit<SidebarProps, "iconList">;

export const SideBarContentList: Icons[] = [
    {
        iconName: UserCircle,
        iconText: "Profile",
        pathname: "/(tabs)/(profile)"
    },
    {
        iconName: HomeIcon,
        iconText: "Home",
        pathname: "/(tabs)/(dashboard)"
    },
    {
        iconName: Inbox,
        iconText: "Inbox",
        pathname: "/(tabs)/(inbox)"
    },
    {
        iconName: GlobeIcon,
        iconText: "Explore",
        pathname: "/(tabs)/(search)"
    },
    {
        iconName: DraftingCompass,
        iconText: "Drafts",
        pathname: "/(tabs)/(inbox)" //add a drafts screen later
    },
];

export const TabsSidebar = ({
    iconList,
    className = "w-14 pt-5 h-full items-center border-r border-border-300",
    defaultIndex = 0,
    onPressHandler,
    selectedIndex,
    setSelectedIndex,
    children
}: SidebarProps) => {
    const router = useRouter();
    const segments = useSegments();
    const pathname = usePathname();
    // const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const handlePress = (index: number) => {
        if (!!setSelectedIndex) setSelectedIndex(index);

        // router.push("/dashboard/dashboard-layout");
        onPressHandler ? onPressHandler() : router.canDismiss() ? router.dismissTo({ pathname: iconList[index].pathname as any }) : router.push({ pathname: iconList[index].pathname as any });
    };
    // const [sideBarContent, setSideBarContent] = useState<Icons[]>(iconList);

    const colorScheme = Appearance.getColorScheme();
    const isDarkMode = colorScheme === "dark";
    const colors = Colors[isDarkMode ? "light" : "dark"];
    const oppositeColors = Colors[isDarkMode ? "light" : "dark"];
    const { width, height } = Dimensions.get("window");
    const isActive = (index: number) => {
        return segments[0] === iconList[index].pathname?.split("/")[2];
    };

    useEffect(() => {
        const activeIndex = iconList.findIndex((item) => item.pathname === pathname);
        !!setSelectedIndex ?
            (activeIndex !== -1 ? setSelectedIndex(activeIndex) : setSelectedIndex(defaultIndex))
            : null;
    }, [pathname, iconList, defaultIndex]);

    // //set the content of the sidebar based on the current user location
    // useEffect(() => {
    //     const defaultIconList = segments.findIndex((item => item.includes('(auth)'))) !== -1 ? ;
    //     setSideBarContent(iconList);
    // }, [iconList]);

    const SideBarContent = () => {
        return !!children ?
            children :
            segments.findIndex((item => item.includes('(auth)'))) !== -1 ?
                // render the icons in the sidebar since the user is not in the auth stack
                AltAuthLeftBackground({ authPortals: defaultAuthPortals }) :
                renderIconNavBar(iconList)
    }

    const renderIconNavBar = (content: Icons[] = iconList) => {
        return content.map((item, index) => {
            const isSelected = isActive(index);
            const iconColor = isSelected ? colors.primary : oppositeColors.primary;

            // "fill-background-800" : "fill-none";
            return (
                <Pressable
                    key={index}
                    className={cn("hover:bg-background-50",
                        isDarkMode ? "bg-background-50" : "bg-transparent"
                    )}
                    onPress={() => handlePress(index)}
                >
                    <Icon
                        as={item.iconName}
                        className={cn(`w-[55px] h-9 stroke-background-800`,
                            index === selectedIndex ? "fill-background-800" : "fill-none"
                        )
                        }
                        color={iconColor.main}
                    />
                </Pressable>
            );
        });
    };

    return (
        <VStack
            className={
                cn("w-14 pt-5 h-full items-center border-r border-border-300", className)
            }
            space={height > viewPort.breakpoints.Y.tablet ? "xl" : "md"}
        >
            {SideBarContent()}

        </VStack>
    );
};

export const SidebarWrapper = (props: SideBarWrapperProps) => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [showDrawer, setShowDrawer] = useState<boolean>(props?.showDrawer ?? false);

    const toggleState = (state: boolean | number) => {
        if (typeof state === "boolean") {
            setShowDrawer(!state);
        } else if (typeof state === "number") {
            setSelectedIndex(state => state + 1);
        } else {
            return;
        }
    }

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: withTiming(showDrawer ? "14%" : "0%", { duration: props?.drawerProps?.animationDuration ?? 300 }),
            overflow: "scroll",
            zIndex: 1000,
        };
    });

    return (
        <VStack className="flex flex-row w-full h-full">
            <Animated.View style={animatedStyle}>
                <Drawer
                    isOpen={showDrawer}
                    onClose={() => {
                        setShowDrawer(false);
                        if (props?.onClose) props.onClose();

                    }}
                >
                    <DrawerBackdrop />
                    <DrawerContent className="px-4 py-3 w-[270px] md:w-[300px]">
                        <DrawerHeader>
                            <HStack className="justify-between">
                                <Button
                                    variant="link"
                                    onPress={() => { toggleState(false); if (props?.onClose) props.onClose(); }}

                                >
                                    <Icon as={showDrawer ? SidebarCloseIcon : SidebarOpenIcon} className="w-6 h-6" />
                                </Button>
                            </HStack>
                            <Heading size="md" className="text-typography-500">{props?.drawerProps?.title ?? "Drawer"}</Heading>
                            {/* <Button variant="link" size="xs" onPress={handleClearAll}>
                            <ButtonText>Clear All</ButtonText>
                        </Button> */}
                        </DrawerHeader>
                        <DrawerBody className="px-4 w-[470px] md:w-[300px] gap-4 mt-0 mb-0">\
                            {props?.children}
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            </Animated.View>

        </VStack>
    );
}

export default function NavigationalDrawer(props: SidebarProps) {
    const [showDrawer, setShowDrawer] = useState<boolean>(props?.showDrawer ?? false);

    return (
        <VStack space="md" className="flex-1 w-full h-full">
            <SidebarWrapper
                showDrawer={showDrawer}
                onClose={() => setShowDrawer(false)}
                drawerProps={{
                    ...props?.drawerProps ?? { title: "Navigate to" }
                }}
            >
                <TabsSidebar
                    defaultIndex={0}
                    onPressHandler={() => setShowDrawer(false)}
                    iconList={SideBarContentList}
                />
            </SidebarWrapper>
        </VStack >
    )
}