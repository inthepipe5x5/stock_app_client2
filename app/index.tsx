// import { useEffect, useState } from "react";
// import countriesJson from "@/utils/rest_countries.json";
// import { CountryFilters } from "@/utils/countries";
// import { Center } from "@/components/ui/center";
// import { VStack } from "@/components/ui/vstack";
// import { Text } from "@/components/ui/text";
// import { useLocalSearchParams } from "expo-router";
// // import countryJson from "@/utils/rest_countries.json";
// import CountryDropDown from "@/components/forms/SearchableCountryPicker";
// import { countryResult } from "@/utils/countries";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { HStack } from "@/components/ui/hstack";
// import LocationFormScreen from "@/screens/(auth)/signup/LocationFormScreen";
// export default function AppRoot() {
//     // const [selected, setSelected] = useState<string>("");//useState<{ name: string; cca3: string } | null>(null);
//     const [selectedCountry, setSelectedCountry] = useState<{ [key: string]: any } | null | undefined>(null);
//     return (
//         <LocationFormScreen />

//     )
// };
import { Keyboard } from "react-native";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Motion } from "@legendapp/motion";
import { Button, ButtonText, ButtonIcon, ButtonGroup } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Drawer, DrawerBackdrop, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from "@/components/ui/drawer";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Icon, PhoneIcon, StarIcon } from "@/components/ui/icon";
import React, { useEffect, useMemo } from "react";
import { Save, Lock, ArrowUp01, ArrowDown01, PanelLeftClose, PanelLeftOpen } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { loadLocalCountriesData, findCountryByKey, CountryFilters } from "@/utils/countries";
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
import { Spinner } from "@/components/ui/spinner";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
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
            placement="bottom" size="md"
            trigger={(triggerProps) => {
                return (
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
                <PopoverArrow />
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

export default function SelectableCountryDrawer() {
    const [showDrawer, setShowDrawer] = React.useState(false);
    const [count, setCount] = React.useState<number>(0);
    const [textInput, setTextInput] = React.useState<string>("");
    const [countries, setCountries] = React.useState<CountryFilters[] | null>(null);
    const [currentCountry, setCurrentCountry] = React.useState<CountryFilters | null>(null);
    const [reverseAlphabetical, setReverseAlphabetical] = React.useState<boolean>(false);

    const controllerRef = React.useRef<AbortController | AbortSignal | null>(null);
    const inputRef = React.useRef<{ focus: () => void } | null>(null);
    const countRef = React.useRef<number>(count)
    const submitRef = React.useRef<any>(null);
    const toast = useToast();

    const updateCountRef = (newCount: number) => {
        countRef.current = countries?.length ?? newCount;
    }

    useEffect(() => {
        loadLocalCountriesData().then(data => {
            setCountries(data as CountryFilters[]);
        });
        console.log("Countries loaded:", countries?.length);
    }, []);

    const SaveButton = React.forwardRef((props, ref) => {
        return (
            <Button
                ref={submitRef}
                className="w-[20px] gap-2"
                variant={!!currentCountry ? "solid" : "outline"}
                action={!!currentCountry ? "positive" : "secondary"}
                disabled={!!!currentCountry}
                onPress={() => {
                    // if (!!!currentCountry) {
                    //     console.log("Clearing country selection and inputs");
                    //     setCurrentCountry(null);
                    //     setTextInput("");
                    //     // if (!!inputRef?.current) {
                    //     //     inputRef?.current?.focus();
                    //     //     inputRef.current?.scrollIntoView({ behavior: "smooth", animated: true });
                    //     // }
                    //     return;
                    // }
                    console.log("Submitting country selection:", { currentCountry });
                    setShowDrawer(false);
                    toast.show({
                        id: `${currentCountry?.cca3 ?? 'N/A'}-success-${Math.random()}`,
                        placement: "top",
                        duration: 5000,
                        render: ({ id }) => {
                            return (
                                <Toast id={id} variant="solid" action="success">
                                    <VStack className="gap-2">
                                        <ToastTitle action="success" variant="solid">{`${currentCountry?.flag ?? '🏁'}`}Country Selected!</ToastTitle>
                                        <ToastDescription size="sm">{`${currentCountry?.name?.common}`}</ToastDescription>
                                    </VStack>
                                </Toast>
                            )
                        }
                    });
                }}
            >
                <ButtonText className={!!!currentCountry ? "text-gray-400" : 'text-typography-white'}>Submit</ButtonText>
                {/* <ButtonText>{!!!currentCountry ? "Clear" : 'Submit'}</ButtonText> */}
                <ButtonIcon as={!!!currentCountry ? Lock : Save} color={!!!currentCountry ? "black" : "white"} />
            </Button >);
    });
    const ReverseButton = () => {
        return (
            <Button
                className="w-[20px] gap-2"
                variant={reverseAlphabetical ? "solid" : "outline"}
                action={reverseAlphabetical ? "primary" : "secondary"}
                onPress={() => {
                    setReverseAlphabetical(!reverseAlphabetical);
                }
                }
            >
                {/* <ButtonText>{`Sort ${!!reverseAlphabetical ? 'A-Z' : 'Z-A'}`}</ButtonText> */}
                <ButtonIcon as={!!reverseAlphabetical ? ArrowUp01 : ArrowDown01} color={
                    !!!reverseAlphabetical ? "black" : "white"
                } />
            </Button >
        )
    }

    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animate loading in/out
        Animated.timing(fadeAnim, {
            toValue: !!countries ? 1 : 0,
            duration: 1500,
            useNativeDriver: true,
            easing: !!countries ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
        }).start();

        //set count state to the length of the countries array
        !!countries?.length && countRef.current === countries.length ? setCount(countries?.length ?? 0) : updateCountRef(countries?.length ?? 0);
    }, [countries]);

    // useEffect(() => {
    //     controllerRef.current = new AbortController();
    //     const signal = controllerRef.current instanceof AbortController ? controllerRef.current.signal : null;
    //     setAbortableTimeout({
    //         callback: () => {
    //             if (!textInput || textInput.trim().length === 0) {
    //                 setFilteredCountries(countries ?? []);
    //                 return;
    //             }

    //             const result = findCountryByKey(
    //                 countries,
    //                 { keys: ['name.common', 'cca2', 'cca3'], searchValue: textInput },
    //                 true
    //             );
    //             setFilteredCountries(result);
    //         }, delay: 300, signal
    //     });

    //     return () => controllerRef.current?.abort();
    // }, [textInput, countries]);


    // useEffect(() => {
    //     if (!userActivity) {
    //         const filteredCountries = findCountryByKey(countries, { keys: ['name', 'cca2', 'cca3'], searchValue: textInput }, true);
    //         setCountries(filteredCountries);
    //         setCount(filteredCountries.length);
    //     }
    // }, [textInput, userActivity]);

    const handleCountryTap = (country: CountryFilters) => {
        console.log('PRESSED', { country });
        controllerRef.current = new AbortController();
        controllerRef.current.abort();
        setCurrentCountry(country);
        setTextInput(country.name.common);
    }

    const CountryList = React.memo(({ countries, currentCountry, reverse, onSelect }:
        {
            countries: CountryFilters[] | null;
            currentCountry: CountryFilters | null;
            reverse: boolean;
            onSelect: (country: CountryFilters) => void;
        }) => {

        const OnPressFn = !!onSelect ? onSelect : handleCountryTap;
        if (!!!countries || countries.length === 0) {
            return (<VStack className="gap-2">
                <Text className="text-typography-error">No countries found</Text>
            </VStack>)
        }
        const reverseArray = !!reverse
        const sorted = countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
        return (

            <VStack className="gap-2" reversed={reverseArray}>
                {//if countries
                    // !!countries?
                    sorted?.map((country, index) => (
                        <Pressable
                            key={index}
                            className={`gap-2 flex-row items-center hover:bg-background-50 p-2 rounded-md  ${currentCountry?.cca3 === country.cca3 ?
                                'bg-background-success' : ''}`}
                            onPress={() => { OnPressFn(country) }}
                        >
                            <Text className="text-typography-600">{`${country.flag} ${country.name.common}`}</Text>
                        </Pressable>
                    ))}
            </VStack>

        );
    }, (prevProps, nextProps) => {
        return (
            prevProps.countries === nextProps.countries &&
            prevProps.currentCountry?.cca3 === nextProps.currentCountry?.cca3
        );
    });

    return (
        <SafeAreaView className="my-safe-or-3.5 border-red-100 border-2 h-full w-screen">
            <Pressable
                onPress={() => {
                    setShowDrawer(true);
                }}
                // className="gap-2"
                className="absolute bottom-10 right-2 px-2 m-safe-offset-2 bg-primary-500 w-16 h-16 rounded-full justify-center items-center shadow-md"
            >
                <Icon as={!!showDrawer ? PanelLeftClose : PanelLeftOpen} size="xl" color="white" />
                {/* <Text className="text-typography-100">Pick a country</Text> */}
            </Pressable>

            <VStack className="justify-center items-center margin-top-20">
                <HStack space="sm" className="gap-2">

                    <Text className="text-typography-600">{`Countries Found:`}</Text>
                    {/* <CreateCountBadge count={count ?? 0}
                        thresholds={{ grey: 0, blue: 50, yellow: 20, red: 1, green: 250 }} /> */}
                    <Badge size="sm" action={count > 100 ? "error" : count > 50 ? "warning" : "muted"}>
                        <BadgeText>{count}</BadgeText>
                    </Badge>
                </HStack >
                <Text className="text-typography-600">{`Selected Country: ${currentCountry?.name?.common ?? 'N/A'}`}</Text>
                <Drawer
                    isOpen={showDrawer}
                    onClose={() => {
                        setShowDrawer(false);
                    }}
                >
                    <DrawerBackdrop />
                    <DrawerContent className="w-[270px] md:w-[300px]">
                        <DrawerHeader className="justify-center flex-col gap-2">
                            <VStack className="justify-center items-center">
                                <Text size="lg">Choose your country</Text>
                                <Text size="sm" className="text-typography-600">
                                    Select a country from the list below
                                </Text>
                            </VStack>
                            {/* <Input>
                                <InputField
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search"
                                    value={textInput}
                                    onChange={(e) => {
                                        controllerRef.current = new AbortController();
                                        controllerRef.current.abort();
                                        console.log({ textInput: e.nativeEvent.text, textInputState: textInput });
                                        setTextInput(e.nativeEvent.text);
                                    }}
                                    onFocus={() => {
                                        console.log("Input is focused");
                                        !!!controllerRef.current ? controllerRef.current = new AbortController() : controllerRef.current.abort();
                                        controllerRef.current.abort()
                                    }
                                    }
                                    // onBlur={() => {
                                    //     console.log("Input is blurred");
                                    //     setUserActivity(false);
                                    // }}
                                    onBlur={(e: any) => {
                                        console.log("Input is blurred");
                                        if (textInput === "" || e.nativeEvent.text === "") {
                                            //clear selection
                                            setCurrentCountry(null);
                                            return;
                                        };

                                        findCountryByKey(countries, { keys: ['name', 'cca2', 'cca3'], searchValue: e.nativeEvent.text }, true).then(filteredCountries => {
                                            setCountries(filteredCountries as CountryFilters[]);
                                        });
                                    }}
                                    submitBehavior="blurAndSubmit"
                                // className="h-12 text-pink-500 placeholder:text-pink-500"
                                />
                                <InputSlot>
                                    <Button
                                        className="mr-2"
                                        variant="link"
                                        disabled={textInput === ""}
                                        onPress={() => {
                                            setTextInput("");
                                            setCurrentCountry(null);
                                            if (!!inputRef?.current) {
                                                inputRef.current?.focus();
                                            }
                                            controllerRef.current.abort();
                                        }}

                                    >
                                        <ButtonIcon as={CircleX} color={textInput === "" ? "grey" : "red"} />
                                    </Button>
                                </InputSlot>
                            </Input> */}
                            <HStack className="flex-direction-row gap-3">
                                <SaveButton ref={submitRef} />
                                <Button
                                    variant="link"
                                    action={!!!currentCountry ? "secondary" : "negative"}
                                    disabled={!!!currentCountry}
                                    onPress={() => {
                                        setTextInput("");
                                        setCurrentCountry(null);
                                    }}
                                >
                                    <ButtonText className={!!!currentCountry ? "text-typography-300" : "text-error-500"}>Clear</ButtonText>
                                </Button>
                                <ReverseButton />
                            </HStack>
                        </DrawerHeader>
                        <Divider className="my-4" />
                        <DrawerBody contentContainerClassName="gap-2">
                            {!!!countries ? (
                                <TouchableWithoutFeedback /* Disables clicks behind overlay */>
                                    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                                        <Center style={{ flex: 1 }}>
                                            <Box className="w-[80%] bg-background-100 p-5 rounded-md items-center">
                                                {/* XXL Spinner */}
                                                <Spinner size="large" className="my-3" />
                                                {/* Text Content */}
                                                <Heading size="3xl" className="mb-2">
                                                    Filtering Countries
                                                </Heading>
                                                <Text className="text-center text-muted">If this is a taking a while, there may be a large amount of countries to filter through</Text>

                                            </Box>
                                        </Center>
                                    </Animated.View>
                                </TouchableWithoutFeedback>
                            ) : (<CountryList
                                countries={countries}
                                currentCountry={currentCountry}
                                onSelect={(country) => {
                                    console.log('PRESSED', { country });
                                    handleCountryTap(country);
                                }}
                                reverse={reverseAlphabetical}
                            />)}
                        </DrawerBody>
                        <DrawerFooter

                        >
                            <SaveButton ref={submitRef} />
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>

            </VStack >
        </SafeAreaView >
    );


}
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
});