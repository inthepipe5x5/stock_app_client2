import { fetchCountries, CountryFilters, countryResult } from "@/utils/countries";
import React, { useEffect, useMemo } from 'react';
import { ScrollView, Text, View, StyleSheet, Pressable, Platform, Keyboard } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Icon, SearchIcon } from "@/components/ui/icon";
import Footer from "@/components/navigation/Footer";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { SkeletonText } from "@/components/ui/skeleton";
import { Heading } from "@/components/ui/heading";
import { Divider } from "@/components/ui/divider";
import LoadingOverlay from "@/components/navigation/TransitionOverlayModal";
import { useRouter } from "expo-router";
import { useState } from 'react';
import { ToastAndroid } from 'react-native';
import { useForm, Controller, Form } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText } from "@/components/ui/form-control";
import { KeyboardAvoidingView } from "@/components/ui/keyboard-avoiding-view"
import { Spinner } from "@/components/ui/spinner";
import {
    Select,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectIcon,
    SelectInput,
    SelectItem,
    SelectPortal,
    SelectTrigger,
    SelectVirtualizedList,
} from "@/components/ui/select";
import { locationSchema } from "@/lib/schemas/userSchemas";
import { renderCountryItem } from "@/components/forms/LocationForm";
import { useToast } from "@/components/ui/toast";
import { ChevronDown, SearchCode } from "lucide-react-native";
import useDebounce from "@/hooks/useDebounce";
import { SafeAreaView } from "react-native-safe-area-context";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { Actionsheet, ActionsheetVirtualizedList, ActionsheetContent, ActionsheetBackdrop, ActionsheetIcon, ActionsheetItem, ActionsheetItemText, ActionsheetDragIndicatorWrapper, ActionsheetDragIndicator } from "@/components/ui/actionsheet";
import {
    Drawer,
    DrawerBackdrop,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
} from "@/components/ui/drawer"
import {
    Checkbox,
    CheckboxIndicator,
    CheckboxLabel,
    CheckboxIcon,
    CheckboxGroup,
} from "@/components/ui/checkbox"
import { setStatusBarNetworkActivityIndicatorVisible } from "expo-status-bar";
import CountryFilterDrawer from "@/components/forms/CountryFilterDrawer";
import { isLoading } from "expo-font";

interface CountriesListProps {
    countryData: {
        isLoading: boolean;
        error: any;
        data: CountryFilters[] | null;
    };
    setAlertMessage: (message: string) => void;
    props?: any;
}

// const CountriesList: React.FC<CountriesListProps> = ({ countryData, setAlertMessage, ...props }) => {
//     const router = useRouter();


//     if (countryData.isLoading) {
//         return <LoadingOverlay visible={true} title="Loading Countries" />;
//         // return <Text>Loading...</Text>;
//     }

//     if (countryData.error) {
//         return <Text>Error loading countries data</Text>;
//     }

//     const groupedCountries = countryData.data?.reduce((acc: Record<string, CountryFilters[]>, country) => {
//         if (country.independent && country.unMember) {
//             if (!acc[country.region]) {
//                 acc[country.region] = [];
//             }
//             acc[country.region].push(country);
//         }
//         return acc;
//     }, {} as Record<string, CountryFilters[]>);

//     const countryPressedHandler = (e: any) => {

//         const message = `Country: ${e.target.value} Pressed!`;
//         const logFn = setAlertMessage ?? console.log
//         logFn(message)
//     }

//     return (
//         <ScrollView style={styles.container}>
//             <LoadingOverlay visible={countryData.isLoading} title={countryData.isLoading ? `Loading Countries` : "Something went wrong"} dismissToURL={() => router.push('/')} />

//             {groupedCountries ?
//                 Object.entries(groupedCountries).map(([region, countries]) => {
//                     return (
//                         <View key={region} >
//                             <Heading style={styles.countryRegion}>{region}</Heading>
//                             <Divider />
//                             {countries.map((country: { [key: string]: any }) => (
//                                 <View key={country.cca2} style={styles.countryContainer} data-country={country.name.common}>
//                                     <Pressable onPress={() => countryPressedHandler(country.name.common)}
//                                     >
//                                         <HStack className="bg-slate-100 border-r-background-info p-16">
//                                             <Icon as={() => <Text>{country.flag ?? country.flags.svg}</Text>} size="xl" />
//                                             <VStack>
//                                                 <Text style={styles.countryName}>{country.name.common}</Text>
//                                             </VStack>
//                                         </HStack>
//                                     </Pressable>
//                                 </View>
//                             )) ?? <SkeletonText />}
//                         </View>
//                     )
//                 }) : null}
//         </ScrollView >
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         padding: 16,
//     },
//     countryContainer: {
//         marginBottom: 16,
//         padding: 16,
//         backgroundColor: '#f8f8f8',
//         borderRadius: 8,
//     },
//     countryName: {
//         fontSize: 18,
//         fontWeight: 'bold',
//     },
//     countryRegion: {
//         fontSize: 14,
//         color: '#666',
//     },
// });

// const CountrySelectField: React.FC<any> = (props) => {
//     const { control, errors, defaultValues, handleFocus, countries, isLoading, disableForm, locationSchema, filteredCountries, renderCountryItem } = props;
//     const [searchQuery, setSearchQuery] = useState<string>("");

//     const debounceEffectFn = (query: string) => {
//         if (query.length > 0) {
//             const filtered = countries.data?.filter((country: countryResult) => {
//                 return country.name.common.toLowerCase().includes(query.toLowerCase());
//             });
//             return filtered ?? []
//         };
//         return countries
//     }
//     useEffect(() => {
//         console.log("Search Query updated:", searchQuery);
//         setInterval(() => {
//             debounceEffectFn(searchQuery);
//         }
//             , 1000);
//     }, [searchQuery]);

//     const handleSelectInputChange = (e: any) => {
//         if (!e) return;
//         const text = Platform.OS === 'web' ? e.target.value : e.nativeEvent.text;
//         console.log("Select Input Changed:", text);
//         if (text) {
//             setSearchQuery(text);
//         }
//     }

//     return (
//         <FormControl isInvalid={!!errors.country} className="mb-5 min-h-4">
//             <FormControlLabel>
//                 <FormControlLabelText>Country</FormControlLabelText>
//             </FormControlLabel>
//             {
//                 // Only render the country field if countries have been fetched
//                 countries && !isLoading ? (
//                     <Controller
//                         control={control}
//                         name="country"
//                         defaultValue={defaultValues.country ?? ""}
//                         rules={{
//                             required: "Country is required",
//                             validate: async (value: any) => {
//                                 try {
//                                     await locationSchema.parseAsync({
//                                         country: value,
//                                     });
//                                     return true;
//                                 } catch (error: any) {
//                                     handleFocus("country");
//                                     return error.message;
//                                 }
//                             }
//                         }}
//                         render={({ field: { onChange, value } }) => (
//                             <Select
//                                 selectedValue={value}
//                                 onValueChange={(val) => onChange(val)}
//                                 placeholder="Select or Type a Country"
//                                 isRequired={true}
//                                 isInvalid={!!errors.country}
//                                 className="mb-5"
//                                 closeOnOverlayClick={true}
//                                 isDisabled={disableForm || isLoading || !countries}
//                                 onOpen={() => {
//                                     console.log("Select Opened!");

//                                 }}
//                             >
//                                 {countries && !isLoading ? (

//                                     <SelectTrigger
//                                         variant="outline"
//                                         size="lg"
//                                         className="flex-row justify-between items-center"
//                                     >
//                                         <SelectInput
//                                             className="mt-3 flex-1"
//                                             placeholder="Type a Country 🌎"
//                                             defaultValue={defaultValues.country ?? ""}
//                                             editable={!!countries && !disableForm && !isLoading}
//                                         // onEndEditing={handleSelectInputChange}
//                                         // onBlur={handleSelectInputChange}
//                                         // onSubmitEditing={handleSelectInputChange}
//                                         />
//                                         <Divider className="h-full" orientation="vertical" />
//                                         <SelectIcon as={ChevronDown} size="sm" className="ml-2" />
//                                     </SelectTrigger>
//                                 ) : (
//                                     <SelectTrigger
//                                         disabled={true}
//                                         className=" border-slate-400 border-l-2 border-b-2 rounded-md"
//                                         // variant="solid"
//                                         size="lg"
//                                     >
//                                         <HStack className="justify-between">
//                                             <Input>
//                                                 <InputField
//                                                     placeholder="Loading Countries..."
//                                                     value={value}
//                                                 />
//                                             </Input>
//                                             <Spinner size="small" className="ml-5" />
//                                         </HStack>
//                                     </SelectTrigger>
//                                 )}

//                                 <SelectPortal
//                                     className="h-screen-safe-offset-1"
//                                     isOpen={true}
//                                     trapFocus={true}
//                                     isKeyboardDismissable={true}
//                                     preventScroll={true}
//                                     snapPoints={[65]}
//                                 >
//                                     <SelectBackdrop />
//                                     <SelectContent>
//                                         <SelectDragIndicator />
//                                         <SelectVirtualizedList
//                                             data={filteredCountries}
//                                             initialNumToRender={10}
//                                             keyExtractor={(item) => item ? (item as countryResult).name.common : ''}
//                                             getItem={(countryName: string) => filteredCountries?.find((country: countryResult) => searchQuery ? country.name.common.includes(searchQuery) : country.name.common === countryName)}
//                                             renderItem={({ item }) => renderCountryItem(item as countryResult)}
//                                             getItemCount={(data) => data ? data.length : 0}
//                                         />
//                                     </SelectContent>
//                                 </SelectPortal>
//                             </Select>
//                         )
//                         }
//                     />
//                 ) : <LoadingOverlay visible={true} title="Loading Countries" dismissToURL={"/"} />
//             }
//             <FormControlError>
//                 <FormControlErrorText>
//                     {errors.country?.message}
//                 </FormControlErrorText>
//             </FormControlError>
//         </FormControl >
//     );
// };

// export const CountrySelectField = (props: any) => {
//     const {
//         control,
//         errors,
//         defaultValues,
//         handleFocus,
//         countries,
//         isLoading,
//         disableForm,
//         locationSchema,
//         renderCountryItem,
//     } = props;

//     const [searchQuery, setSearchQuery] = useState("");
//     const [filteredCountries, setFilteredCountries] = useState(countries?.data ?? []);

//     // Properly use debounce hook
//     const debouncedSearch = useDebounce(searchQuery, () => {
//         console.log("Debounced Search Query:", searchQuery, "Filtered Countries pre-debounce:", countries.length);
//         if (searchQuery !== "" && searchQuery.length > 0 && props.isDirty) {
//             const filtered = countries?.data?.filter((country: countryResult) =>
//                 country.name.common.toLowerCase().includes(searchQuery.toLowerCase())
//             );
//             setFilteredCountries(filtered ?? []);
//         } else {
//             setFilteredCountries(countries?.data ?? []);
//         }
//     });

//     useEffect(() => {
//         setFilteredCountries(countries?.data ?? []);
//         console.log("debouncedSearch:", typeof debouncedSearch);
//         console.log("Filtered Countries:", filteredCountries.length);
//     }, [countries?.data]);

//     return (
//         <FormControl isInvalid={!!errors.country} className="mb-5 min-h-4">
//             <FormControlLabel>
//                 <FormControlLabelText>Country</FormControlLabelText>
//             </FormControlLabel>

//             {filteredCountries && !isLoading ? (
//                 <Controller
//                     control={control}
//                     name="country"
//                     defaultValue={defaultValues.country ?? ""}
//                     rules={{
//                         required: "Country is required",
//                         validate: async (value) => {
//                             try {
//                                 await locationSchema.parseAsync({ country: value });
//                                 return true;
//                             } catch (error) {
//                                 handleFocus("country");
//                                 console.log("Country validation error:", error);
//                                 throw error;
//                             }
//                         },
//                     }}
//                     render={({ field: { onChange, value } }) => (
//                         <Select
//                             selectedValue={value}
//                             onValueChange={(val) => onChange(val)}
//                             placeholder="Select or Type a Country"
//                             isRequired={true}
//                             isInvalid={!!errors.country}
//                             className="mb-5"
//                             closeOnOverlayClick={true}
//                             isDisabled={disableForm || isLoading || !countries}
//                             // isFocused={errors.country ? true : false}
//                             isHovered={props.isDirty || true}
//                         >
//                             {/* Select Trigger */}
//                             <SelectTrigger
//                                 variant="outline"
//                                 size="lg"
//                                 className="flex-row justify-between items-center"
//                             >
//                                 <SelectInput
//                                     className="mt-3 flex-1"
//                                     placeholder="Type a Country 🌎"
//                                     defaultValue={defaultValues.country ?? ""}
//                                     editable={!!countries?.data && !disableForm && !isLoading}
//                                     onChangeText={(text) => setSearchQuery(text)} // Update search query
//                                     onSubmitEditing={(e) => setTimeout(() => setSearchQuery(e.nativeEvent.text as string), 2000)}
//                                 />
//                                 <Divider className="h-full" orientation="vertical" />
//                                 <SelectIcon as={ChevronDown} size="sm" className="ml-2" />
//                             </SelectTrigger>

//                             {/* Select Portal (Dropdown) */}
//                             <SelectPortal isOpen={true}
//                                 // trapFocus={true}
//                                 isKeyboardDismissable={true} preventScroll={true} snapPoints={[65]}>
//                                 <SelectBackdrop />
//                                 <SelectContent>
//                                     <SelectDragIndicator />

//                                     {/* Render Country List */}
//                                     {filteredCountries.length > 0 ? (
//                                         <SelectVirtualizedList
//                                             data={filteredCountries}
//                                             initialNumToRender={10}
//                                             keyExtractor={(item) => (item as Partial<countryResult>)?.name?.common ?? ""}
//                                             renderItem={({ item }) => renderCountryItem(item)}
//                                             getItemCount={(data) => data?.length ?? 0}
//                                         />
//                                     ) : (
//                                         <Input className="p-4">
//                                             <InputField value="No matching country found" editable={false} />
//                                         </Input>
//                                     )}
//                                 </SelectContent>
//                             </SelectPortal>
//                         </Select>
//                     )}
//                 />
//             ) : (
//                 <Spinner size="large" />
//             )}

//             <FormControlError>
//                 <FormControlErrorText>{errors.country?.message}</FormControlErrorText>
//             </FormControlError>
//         </FormControl>
//     );
// };

const CountriesActionSheet = (props: any) => {
    const { countries, isLoading, handleFocus, locationSchema, filteredCountries, setFilteredCountries, ...rest } = props;
    // const [searchQuery, setSearchQuery] = useState<string>("");
    const [actionSheetOpen, setActionSheetOpen] = useState<boolean>(props.showActionSheet ?? false);

    const searchMethods = useForm({
        resolver: zodResolver(locationSchema),
    });
    const [searchQuery, setSearchQuery] = searchMethods.getValues('searchQuery');

    const debouncedSearch = useDebounce(searchQuery,
        () => setInterval(() =>
            setFilteredCountries(countries?.data?.filter((country: countryResult) =>
                country?.name?.common !== null && country.name.common.toLowerCase().includes(searchQuery.toLowerCase())) ?? [])
            , 1000));


    const handleSelectInputChange = (e: any) => {
        if (!e) return;
        const text = Platform.OS === 'web' ? e.target.value : e.nativeEvent.text;
        console.log("Select Input Changed:", text);
        if (text) {
            setSearchQuery(text);
            console.log("Search Query Updated:", searchQuery);
            //debounce search query
            setTimeout(() => {
                debouncedSearch;
            }
                , 500);
        }
    }

    const renderCountryItem = (item: countryResult) => {
        return (
            <ActionsheetItem
                key={item.name.common}
                onPress={() => {
                    console.log("Country Selected:", item.name.common);
                    //set country value in field
                    props.methods.setValues({ country: item.name.common });
                    // setSearchQuery(item.name.common);
                    setFilteredCountries([]);
                }}
            >
                <HStack className="w-md-8 items-center">
                    <ActionsheetIcon as={() => <Text>{item.flag}</Text>} size="lg" />
                    <ActionsheetItemText>{item.name.common}</ActionsheetItemText>
                </HStack>
            </ActionsheetItem>
        )
    }

    return (
        <Actionsheet
            isOpen={actionSheetOpen ?? false}
            trapFocus={true}
            isKeyboardDismissable={Platform.OS === 'web' ? true : false}
            preventScroll={Platform.OS !== 'web' ? true : false}
            snapPoints={[80]}
            onOpen={() => {
                console.log("Actionsheet Opened!");
                //dismiss keyboard
                Keyboard.dismiss();
            }}
            onClose={() => {
                console.log("Actionsheet Closed!");
                //reset search query
                setSearchQuery("");
                //reset filtered countries
                setFilteredCountries(countries?.data ?? []);
                //close actionsheet
                setActionSheetOpen(false);
            }}
            {...rest}>

            <KeyboardAvoidingView
                behavior="position"
                style={{
                    position: "relative",
                    flex: 1,
                    justifyContent: "flex-end",
                }}
            >
                <ActionsheetBackdrop />
                <ActionsheetContent className="">
                    <Controller
                        {...searchMethods}
                        name="searchQuery"
                        render={() => (
                            <FormControl className="mt-9">
                                <FormControlLabel>
                                    <FormControlLabelText>
                                        Search for a country 🌎
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Input className="w-full mb-4">
                                    <InputSlot>
                                        <InputIcon as={SearchCode} className="ml-2" />
                                    </InputSlot>
                                    <InputField placeholder="canada" />
                                </Input>
                                <FormControlError>
                                    <FormControlErrorText className="text-red-500" size="sm">
                                        {filteredCountries.length === 0 ? "No matching country found" : String(searchMethods.formState.errors.searchQuery?.message) ?? "Please enter a valid country name"}
                                    </FormControlErrorText>
                                </FormControlError>
                            </FormControl>
                        )}
                    >
                    </Controller>

                    <ActionsheetDragIndicatorWrapper>
                        <ActionsheetDragIndicator />
                    </ActionsheetDragIndicatorWrapper>
                    <ActionsheetVirtualizedList
                        data={searchQuery ? filteredCountries : countries?.data ?? []}
                        initialNumToRender={10}
                        keyExtractor={(item) => (item as countryResult)?.name.common}
                        renderItem={({ item }) => renderCountryItem(item as countryResult)}
                        getItemCount={(data) => data.length}
                    />
                </ActionsheetContent>
            </KeyboardAvoidingView>
        </Actionsheet>
    );
};

const CountriesFilterDrawer = (props: any) => { };

export default () => {
    const [showDrawer, setShowDrawer] = useState<boolean>(false);
    const [filters, setFilters] = useState<Partial<CountryFilters[]>>([]);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [filteredCountries, setFilteredCountries] = useState<countryResult[] | []>([]);
    const [disableForm, setDisableForm] = useState<boolean>(false);

    const schema = locationSchema.partial();
    const toast = useToast();
    const countryData = useQuery<CountryFilters[]>({
        queryKey: ['countries'],
        queryFn: fetchCountries,
    });

    const { control, handleSubmit, formState: { errors, isDirty, isValid, ...formState }, setValue, getValues, ...methods } = useForm({
        resolver: zodResolver(schema),
    });

    // useEffect(() => {
    //     console.log("Country Data:", countryData.data ? countryData.data.length : 0);
    //     if (countryData.data) {
    //         setFilteredCountries(countryData.data);
    //     }
    //     if (alertMessage && typeof alertMessage === 'string') showToast(alertMessage);

    //     return () => {
    //         setAlertMessage(null);
    //     }
    // }, [countryData.data, alertMessage]);

    useEffect(() => {
        console.log(alertMessage);
        if (alertMessage && typeof alertMessage === 'string') showToast(alertMessage);
    }, [alertMessage]);

    const showToast = (message: string) => {
        if (!message) return;
        if (Platform.OS === 'android') {
            ToastAndroid.showWithGravityAndOffset(
                message,
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                0,
                200
            );
        }
        toast.show({
            placement: "top",
            duration: 5000,
            render: ({ id }) => (
                <Alert id={id} variant="outline" action="info">
                    {message}
                </Alert>
            ),
        })
    };

    const handleFailedSubmit = (error: any) => {
        console.error("Failed to submit form:", error);
        showToast(`Form submitted with the following data causing error: ${Object.keys(getValues()).map((key) => `${key}: ${getValues()[key]}`).join(", ")}`);
        setDisableForm(false);
        setAlertMessage(error?.message ?? "Failed to submit form. Please try again.");
        //reset form
        methods.reset();
    }

    const handleSuccessfulSubmit = (data: any) => {
        showToast(`Form submitted with the following data: ${getValues("country")}`);
        setDisableForm(false);
        console.log("Form Data:", data);
        //reset form
        methods.reset();
    };
    const onSubmit = async () => {
        console.log(`Form submitted with the following data: ${getValues("country")}`);
        showToast(`Form submitted with the following data: ${getValues("country")}`);

        setDisableForm(true);
        await methods.trigger();

        handleSubmit(handleSuccessfulSubmit, handleFailedSubmit)();
    }

    return (
        <>
            {/* <CountriesList setAlertMessage={(message: string) => {
                setAlertMessage(message);
                showToast(message);
            }} /> */}
            <SafeAreaView className="px-5 py-15">
                <Center>
                    <Box>
                        <Heading size="3xl" className="mb-5">
                            Location Form
                        </Heading>
                        <Text className="text-muted mb-5">
                            Please fill out the form below to update your location.
                        </Text>
                    </Box>
                </Center>
                <Divider className="mb-4" />
                {countryData.data ? (
                    // <CountrySelectField
                    //     control={control}
                    //     errors={errors}
                    //     isValid={isValid}
                    //     isDirty={isDirty}
                    //     formState={formState}
                    //     defaultValues={getValues() ?? {
                    //         country: "",
                    //     }}
                    //     handleFocus={(name: string) => {
                    //         console.log("Focusing on:", name);
                    //         showToast(`Focusing on: ${name} field`);
                    //     }}
                    //     countries={countryData.data.slice(0, 1)}
                    //     isLoading={countryData.isLoading}
                    //     disableForm={disableForm}
                    //     locationSchema={schema}
                    //     filteredCountries={filteredCountries}
                    //     renderCountryItem={renderCountryItem}
                    //     handleSubmit={onSubmit}
                    //     {...methods}
                    // />
                    <>
                        <Button
                            className="fixed-top-left p-4"
                            onPress={() => {
                                console.log("Opening Drawer!");
                                setShowDrawer(true);
                            }}
                        ><ButtonIcon as={SearchIcon} />
                        </Button>
                        <CountryFilterDrawer
                            countries={countryData}
                            isLoading={countryData.isLoading}
                            showDrawer={showDrawer}
                            setFilters={setFilters}
                        />
                        <CountriesActionSheet
                            countries={countryData}
                            isLoading={countryData.isLoading}
                            handleFocus={(name: string) => {
                                console.log("Focusing on:", name);
                                showToast(`Focusing on: ${name} field`);
                            }
                            }
                            locationSchema={schema}
                            filteredCountries={filteredCountries}
                            setFilteredCountries={setFilteredCountries}
                            showActionSheet={showDrawer}
                            methods={methods}
                            {...methods}
                        />
                        <Button
                            className="fixed-bottom-right pt-4 mt-2 flex-auto"
                            onPress={onSubmit}
                            action="positive"
                            isDisabled={!isLoading || getValues("country") === ""}
                        >
                            <ButtonText>Submit</ButtonText>
                        </Button>
                    </>
                ) :
                    <LoadingOverlay visible={true} title="Loading Countries" />
                }
            </SafeAreaView>
        </>
    );
};

// import LocationFormScreen from "@/screens/(auth)/signup/LocationFormScreen";

// export default function AppLandingPage() {
//     return <LocationFormScreen />;
// }   