import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated, TextInput, ViewStyle, TextStyle } from 'react-native';
import { LucideIcon, Search, XCircleIcon } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import * as countries from "@/utils/rest_countries.json"
import { CountryFilters, countryResult, findCountryByKey } from '@/utils/countries';

export interface CountryCodeProps {
    /**
    * Selected Country Dial Code
    */
    selected: string,
    /**
   * Function to set the country
   */
    setSelected: React.Dispatch<React.SetStateAction<any>>,
    /**
  * Function to set the country
  */
    setCountryDetails?: React.Dispatch<React.SetStateAction<any>>,
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
    searchIcon?: string | LucideIcon,
    /**
    * URL or LucideIcon for the close Icon
    */
    closeIcon?: string | LucideIcon,
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
    dropdownTextStyles?: TextStyle

}


const CountryCodeDropdownPicker: React.FC<CountryCodeProps> = ({
    selected,
    setSelected,
    setCountryDetails = () => { },
    phone,
    setPhone,
    countryCodeContainerStyles = {},
    countryCodeTextStyles = {},
    phoneStyles = {},
    searchIcon,
    closeIcon,
    searchStyles = {},
    searchTextStyles = {},
    dropdownStyles = {},
    dropdownTextStyles = {},
}) => {

    const [_selected, _setSelected] = useState(false);
    const [_search, _setSearch] = useState('');
    const [_countries, _setCountries] = useState(countries);

    const slideAnim = useRef(new Animated.Value(0)).current;


    const _static = (key: "search" | "close") => {
        const keyIcon = key === "search" ? searchIcon : closeIcon;
        const defaultStatic = key === "search" ? <Search size="sm" /> : <XCircleIcon size="sm" />;
        let uri = ""
        if (!keyIcon) {
            return defaultStatic
        }
        //handle if icon is a string
        else if (typeof keyIcon === "string") {
            //    return key === "search" ? <Image source={{ uri: searchIcon }} size="sm" /> : defaultStatic
            uri = key === "search" ? (typeof searchIcon === "string" ? searchIcon : "") : (typeof closeIcon === "string" ? closeIcon : "");
            return <Image source={{ uri }} size="sm" />
        }
        //handle if icon is a react component
        else if (typeof keyIcon === 'function' || React.isValidElement(keyIcon)) {
            return keyIcon as React.ReactNode;
        }
        //fall back
        else {
            return defaultStatic
        }
    }

    const _getFlagSVG = (filter: { key: keyof CountryFilters, value: any }) => {
        const [key, value] = Object.entries(filter)[0];
        const foundCountry = findCountryByKey(countries, { key, value });
        return foundCountry?.flags?.svg ?? foundCountry?.flags?.png ?? foundCountry?.flags?.alt ?? foundCountry?.flags?.svg ?? (<Text>
            {foundCountry?.flag ?? "🏳️"}</Text>)
    }

    const _getFlagText = (filter: { key: keyof CountryFilters, value: any }) => {
        const [key, value] = Object.entries(filter)[0];
        const foundCountry = findCountryByKey(countries, { key, value });
        return foundCountry?.flag ?? "🏳️";
    }

    const slideDown = () => {
        _setSelected(true);
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
        }).start(() => _setSelected(false));
    };

    function _searchCountry(countrySearchText: string) {
        _setSearch(countrySearchText);
        const filtered = findCountryByKey(_countries, { key: "name", value: countrySearchText });
        _setCountries(filtered);
    }


    const RenderBtn = () => {
        if (!_selected) {
            return (
                <View style={[styles.row]}>
                    <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => {
                        console.log("Countries:", countries);
                        _setCountries(countries);
                        slideDown()
                    }}>
                        <View style={[styles.selectedContainer, countryCodeContainerStyles]}>
                            <Text style={{ color: '#000', marginRight: 5 }}>{_getFlagText({ key: "name", value: selected })}</Text>
                            <Text style={[countryCodeTextStyles]}>{selected}</Text>
                        </View>
                    </TouchableOpacity>
                    {/* {
                        (phone != undefined && setPhone != undefined)
                            ?
                            <TextInput
                                style={[{ marginLeft: 5, paddingVertical: 5, paddingLeft: 15, flex: 1, borderWidth: 1, borderRadius: 8, borderColor: "#dddddd" }, phoneStyles]}
                                placeholder={"Enter Mobile Number"}
                                keyboardType={'phone-pad'}
                                placeholderTextColor={'#dddddd'}
                                onChangeText={setPhone}
                                value={phone}
                            />
                            :
                            <></>
                    } */}
                </View>
            )
        } else {
            return (
                <View style={[styles.inputBoxContainer, searchStyles]}>
                    <View style={[styles.row, { width: '90%' }]}>
                        <View className="w-[15px] h-[15px] ml-[10px]">
                            {_static("search")}
                        </View>

                        <TextInput
                            style={[{ marginLeft: 5, paddingVertical: 3, flex: 1 }, searchTextStyles]}
                            onChangeText={_searchCountry}
                            value={_search}
                        />
                    </View>
                    <TouchableOpacity onPress={() => slideUp()} style={{ marginHorizontal: 10 }}>
                        <View className="w-[15px] h-[15px] ml-[10px]">
                            {_static("close")}
                        </View>
                    </TouchableOpacity>
                </View>
            )
        }
    }

    const renderCountryItem = ({ item }: { item: countryResult }) => {
        return (
            <TouchableOpacity style={styles.countryContainer} key={item.cca3} onPress={() => { setSelected(item.cca3); setCountryDetails(item.cca3); slideUp(); }}>
                {item?.flags?.png !== null ? <Image source={item?.flags?.png} size="xs" /> : <Text style={styles.countryFlag}>{item?.flag}</Text>}
                <Text style={[styles.countryText, dropdownTextStyles]} >{item?.name.common ?? "Country Name"}</Text>
            </TouchableOpacity>
        )
    }


    return (
        <View style={styles.container}>
            {RenderBtn()}

            {
                (_selected)
                    ?
                    <Animated.View
                        style={{ maxHeight: slideAnim }}
                    >
                        <FlatList
                            data={_countries ?? []}
                            style={[styles.valuesContainer, dropdownStyles]}
                            showsVerticalScrollIndicator={false}
                            renderItem={renderCountryItem}
                            keyExtractor={(item) => item.cca3}
                            ListEmptyComponent={<Text style={{ padding: 15, textAlign: 'center' }}>No Result Found</Text>}
                        />
                    </Animated.View>
                    :
                    <></>
            }

        </View>
    )
}


export default CountryCodeDropdownPicker;

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    container: {
        width: '100%',
    },
    selectedContainer: {
        padding: 10,
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
        fontWeight: 'bold'
    },
    inputBoxContainer: {
        width: '100%',
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