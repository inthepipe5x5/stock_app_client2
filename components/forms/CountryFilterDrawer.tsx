import React, { useMemo } from "react";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Checkbox, CheckboxIndicator, CheckboxLabel, CheckboxIcon, CheckboxGroup } from "@/components/ui/checkbox";
import { Divider } from "@/components/ui/divider";
import { Drawer, DrawerBackdrop, DrawerContent, DrawerHeader, DrawerBody } from "@/components/ui/drawer";
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

export default function CountryFilterDrawer(props: any) {
    const [showDrawer, setShowDrawer] = useState(props.showDrawer ?? false);
    const [lockDrawer, setLockDrawer] = useState(props.lockDrawer ?? false);
    const [loading, setLoading] = useState(props.loading ?? true);

    // Ensure props.countries is always an array
    const processedData = processCountryData(Array.isArray(props.countries) ? props.countries : []);
    const defaultFilterValues = returnDefaultFilterValues(processedData);

    const [independentFilter, setIndependentFilter] = useState(true);
    const [selectedRegions, setSelectedRegions] = useState(defaultFilterValues.selectedRegions);
    const [selectedSubregions, setSelectedSubregions] = useState(defaultFilterValues.selectedSubregions);
    const [maxResults, setMaxResults] = useState(defaultFilterValues.maxResults);

    const toggleDrawerOpen = () => {
        setShowDrawer(!showDrawer);
    };

    const handleMaxResultsChange = (value: number) => {
        if (value < 1) return;
        setMaxResults(value > 256 ? 256 : value);
    };

    const handleClearAll = () => {
        setSelectedRegions([]);//(defaultFilterValues.selectedRegions);
        setSelectedSubregions([]);//(defaultFilterValues.selectedSubregions);
        setIndependentFilter(true);//(true);
        setMaxResults(255);//(256);255;
    };

    return (
        <>
            {/* Drawer Toggle Buttons */}
            <HStack className="fixed bottom-4 right-4 z-50">
                <Button onPress={toggleDrawerOpen} action={showDrawer ? "primary" : "secondary"} className="fixed bottom-4 right-4 z-50">
                    <ButtonIcon as={showDrawer ? SidebarCloseIcon : SidebarOpenIcon} />
                </Button>
                <Button
                    variant="outline"
                    className="fixed bottom-4 left-4 z-50"
                    onPress={() => setLockDrawer(!lockDrawer)}
                >
                    <ButtonIcon as={lockDrawer ? LockIcon : UnlockIcon} />
                </Button>
            </HStack>

            {/* Drawer UI */}
            <Drawer
                isOpen={showDrawer}
                onClose={() => {
                    setShowDrawer(false);
                    if (props?.onClose) props.onClose();
                    handleClearAll();
                }}
            >
                <DrawerBackdrop />
                <DrawerContent className="px-4 py-3 w-[270px] md:w-[300px]">
                    <DrawerHeader>
                        <Heading size="md">COUNTRY FILTERS</Heading>
                        <Button variant="link" size="xs" onPress={handleClearAll}>
                            <ButtonText>Clear All</ButtonText>
                        </Button>
                    </DrawerHeader>

                    <DrawerBody className="gap-4 mt-0 mb-0">
                        {processedData && typeof processedData === "object" ? (
                            ["region", "subregion"].map((filterKey) => (
                                <FilterSection
                                    key={filterKey}
                                    filterKey={filterKey as keyof CountryFilters}
                                    processdDataObj={processedData[filterKey as keyof typeof processedData]}
                                    selectedFilterState={filterKey === "region" ? selectedRegions : selectedSubregions}
                                    setSelectedFilterStateFn={filterKey === "region" ? setSelectedRegions : setSelectedSubregions}
                                />
                            ))
                        ) : (
                            <Spinner size="large" />
                        )}

                        {/* Independent Filter */}
                        <VStack className="pl-2 py-3">
                            <Text className="font-semibold">Independent</Text>
                            <Divider className="my-1" />
                            <CheckboxGroup value={[independentFilter ? "true" : "false"]} onChange={(keys) => setIndependentFilter(keys.includes("true"))}>
                                <VStack className="gap-3 mt-3 ml-1">
                                    <HStack className="items-center gap-1">
                                        <Checkbox value="true" size="sm">
                                            <CheckboxIndicator>
                                                <CheckboxIcon as={CheckIcon} />
                                            </CheckboxIndicator>
                                            <CheckboxLabel>True</CheckboxLabel>
                                        </Checkbox>
                                    </HStack>
                                    <HStack className="items-center gap-1">
                                        <Checkbox value="false" size="sm">
                                            <CheckboxIndicator>
                                                <CheckboxIcon as={CheckIcon} />
                                            </CheckboxIndicator>
                                            <CheckboxLabel>False</CheckboxLabel>
                                        </Checkbox>
                                    </HStack>
                                </VStack>
                            </CheckboxGroup>
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
}
