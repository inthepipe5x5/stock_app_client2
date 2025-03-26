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

// // const baseRegionData = {
// //     "Americas": ["North America", "South America", "Central America", "Caribbean"],
// //     "Asia": ["Central & South Asia", "Northeastern Asia", "Southeastern Asia", "Australia and Oceania"],
// //     "Europe": ["Northern Europe", "Southern Europe", "Eastern Europe", "Western Europe"],
// //     "Africa": ["Northern Africa", "Southern Africa"],
// //     "Oceania": ["Polynesia", "Micronesia", "Melanesia"]
// }
const processCountryData = (data: countryResult[] | undefined) => {
    if (!Array.isArray(data) || data.length === 0) return {
        independent: { true: 195, false: 49 },
        region: {
            Africa: 59,
            Americas: 55,
            Asia: 49,
            Europe: 51,
            Oceania: 25,
            Antarctic: 5,
        },
        subregion: {
            "Northern Africa": 7,
            "Western Africa": 17,
            "Middle Africa": 9,
            "Eastern Africa": 20,
            "Southern Africa": 6,
            "Northern America": 5,
            "Caribbean": 28,
            "Central America": 8,
            "South America": 14,
            "Central Asia": 5,
            "Eastern Asia": 7,
            "Southern Asia": 9,
            "South-Eastern Asia": 11,
            "Western Asia": 17,
            "Northern Europe": 15,
            "Western Europe": 9,
            "Southern Europe": 16,
            "Eastern Europe": 11,
            "Australia and New Zealand": 5,
            "Melanesia": 5,
            "Micronesia": 7,
            "Polynesia": 8,
        },
    };

    console.log("Processing country data...", data.length);

    const result: {
        independent: { true: number; false: number };
        region: { [key: string]: number };
        subregion: { [key: string]: number };
    } = {
        independent: { true: 0, false: 0 },
        region: {},
        subregion: {},
    };

    data.forEach((country) => {
        if (!country) return;

        result.independent[country.independent ? "true" : "false"] += 1;
        result.region[country.region] = (result.region[country.region] || 0) + 1;

        if (country.subregion) {
            result.subregion[country.subregion] = (result.subregion[country.subregion] || 0) + 1;
        }
    });

    return result;
};


const FilterSection = ({ filterKey, processdDataObj, selectedFilterState, setSelectedFilterStateFn }: {
    filterKey: keyof CountryFilters;
    processdDataObj: { [key: string]: number };
    selectedFilterState: string[];
    setSelectedFilterStateFn: (keys: string[]) => void;
}) => {
    return (
        <VStack className="pl-2 py-3">
            <Text className="font-semibold" size="sm">{pluralizeStr(capitalize(filterKey))}</Text>
            <Divider className="my-1" />
            <CheckboxGroup
                value={selectedFilterState}
                onChange={(keys) => {
                    setSelectedFilterStateFn(keys);
                }}
            >
                <VStack className="gap-3 mt-3 ml-1">
                    {Object.keys(processdDataObj).map((key) => (
                        <HStack key={key} className="items-center gap-1">
                            <Checkbox value={key} size="sm">
                                <CheckboxIndicator>
                                    <CheckboxIcon as={CheckIcon} />
                                </CheckboxIndicator>
                                <CheckboxLabel>{key}</CheckboxLabel>
                            </Checkbox>
                        </HStack>
                    ))}
                </VStack>
            </CheckboxGroup>
        </VStack>
    );
}
const returnDefaultFilterValues = (processedData: any) => {
    if (!processedData || typeof processedData !== "object") {
        return {
            selectedRegions: [],
            selectedSubregions: [],
            independent: { true: 195, false: 55 },
            maxResults: 256,
        };
    }

    return {
        selectedRegions: Object.keys(processedData.region ?? {}),
        selectedSubregions: Object.keys(processedData.subregion ?? {}),
        independent: processedData.independent ?? { true: 195, false: 55 },
        maxResults: 256,
    };
};


// export default function CountryFilterDrawer(props: any) {
//     const [showDrawer, setShowDrawer] = useState(props.showDrawer ?? false);
//     const [lockDrawer, setLockDrawer] = useState(props.lockDrawer ?? false);
//     const [loading, setLoading] = useState(props.loading ?? true);
//     // const allCountriesData = useMemo(() => calculateCountryData((baseCountryData ?? {})), [baseCountryData])

//     const processedData = processCountryData(props?.countries ?? {});
//     const defaultFilterValues = returnDefaultFilterValues(processedData);


//     const [independentFilter, setIndependentFilter] = useState(true);
//     const [selectedRegions, setSelectedRegions] = useState(defaultFilterValues.selectedRegions ?? []);
//     const [selectedSubregions, setSelectedSubregions] = useState(defaultFilterValues.selectedSubregions ?? []);
//     const [maxResults, setMaxResults] = useState(defaultFilterValues.maxResults ?? 256);

//     const toggleDrawerOpen = () => {
//         setShowDrawer(!showDrawer);
//     }

//     const handleMaxResultsChange = (value: number) => {
//         if (value < 1) return;
//         if (value > 256) return setMaxResults(256);
//         setMaxResults(value);
//     }

//     const handleClearAll = () => {
//         setSelectedRegions(defaultFilterValues.selectedRegions);
//         setSelectedSubregions(defaultFilterValues.selectedSubregions);
//         setIndependentFilter(true);
//         setMaxResults(256);
//     }
//     const setFiltersOnParent = () => {
//         if (props?.setFiltersFn) props.setFiltersFn({ selectedRegions, selectedSubregions, independentFilter, maxResults });

//     }

//     return (
//         <>
//             <HStack className="fixed bottom-4 right-4 z-50">
//                 <Button
//                     onPress={toggleDrawerOpen}
//                     action={showDrawer ? "primary" : "secondary"}
//                     className="fixed bottom-4 right-4 z-50"
//                 >
//                     <ButtonIcon as={showDrawer ? SidebarCloseIcon : SidebarOpenIcon} />
//                     {/* <ButtonText>Show Drawer</ButtonText> */}
//                 </Button>
//                 <Button
//                     variant="outline"
//                     className="fixed bottom-4 left-4 z-50"
//                     onPress={() => {
//                         setLockDrawer(true);
//                     }}
//                 >
//                     <ButtonIcon as={lockDrawer ? LockIcon : UnlockIcon} />
//                 </Button>
//             </HStack>
//             <Drawer
//                 isOpen={showDrawer}
//                 onClose={() => {
//                     setShowDrawer(false);
//                     if (props?.onClose) props.onClose();
//                     handleClearAll();
//                 }}
//             >
//                 <DrawerBackdrop />
//                 <DrawerContent className="px-4 py-3 w-[270px] md:w-[300px]">
//                     <DrawerHeader>
//                         <Heading size="md">COUNTRY FILTERS</Heading>
//                         <Button
//                             variant="link"
//                             size="xs"
//                             onPress={() => {
//                                 setLoading(true);

//                             }}
//                         >
//                             <ButtonText>Clear All</ButtonText>
//                         </Button>
//                     </DrawerHeader>
//                     <DrawerBody className="gap-4 mt-0 mb-0">

//                         {processedData && typeof processedData === 'object' ? (["region", "subregion"].map((filterKey) => (
//                             <FilterSection
//                                 key={filterKey}
//                                 filterKey={filterKey as keyof CountryFilters}
//                                 processdDataObj={processedData[filterKey as keyof typeof processedData]}
//                                 selectedFilterState={filterKey === "region" ? selectedRegions : selectedSubregions}
//                                 setSelectedFilterStateFn={filterKey === "region" ? setSelectedRegions : setSelectedSubregions}
//                             />))) : (<Spinner size="large" />)
//                         }
//                         <VStack className="pl-2 py-3">
//                             <Text className="font-semibold">Independent</Text>
//                             <Divider className="my-1" />
//                             <CheckboxGroup
//                                 value={[independentFilter ? 'true' : 'false']}
//                                 onChange={(keys) => {
//                                     setIndependentFilter(keys.includes('true'));
//                                 }}
//                             >
//                                 <VStack className="gap-3 mt-3 ml-1">
//                                     <HStack className="items-center gap-1">
//                                         <Checkbox value="true" size="sm" defaultIsChecked>
//                                             <CheckboxIndicator>
//                                                 <CheckboxIcon as={CheckIcon} />
//                                             </CheckboxIndicator>
//                                             <CheckboxLabel>True</CheckboxLabel>
//                                         </Checkbox>
//                                     </HStack>
//                                     <HStack className="items-center gap-1">
//                                         <Checkbox value="false" size="sm">
//                                             <CheckboxIndicator>
//                                                 <CheckboxIcon as={CheckIcon} />
//                                             </CheckboxIndicator>
//                                             <CheckboxLabel>False</CheckboxLabel>
//                                         </Checkbox>
//                                     </HStack>
//                                 </VStack>
//                             </CheckboxGroup>
//                         </VStack>


//                         {/* Max Results Slider */}
//                         <VStack className="pl-2 py-3">
//                             <Text className="font-semibold">Maximum Countries Shown</Text>
//                             <Divider className="my-1" />
//                             <VStack className="pt-6 pr-4 ml-1">
//                                 <Slider
//                                     defaultValue={maxResults}
//                                     onChangeEnd={(value) => handleMaxResultsChange(value)}
//                                     size="sm"
//                                     orientation="horizontal"
//                                     minValue={1}
//                                     maxValue={300}
//                                     isDisabled={lockDrawer || loading}
//                                 >
//                                     <SliderTrack>
//                                         <SliderFilledTrack />
//                                     </SliderTrack>
//                                     <SliderThumb />
//                                 </Slider>
//                             </VStack>
//                             <HStack className="justify-between pt-2">
//                                 <Text size="sm">1</Text>
//                                 <Text size="sm">300</Text>
//                             </HStack>
//                         </VStack>

//                     </DrawerBody>
//                 </DrawerContent>
//             </Drawer>
//         </>
//     );
// }

// export default function CountryFilterDrawer(props: {
//     showDrawer?: boolean;
//     lockDrawer?: boolean;
//     loading?: boolean;
//     countries: countryResult[];
//     onClose?: () => void;
//     setFiltersFn?: (filters: { selectedRegions: string[]; selectedSubregions: string[]; independentFilter: boolean; maxResults: number }) => void;
// }) {
//     const [showDrawer, setShowDrawer] = useState(props.showDrawer ?? false);
//     const [lockDrawer, setLockDrawer] = useState(props.lockDrawer ?? false);
//     const [loading, setLoading] = useState(props.loading ?? true);

//     // Ensure props.countries is always an array
//     const processedData = processCountryData(Array.isArray(props.countries) ? props.countries : []);
//     const defaultFilterValues = returnDefaultFilterValues(processedData);

//     const [independentFilter, setIndependentFilter] = useState(true);
//     const [selectedRegions, setSelectedRegions] = useState(defaultFilterValues.selectedRegions);
//     const [selectedSubregions, setSelectedSubregions] = useState(defaultFilterValues.selectedSubregions);
//     const [maxResults, setMaxResults] = useState(defaultFilterValues.maxResults);

//     const toggleDrawerOpen = () => {
//         setShowDrawer(!showDrawer);
//     };

//     const handleMaxResultsChange = (value: number) => {
//         if (value < 1) return;
//         setMaxResults(value > 256 ? 256 : value);
//     };

//     const handleClearAll = () => {
//         setSelectedRegions([]);//(defaultFilterValues.selectedRegions);
//         setSelectedSubregions([]);//(defaultFilterValues.selectedSubregions);
//         setIndependentFilter(true);//(true);
//         setMaxResults(255);//(256);255;
//     };

//     return (
//         <>
//             {/* Drawer Toggle Buttons */}
//             <HStack className="fixed bottom-4 right-4 z-50">
//                 <Button onPress={toggleDrawerOpen} action={showDrawer ? "primary" : "secondary"} className="fixed bottom-4 right-4 z-50">
//                     <ButtonIcon as={showDrawer ? SidebarCloseIcon : SidebarOpenIcon} />
//                 </Button>
//                 <Button
//                     variant="outline"
//                     className="fixed bottom-4 left-4 z-50"
//                     onPress={() => setLockDrawer(!lockDrawer)}
//                 >
//                     <ButtonIcon as={lockDrawer ? LockIcon : UnlockIcon} />
//                 </Button>
//             </HStack>

//             {/* Drawer UI */}
//             <Drawer
//                 isOpen={showDrawer}
//                 onClose={() => {
//                     setShowDrawer(false);
//                     if (props?.onClose) props.onClose();
//                     handleClearAll();
//                 }}
//             >
//                 <DrawerBackdrop />
//                 <DrawerContent className="px-4 py-3 w-[270px] md:w-[300px]">
//                     <DrawerHeader>
//                         <Heading size="md">COUNTRY FILTERS</Heading>
//                         <Button variant="link" size="xs" onPress={handleClearAll}>
//                             <ButtonText>Clear All</ButtonText>
//                         </Button>
//                     </DrawerHeader>

//                     <DrawerBody className="gap-4 mt-0 mb-0">
//                         {processedData && typeof processedData === "object" ? (
//                             ["region", "subregion"].map((filterKey) => (
//                                 <FilterSection
//                                     key={filterKey}
//                                     filterKey={filterKey as keyof CountryFilters}
//                                     processdDataObj={processedData[filterKey as keyof typeof processedData]}
//                                     selectedFilterState={filterKey === "region" ? selectedRegions : selectedSubregions}
//                                     setSelectedFilterStateFn={filterKey === "region" ? setSelectedRegions : setSelectedSubregions}
//                                 />
//                             ))
//                         ) : (
//                             <Spinner size="large" />
//                         )}

//                         {/* Independent Filter */}
//                         <VStack className="pl-2 py-3">
//                             <Text className="font-semibold">Independent</Text>
//                             <Divider className="my-1" />
//                             <CheckboxGroup value={[independentFilter ? "true" : "false"]} onChange={(keys) => setIndependentFilter(keys.includes("true"))}>
//                                 <VStack className="gap-3 mt-3 ml-1">
//                                     <HStack className="items-center gap-1">
//                                         <Checkbox value="true" size="sm">
//                                             <CheckboxIndicator>
//                                                 <CheckboxIcon as={CheckIcon} />
//                                             </CheckboxIndicator>
//                                             <CheckboxLabel>True</CheckboxLabel>
//                                         </Checkbox>
//                                     </HStack>
//                                     <HStack className="items-center gap-1">
//                                         <Checkbox value="false" size="sm">
//                                             <CheckboxIndicator>
//                                                 <CheckboxIcon as={CheckIcon} />
//                                             </CheckboxIndicator>
//                                             <CheckboxLabel>False</CheckboxLabel>
//                                         </Checkbox>
//                                     </HStack>
//                                 </VStack>
//                             </CheckboxGroup>
//                         </VStack>
//                     </DrawerBody>
//                 </DrawerContent>
//             </Drawer>
//         </>
//     );
// }



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