import React, { useState } from "react";
import { Pressable } from "@/components/ui/pressable";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { useRouter } from "expo-router";
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
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";


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
    };
    children?: React.ReactNode;
    onPressHandler?: () => void; //handler function for the sidebar icon eg. go home
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
    iconList = SideBarContentList,
    className = "w-14 pt-5 h-full items-center border-r border-border-300",
    defaultIndex = 0,
    onPressHandler,
}: SidebarProps) => {
    const router = useRouter();
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const handlePress = (index: number) => {
        setSelectedIndex(index);

        // router.push("/dashboard/dashboard-layout");
        onPressHandler ? onPressHandler() : router.canDismiss() ? router.dismissTo({ pathname: iconList[index].pathname as any }) : router.push({ pathname: iconList[index].pathname as any });
    };

    return (
        <VStack
            className={
                className ?? "w-14 pt-5 h-full items-center border-r border-border-300"
            }
            space="xl"
        >
            {iconList.map((item, index) => {
                return (
                    <Pressable
                        key={index}
                        className="hover:bg-background-50"
                        onPress={() => handlePress(index)}
                        onHoverIn={() => setSelectedIndex(index)}
                        onHoverOut={() => setSelectedIndex(defaultIndex)}
                    >
                        <Icon
                            as={item.iconName}
                            className={`w-[55px] h-9 stroke-background-800 
                ${index === selectedIndex ? "fill-background-800" : "fill-none"}
  
                `}
                        />
                    </Pressable>
                );
            })}
        </VStack>
    );
};

export const SidebarWrapper = (props: SideBarWrapperProps) => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [showDrawer, setShowDrawer] = useState<boolean>(props?.showDrawer ?? false);

    const toggleState = (state: boolean | number) => {
        if (typeof state === "boolean") {
            setShowDrawer(!state);
        } else {
            setSelectedIndex(state => state + 1);
        }
    }

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: withTiming(showDrawer ? "14%" : "0%", { duration: 300 }),
            overflow: "hidden",
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
                                <Button variant="link" onPress={() => { toggleState(false); if (props?.onClose) props.onClose(); }}>
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

export default () => {
    const [showDrawer, setShowDrawer] = useState<boolean>(false);
    const router = useRouter();

    return (
        <SidebarWrapper
            showDrawer={showDrawer}
            onClose={() => setShowDrawer(false)}
            drawerProps={{
                title: "Navigation"
            }}
        >
            <TabsSidebar
                defaultIndex={0}
                onPressHandler={() => setShowDrawer(false)}
                iconList={SideBarContentList}
            />
        </SidebarWrapper>
    )
}