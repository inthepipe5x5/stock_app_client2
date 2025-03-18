import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated, TextInput, ViewStyle, TextStyle, KeyboardAvoidingView, Platform } from 'react-native';
import { CheckCircle2Icon, ChevronDownCircleIcon, ChevronUpCircleIcon, LucideIcon, Search, TextSearchIcon, XCircleIcon } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
// import countriesJson from "@/utils/rest_countries.json";
import { CountryFilters, countryResult, fetchCountries, findCountryByKey, loadLocalCountriesData } from '@/utils/countries';
import { useLocalSearchParams, SplashScreen, useRouter } from 'expo-router';
import ConfirmClose from '@/components/navigation/ConfirmClose';

import useDebounce from '@/hooks/useDebounce';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Center } from '@/components/ui/center';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { VStack } from '@/components/ui/vstack';
import { Button } from '@/components/ui/button';
import { Box } from '@/components/ui/box';
import { Icon as GluestackIcon } from "@/components/ui/icon";
import { Input, InputField } from '@/components/ui/input';
// import countries from "@/utils/rest_countries.json";

export interface CountryCodeProps {
    /**
    * Selected Country Dial Code
    */
    selected: {
        name: string;
        cca3: string;
    } | null | undefined,
    /**
   * Function to set the country
   */
    setSelected: React.Dispatch<React.SetStateAction<{
        name: string;
        cca3: string;
    } | null | undefined>>,
    /**
  * Function to set the country state variable for the selected country (ie. for a form value or sign up)
  */
    // setCountryDetails?: React.Dispatch<React.SetStateAction<any>>,
    /**
   * State variable for storing the phone number
   */
    phone?: string,
    /**
   * Function to set the phone number state variable
   */
    setPhone?: React.Dispatch<React.SetStateAction<any>>,
    /**
   * Style the Country Code Container 
   */
    countryCodeContainerStyles?: ViewStyle,
    /**
   * Style the text inside Country Code 
   */
    countryCodeTextStyles?: TextStyle,
    /**
   * Phone Text Input Styles
   */
    phoneStyles?: ViewStyle,
    /**
    * URL or LucideIcon f for the search Icon
    */
    // searchIcon?: string | LucideIcon,
    /**
    * URL or LucideIcon for the close Icon
    */
    // closeIcon?: string | LucideIcon,
    /**
    * Search Input Container Styles
    */
    searchStyles?: ViewStyle,
    /**
    * Search Input Text Styles
    */
    searchTextStyles?: TextStyle,
    /**
    /**
   * Search Dropdown Container Styles
   */
    dropdownStyles?: ViewStyle,
    /**
   * Search Dropdown Text Styles
   */
    dropdownTextStyles?: TextStyle,
    /**
    * List of countries
    */
    countries: CountryFilters[] | [] | Promise<countryResult[] | []>
}
const DropdownToggler = ({ openDropdown, slideDown, slideUp, selected, handleSearchInput, formMethods, debounceController }: any) => {
    console.log("DropdownToggler:", Object.keys(formMethods));
    return (
        !openDropdown ? (
            <Box className="w-full">
                <Button className="flex-row w-11/12" onPress={slideDown}>
                    <Box className="flex-row items-center justify-between w-11/12 p-2 border border-gray-300 rounded bg-white">
                        <Text className={`mr-2 ${selected?.name ? 'text-green-600' : 'text-black'}`}>
                            {selected?.name ? (
                                <Text className="text-lg italic">{selected.name}</Text>
                            ) : (
                                <Text className="text-xl">Search countries</Text>
                            )}
                        </Text>
                        <GluestackIcon
                            as={selected ? CheckCircle2Icon : ChevronDownCircleIcon}
                            size="xl"
                            className="pl-3"
                            color={selected ? "#489766" : "#000"}
                        />
                    </Box>
                </Button>
            </Box>
        ) : (
            <Box className="w-full p-2 border border-gray-300 rounded bg-white">
                <Box className="flex-row items-center w-11/12">
                    <GluestackIcon as={Search} size="sm" className="ml-2" />
                    <Controller
                        control={formMethods.control}
                        name="search"
                        defaultValue={"Canada"}
                        render={() => {
                            return (<Input
                                className="flex-1 ml-1 py-1">

                                <InputField
                                    type="text"
                                    onChange={(e) => handleSearchInput(e)}
                                    onChangeText={(text: string) => handleSearchInput(text)}
                                    // onSubmitEditing={(e) => {
                                    //     setOnBlur(true);
                                    //     handleSearchInput(e);
                                    // }}
                                    onFocus={() => {
                                        //cancel any pending search requests
                                        if (!!debounceController.current) {
                                            debounceController.current.abort();
                                        }
                                    }}
                                    // onBlur={(e) => handleSearchInput(e)}
                                    value={selected?.name ?? ""}
                                    placeholder="Search Country 🌎"
                                /></Input>)
                        }}

                    >
                    </Controller>
                </Box>
                <Button onPress={slideUp} className="mx-2">
                    <GluestackIcon as={ChevronUpCircleIcon} size="sm" className="ml-2" />
                </Button>
            </Box >
        )
    );
};

export const CountryDropDown: React.FC<CountryCodeProps> = ({
    selected = { name: '', cca3: '' },
    setSelected,
    countries,
    // setCountryDetails = () => { },
    // phone,
    // setPhone,
    // searchIcon,
    // closeIcon,
    countryCodeContainerStyles = {},
    countryCodeTextStyles = {},
    phoneStyles = {},
    searchStyles = {},
    searchTextStyles = {},
    dropdownStyles = {},
    dropdownTextStyles = {},
}) => {

    // const [selected, _setSelected] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<boolean>(false);
    const [_search, _setSearch] = useState<string>('');
    const [_searchResults, _setSearchResults] = useState<countryResult[]>([]);
    // const [countries, setCountries] = useState<Array<any>>([]);
    const [onBlur, setOnBlur] = useState<boolean>(false);
    const debouncedSearch = useDebounce(_search, 3000); // 3s delay
    const slideAnim = useRef(new Animated.Value(0)).current;

    // useEffect(() => {
    //     if (countryData.isFetched && Array.isArray(countryData.data)) {
    //         console.log("Fetched countries:", countryData.data.length);
    //         setCountries(countryData.data);
    //     } else {
    //         console.log("Countries not fetched yet. Fallback to local data.");
    //         fallBackCountries().then(countries => setCountries(countries ?? []));
    //     }
    // }, [countryData.isFetched, countryData.data]);

    //debounce search effect
    useEffect(() => {
        if (!!!debouncedSearch || debouncedSearch === _search) return;

        (async () => {
            if (!!!countries) return;
            const resolvedCountries = await Promise.resolve(countries);
            const filtered = !!resolvedCountries ? findCountryByKey(resolvedCountries, {
                keys: ["name", "cca2", "cca2", "continents", "region", "subregion", "languages", "translations", "altSpellings", "area"],
                searchValue: debouncedSearch
            }, true, 10) ?? [] : await loadLocalCountriesData();

            console.log("Filtered results:", Array.isArray(filtered) ? filtered.length : 0);
            _setSearchResults(filtered as countryResult[]);
        })();

        setOnBlur(false);
    }, [onBlur, debouncedSearch]);


    // const countries = useMemo(() => {

    //     if (countryData.isFetched && Array.isArray(countryData.data)) {
    //         return countryData.data;
    //     }
    //     console.log("Countries:", countryData?.data?.length ?? 0);
    //     return countryData.data ?? [];
    // }, [countryData.data]);



    const _searchCountry = async (countrySearchText: string, countries: any[]) => {
        if (!countries || countries.length === 0) {
            console.log("Searching for:", countrySearchText, "in", 0, "countries but it's not ready yet");
            return;
        }

        if (!countrySearchText || countrySearchText === "") {
            if (countries.length === 0) {
                console.log("No countries found. Fallback to local data.");
                const countries = await loadLocalCountriesData() ?? [];
                setCountries(countries);
            } //do nothing if countries are already loaded
            return
        }
        console.log("Searching for:", countrySearchText, "in", countries.length, "countries");

        if (!Array.isArray(countries)) return await fallBackCountries();

        const filtered = findCountryByKey(countries, {
            keys: ["name", "cca3"],
            searchValue: countrySearchText
        }, true, 10) ?? await fallBackCountries();

        setCountries(filtered as any);
    };

    // Update the search query immediately
    const handleSearchInput = (e: any) => {
        const text = e?.nativeEvent?.text ?? _search;
        //do nothing if the search text is empty or the same as the current search
        if (!text || text === "") {
            return
        }
        //update the search text
        _setSearch(useDebounce(text, 3000));
    };



    const slideDown = () => {
        setOpenDropdown(true);
        Animated.timing(slideAnim, {
            toValue: 235,
            duration: 1200,
            useNativeDriver: false
        }).start();
    };

    const slideUp = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false
        }).start(() => setOpenDropdown(false));
    };


    // const RenderBtn = () => {
    //     if (!openDropdown) {
    //         return (
    //             <View style={[styles.inputBoxContainer, { width: '100%' }]}>
    //                 <TouchableOpacity style={{ flexDirection: 'row', width: '90%' }} onPress={() => {
    //                     slideDown()
    //                 }}>
    //                     <View style={[styles.selectedContainer, countryCodeContainerStyles, { width: '90%' }]} className='w-[90%]'>
    //                         {/* <Text style={{ color: '#000', marginRight: 5 }}>{_getFlagText({ key: "name", value: selected })}</Text> */}
    //                         <Text style={{ color: !!selected?.name ? '489766' : '#000', marginRight: 5 }}>
    //                             {!!selected && selected.name !== "" ? (<Text style={{ fontSize: 18, fontStyle: "italic" }}>{!!selected.name ? selected.name : null}</Text>) : ( //tslint:disable-line
    //                                 <Text style={{ fontSize: 20 }}>Search countries </Text>
    //                             )}
    //                         </Text>
    //                         {!!selected ?
    //                             (<Icon as={!!selected ? CheckCircle2Icon : ChevronDownCircleIcon} size="xl" className="pl-3" color="#489766" />) :
    //                             <Icon as={TextSearchIcon} size="xl" className="pl-3" color="#000" />}
    //                     </View>
    //                 </TouchableOpacity>
    //             </View>
    //         )
    //     } else {
    //         return (
    //             <View style={[styles.inputBoxContainer, searchStyles]}>
    //                 <View style={[styles.row, { width: '90%' }]}>
    //                     <View className="w-[15px] h-[15px] ml-[10px]">
    //                         <Search size={16} />
    //                     </View>

    //                     <TextInput
    //                         style={[{ marginLeft: 1, paddingVertical: 3, flex: 1 }, searchTextStyles]}
    //                         onChangeText={(text) => _setSearch(text)}
    //                         onSubmitEditing={(e) => {
    //                             setOnBlur(true);
    //                             handleSearchInput(e);
    //                         }}
    //                         selectTextOnFocus={true}
    //                         onBlur={(e) => handleSearchInput(e)}
    //                         value={_search}
    //                         placeholder="Search Country 🌎"
    //                     />
    //                 </View>
    //                 <TouchableOpacity onPress={() => {

    //                     slideUp()

    //                 }} style={{ marginHorizontal: 10 }}>
    //                     <View className="w-[15px] h-[15px] ml-[10px] justify-center">
    //                         <ChevronUpCircleIcon size={24} />
    //                     </View>
    //                 </TouchableOpacity>
    //             </View>
    //         )
    //     }
    // }



    const renderCountryItem = ({ item }: { item: countryResult }) => {
        // console.log("Country Item:", item?.name?.common ?? "unknown country", item?.flag ?? "unknown flag");
        const onCountrySelect = (item?: Partial<countryResult> | null | undefined) => {
            if (!!item && "cca3" in item && !!item.name) {
                setSelected({ cca3: item.cca3, name: item.name.common });
                // setCountryDetails(item.cca3);
                slideUp();
            }
        }
        return (
            <TouchableOpacity style={styles.countryContainer} key={item.cca3} onPress={() => onCountrySelect(item)}>
                {!!item?.flags?.png && item?.flags?.png !== "" ? <Image source={item?.flags?.png} size="xs" alt={item?.flag ?? `${item?.name?.common ?? "country"} flag`} /> : <Text style={styles.countryFlag}>{item?.flag}</Text>}
                <Text style={[styles.countryText, dropdownTextStyles]} >
                    {/* {!!item?.flag && typeof item?.flag === "string" ? item.flag : "🌎"} */}
                    {item?.name.common ?? "Country Name"}
                </Text>
            </TouchableOpacity>
        )
    }


    return (
        <View style={styles.container}>
            {<DropdownToggler {...{ openDropdown, setOpenDropdown, slideDown, slideAnim, slideUp, selected, handleSearchInput }} />}

            {
                // (selected && !!_countries)
                //     ?
                <Animated.View
                    style={{ maxHeight: slideAnim }}
                >
                    <FlatList
                        data={Array.isArray(countries) ? countries : []}
                        style={[styles.valuesContainer, dropdownStyles]}
                        showsVerticalScrollIndicator={false}
                        renderItem={renderCountryItem}
                        keyExtractor={(item) => item.cca3}
                        ListEmptyComponent={<Text style={{ padding: 15, textAlign: 'center' }}>No Results Found</Text>}
                    />
                </Animated.View>
                // :
                // <></>
            }

        </View>
    )
}
export type SearchableCountryPickerProps = {
    showConfirmClose?: boolean,
    formMethods: any,
    debounceController?: { current: AbortController } | null | undefined,
    selected: { name: string, cca3: string },
    setSelected: React.Dispatch<React.SetStateAction<{ name: string, cca3: string }>>,
    countries: CountryFilters[] | Promise<countryResult[] | []>,
    countryCodeContainerStyles?: ViewStyle,
    countryCodeTextStyles?: TextStyle,
    phoneStyles?: ViewStyle,
    searchStyles?: ViewStyle,
    searchTextStyles?: TextStyle,
    dropdownStyles?: ViewStyle,
    dropdownTextStyles?: TextStyle
};

const SearchableCountryPicker = (props: SearchableCountryPickerProps) => {
    // const params = useLocalSearchParams();
    // const [showConfirmClose, setConfirmClose] = useState<boolean>(props.showConfirmClose ?? Boolean(params.showConfirmClose[0]) ?? false);
    const [selectedCountry, setSelectedCountry] = useState<{
        name: string;
        cca3: string;
    }>({ cca3: "CAN", name: "Canada" });
    const router = useRouter();
    // const debounceController = useRef(props?.debounceController ?? new AbortController());

    // let countries = [] as countryResult[] | Promise<countryResult[] | []> | [];

    useEffect(() => {
        console.log("SearchableCountryPicker mounted");
        SplashScreen.preventAutoHideAsync();
    }, []);

    // const formMethods = !!props.formMethods ? props.formMethods : useForm({
    //     defaultValues: {
    //         search: ""
    //     },
    //     delayError: 1000,
    //     mode: "onBlur",
    // })

    // const handleBackPress = () => {
    //     setConfirmClose(true);
    //     return true;
    // };

    const fallBackCountries = async () => {
        console.log("No countries found. Fallback to local data.");
        return await loadLocalCountriesData() ?? [];
    }



    // useEffect(() => {

    //     const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    //     const unsubscribe = router.addListener('beforeRemove', (e) => {
    //         e.preventDefault();
    //         setConfirmClose(true);
    //     });

    //     return () => {
    //         backHandler.remove();
    //         unsubscribe();
    //     };
    // }, [router]);


    return (
        <SafeAreaView className="flex-1 min-w-9 scroll-px-10">
            <Center>
                <VStack>
                    <Text>AppRoot</Text>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                        {/* <ConfirmClose visible={Boolean(showConfirmClose)} setDisplayAlertFn={setConfirmClose} dismissToURL={"(auth)/(signup)"} /> */}
                        {/* <CountryDropDown selected={selectedCountry} setSelected={setSelectedCountry} countries={countries} /> */}
                        {
                            !!props?.countries ?
                                (<CountryDropDown {...{
                                    selected: selectedCountry,
                                    setSelected: setSelectedCountry as React.Dispatch<React.SetStateAction<{ name: string; cca3: string; } | null | undefined>>,
                                    countries: props?.countries ?? [],
                                    // debounceController,
                                    formMethods: props.formMethods,
                                }} />)
                                : (
                                    <HStack>
                                        <Text>Loading Countries.</Text>
                                        <Spinner />
                                    </HStack>)
                        }
                    </KeyboardAvoidingView>
                </VStack>
            </Center>
        </SafeAreaView>
    )
};
export default SearchableCountryPicker;

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    container: {
        width: '100%',
    },
    selectedContainer: {
        padding: 5,
        flexDirection: 'row',
        minWidth: '20%',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#dddddd',
        borderRadius: 8,
        backgroundColor: 'white'
    },
    valuesContainer: {
        borderWidth: 1,
        borderColor: '#dddddd',
        borderRadius: 8,
        maxHeight: 235,
        backgroundColor: 'white',
        marginTop: 8
    },
    countryContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderColor: '#dedede',
        alignItems: 'center'
    },
    countryFlag: {
        marginRight: 8,
        color: 'black'
    },
    countryText: {
        fontWeight: 'bold',
        paddingLeft: 10,
    },
    inputBoxContainer: {
        height: 40,
        width: '90%',
        borderWidth: 1,
        borderColor: '#dddddd',
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    icon: {
        width: 10,
        height: 10
    }
});