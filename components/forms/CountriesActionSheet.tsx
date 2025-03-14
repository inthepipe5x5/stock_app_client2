import React, { useState, useEffect } from "react";
import { Platform, Keyboard } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Actionsheet,
    ActionsheetVirtualizedList,
    ActionsheetContent,
    ActionsheetBackdrop,
    ActionsheetDragIndicatorWrapper,
    ActionsheetDragIndicator,
    ActionsheetItem,
    ActionsheetItemText,
    ActionsheetIcon,
} from "@/components/ui/actionsheet";
import { HStack } from "@/components/ui/hstack";
import {
    FormControl,
    FormControlLabel,
    FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { KeyboardAvoidingView } from "@/components/ui/keyboard-avoiding-view";
import { SearchCode } from "lucide-react-native";
import useDebounce from "@/hooks/useDebounce";
import { countryResult, findCountryByKey } from "@/utils/countries";

const CountriesActionSheet = ({ countries, isLoading, methods, showActionSheet, setShowActionSheet, filters }: any) => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filteredCountries, setFilteredCountries] = useState<countryResult[]>(countries ?? []
    );
    // UseForm for controlled inputs
    const searchMethods = useForm({
        resolver: zodResolver(methods.schema),
        defaultValues: { searchQuery: "" },
    });

    // Debounced Search
    const debouncedSearch = useDebounce(searchQuery, 1000);

    const filterCountriesFn = () => {
        if (!countries?.data) return;
        const filtered = findCountryByKey(countries, { key: "name", value: debouncedSearch }, true);
        setFilteredCountries(filtered ?? countries ?? []);
    }

    // Ensure we reset the search when closing
    useEffect(() => {
        if (!showActionSheet) {
            setSearchQuery("");
            setFilteredCountries(countries?.data ?? []);
        }
    }, [showActionSheet]);

    const renderCountryItem = (item: countryResult) => {
        return (
            <ActionsheetItem
                key={item.name.common}
                onPress={() => {
                    console.log("Country Selected:", item.name.common);
                    //set country value in field
                    methods.setValues({ country: item.name.common });

                    // setSearchQuery(item.name.common);
                    //close the actionsheet
                    showActionSheet(false);
                    // Reset the search query and filtered countries
                    setFilteredCountries([]);
                }}
            >
                <HStack className="w-md-8 items-center">
                    <ActionsheetItemText>{item.name.common} {item.flag}</ActionsheetItemText>
                </HStack>
            </ActionsheetItem>
        )
    }

    return (
        <Actionsheet
            isOpen={showActionSheet && !isLoading}
            onClose={() => setShowActionSheet(false)}
            snapPoints={[80]}
            trapFocus={Platform.OS !== 'web' ? true : false}
            isKeyboardDismissable={Platform.OS === 'web' ? true : false}
            preventScroll={Platform.OS !== 'web' ? true : false}
            onOpen={() => {
                console.log("Actionsheet Opened!");
                //dismiss keyboard
                Keyboard.dismiss();
            }}
        >
            <KeyboardAvoidingView
                style={{
                    position: "relative",
                    flex: 1,
                    // justifyContent: "flex-end",
                }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ActionsheetBackdrop />
                <ActionsheetContent>
                    {/* Search Field */}
                    <Controller
                        control={searchMethods.control}
                        name="searchQuery"
                        render={({ field: { onChange, value } }) => (
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText>Search for a country 🌎</FormControlLabelText>
                                </FormControlLabel>
                                <Input className="w-full mb-4">
                                    <InputSlot>
                                        <InputIcon as={SearchCode} className="ml-2" />
                                    </InputSlot>
                                    <InputField
                                        placeholder="Type country name"
                                        value={value}
                                        onChangeText={(text) => {
                                            setSearchQuery(text);
                                            onChange(text);
                                        }}
                                    />
                                </Input>
                            </FormControl>
                        )}
                    />

                    {/* Draggable Indicator */}
                    <ActionsheetDragIndicatorWrapper>
                        <ActionsheetDragIndicator />
                    </ActionsheetDragIndicatorWrapper>

                    {/* List of Filtered Countries */}
                    <ActionsheetVirtualizedList
                        data={searchQuery ? methods.filteredCountries : countries?.data ?? []}
                        initialNumToRender={10}
                        keyExtractor={(item) => (item as countryResult)?.name?.common}
                        renderItem={({ item }) => renderCountryItem(item as countryResult)}
                        getItem={(data, index) => data[index]}
                        getItemCount={(data) => {
                            console.log("Countries Found:", data.length);
                            return data.length;
                        }}
                        onEndReachedThreshold={0.5}
                    />
                </ActionsheetContent>
            </KeyboardAvoidingView>
        </Actionsheet>
    );
};

export default CountriesActionSheet;
