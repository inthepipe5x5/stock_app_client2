import React, { useMemo } from "react";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Checkbox, CheckboxIndicator, CheckboxLabel, CheckboxIcon, CheckboxGroup } from "@/components/ui/checkbox";
import { Divider } from "@/components/ui/divider";
import { Drawer, DrawerBackdrop, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from "@/components/ui/drawer";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Slider, SliderThumb, SliderTrack, SliderFilledTrack } from "@/components/ui/slider";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Icon, CheckIcon, CircleIcon, CloseCircleIcon } from "@/components/ui/icon";
import colors from "tailwindcss/colors";

import { CountryFilters, countryResult } from "@/utils/countries";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { lowerCaseSort } from "@/utils/sort";
import baseCountryData from "@/utils/rest_countries.json";
import { LockIcon, SidebarCloseIcon, SidebarOpenIcon, UnlockIcon } from "lucide-react-native";
import { capitalize } from "@/utils/capitalizeSnakeCaseInputName";
import { pluralizeStr } from "@/utils/pluralizeStr";
import { Input, InputField } from "@/components/ui/input";
import { Pressable } from "../ui/pressable";

import { Keyboard } from "react-native";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Motion } from "@legendapp/motion";
import { Save, Lock, ArrowUp01, ArrowDown01, PanelLeftClose, PanelLeftOpen } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import { loadLocalCountriesData } from "@/utils/countries";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import {
    Modal,
    Animated,
    Easing,
    StyleSheet,
    TouchableWithoutFeedback,
} from "react-native";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { sortAlphabetically } from "@/utils/sort";
import { setAbortableTimeout } from "@/hooks/useDebounce";
import { Popover, PopoverBackdrop, PopoverArrow, PopoverBody, PopoverContent } from "@/components/ui/popover";

const PopOverComponent = (props: {
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
    placement: "top" | "bottom" | "left" | "right";
    size: "sm" | "md" | "lg";
    trigger: (triggerProps: any) => JSX.Element;
    popoverContent: JSX.Element;
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const handleOpen = () => {
        setIsOpen(true);
    };
    const handleClose = () => {
        setIsOpen(false);
    };
    return (
        <Popover
            isOpen={isOpen}
            onClose={handleClose}
            onOpen={handleOpen}
            placement="bottom"
            size="md"
            trigger={(triggerProps) => {
                return !!props.trigger ? props.trigger(triggerProps) : (
                    <Button
                        {...triggerProps}
                    >
                        <ButtonText>
                            Open Popover
                        </ButtonText>
                    </Button>
                );
            }}
        >
            <PopoverBackdrop />
            <PopoverContent>
                <PopoverArrow
                />
                <PopoverBody>
                    {/* <Text size={props.size} className="text-typography-900">
                        Alex, Annie and many others are already enjoying the Pro features,
                        don't miss out on the fun!
                    </Text> */}
                    {props.popoverContent}
                </PopoverBody>
            </PopoverContent>
        </Popover>
    )
}
export default PopOverComponent;