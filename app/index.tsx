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
import { Appearance, Keyboard, Platform, ScrollView } from "react-native";
import { Motion } from "@legendapp/motion";
import { Button, ButtonText, ButtonIcon, ButtonGroup } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Drawer, DrawerBackdrop, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from "@/components/ui/drawer";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Icon, PhoneIcon, StarIcon } from "@/components/ui/icon";
import React, { useEffect, useMemo, useRef } from "react";
import { Save, Lock, ArrowUp01, ArrowDown01, PanelLeftClose, PanelLeftOpen, AlertCircle, ChevronDownIcon, XCircle, User, LucideIcon, Map, ChevronLeft, EditIcon, ScanQrCode } from "lucide-react-native";
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
import {
    FormControl,
    FormControlError,
    FormControlErrorIcon,
    FormControlErrorText,
    FormControlLabel,
    FormControlLabelText,
} from "@/components/ui/form-control";
import {
    Select,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectIcon,
    SelectInput,
    SelectItem,
    SelectPortal,
    SelectTrigger,
} from "@/components/ui/select";
import { Controller, useForm } from "react-hook-form";
import { locationSchema } from "@/lib/schemas/userSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, usePathname, RelativePathString } from "expo-router";
import * as Linking from "expo-linking";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { SideBarContentList } from "@/components/navigation/NavigationalDrawer";
import Footer from "@/components/navigation/Footer";
import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import MemberActionCards from "@/screens/(tabs)/newsfeed/MemberActionCards";
import { ResourceType } from "@/components/navigation/ResourceActionSheet"
import { capitalize } from "@/utils/capitalizeSnakeCaseInputName";
import { fakeUserAvatar } from "@/lib/placeholder/avatar";
import { Image } from "@/components/ui/image";
import { Dimensions } from "react-native";
import { inventory, product, task, userProfile, vendor } from "@/constants/defaultSession";
import getRandomHexColor from "@/utils/getRandomHexColor";
import { isWeb } from "@gluestack-ui/nativewind-utils/IsWeb";
import { viewPort } from "@/constants/dimensions";
import QRcode from 'react-native-qrcode-svg';
import { current } from "tailwindcss/colors";
import { fakeProduct, fakeTask } from "@/__mock__/ProductTasks";
import Colors from "@/constants/Colors";
import { formatDatetimeObject } from "@/utils/date";
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

type MobileHeaderProps = {
    title: string;
    backIcon?: LucideIcon;
    icon: LucideIcon;
    nextUrl?: string;
    nextIcon?: LucideIcon;
    onBack?: (args?: any) => void;
    onNext?: (args?: any) => void;
    onMenu?: (args?: any) => void;
    onSearch?: (args?: any) => void;
};

function MobileHeader(props: MobileHeaderProps = {
    title: "Title",
    icon: User,
    backIcon: ChevronLeft,
}) {
    const router = useRouter();
    return (
        <HStack
            className="py-6 px-4 border-b border-border-800 bg-background-0 items-center justify-between"
            space="md"
        >
            <HStack className="items-center" space="sm">
                <Pressable
                    onPress={props?.onBack ? props.onBack : () => {
                        router.canDismiss() ? router.dismiss() : router.back();
                    }}
                >
                    <Icon as={XCircle} />
                </Pressable>
                <Text className="text-xl">{props.title}</Text>
            </HStack>
            <Icon as={props?.icon ?? User} className="h-8 w-20" />
        </HStack>
    );
}

function MobileFooter({
    footerIcons }:
    { footerIcons: any[] } = {
        footerIcons: SideBarContentList
    }) {
    const router = useRouter();
    return (
        <HStack
            className={cn(
                "bg-background-0 justify-between w-full absolute left-0 bottom-0 right-0 p-3 overflow-hidden items-center  border-t-border-300  md:hidden border-t",
                { "pb-5": Platform.OS === "ios" },
                { "pb-5": Platform.OS === "android" }
            )}
        >
            {footerIcons.map(
                (
                    item: { iconText: string; iconName: any },
                    index: React.Key | null | undefined
                ) => {
                    return (
                        <Pressable
                            className="px-0.5 flex-1 flex-col items-center"
                            key={index}
                            onPress={() => router.push("/news-feed/news-and-feed")}
                        >
                            <Icon
                                as={item.iconName}
                                size="md"
                                className="h-[32px] w-[65px]"
                            />
                            <Text className="text-xs text-center text-typography-600">
                                {item.iconText}
                            </Text>
                        </Pressable>
                    );
                }
            )}
        </HStack>
    );
}


// function SelectableCountrySideDrawer() {
//     const [showDrawer, setShowDrawer] = React.useState(false);
//     const [count, setCount] = React.useState<number>(0);
//     const [textInput, setTextInput] = React.useState<string>("");
//     const [countries, setCountries] = React.useState<CountryFilters[] | null>(null);
//     const [currentCountry, setCurrentCountry] = React.useState<CountryFilters | null>(null);
//     const [reverseAlphabetical, setReverseAlphabetical] = React.useState<boolean>(false);

//     const controllerRef = React.useRef<AbortController | AbortSignal | null>(null);
//     const inputRef = React.useRef<{ focus: () => void } | null>(null);
//     const countRef = React.useRef<number>(count)
//     const submitRef = React.useRef<any>(null);
//     const toast = useToast();

//     const updateCountRef = (newCount: number) => {
//         countRef.current = countries?.length ?? newCount;
//     }

//     useEffect(() => {
//         loadLocalCountriesData().then(data => {
//             setCountries(data as CountryFilters[]);
//         });
//         console.log("Countries loaded:", countries?.length);
//     }, []);

//     const SaveButton = React.forwardRef((props, ref) => {
//         return (
//             <Button
//                 ref={submitRef}
//                 className="w-[20px] gap-2 align-content-center"
//                 variant={!!currentCountry ? "solid" : "outline"}
//                 action={!!currentCountry ? "positive" : "secondary"}
//                 disabled={!!!currentCountry}
//                 onPress={() => {
//                     // if (!!!currentCountry) {
//                     //     console.log("Clearing country selection and inputs");
//                     //     setCurrentCountry(null);
//                     //     setTextInput("");
//                     //     // if (!!inputRef?.current) {
//                     //     //     inputRef?.current?.focus();
//                     //     //     inputRef.current?.scrollIntoView({ behavior: "smooth", animated: true });
//                     //     // }
//                     //     return;
//                     // }
//                     console.log("Submitting country selection:", { currentCountry });
//                     setShowDrawer(false);
//                     toast.show({
//                         id: `${currentCountry?.cca3 ?? 'N/A'}-success-${Math.random()}`,
//                         placement: "top",
//                         duration: 5000,
//                         render: ({ id }) => {
//                             return (
//                                 <Toast id={id} variant="solid" action="success">
//                                     <VStack className="gap-2">
//                                         <ToastTitle action="success" variant="solid">{`${currentCountry?.flag ?? '🏁'}`}Country Selected!</ToastTitle>
//                                         <ToastDescription size="sm">{`${currentCountry?.name?.common}`}</ToastDescription>
//                                     </VStack>
//                                 </Toast>
//                             )
//                         }
//                     });
//                 }}
//             >
//                 {/* <ButtonText className={!!!currentCountry ? "text-gray-400" : 'text-typography-white'}>Submit</ButtonText> */}
//                 {/* <ButtonText>{!!!currentCountry ? "Clear" : 'Submit'}</ButtonText> */}
//                 <ButtonIcon as={!!!currentCountry ? Lock : Save} color={!!!currentCountry ? "black" : "white"} />
//             </Button >);
//     });
//     const ReverseButton = () => {
//         return (
//             <Button
//                 className="w-[20px] gap-2"
//                 variant={reverseAlphabetical ? "solid" : "outline"}
//                 action={reverseAlphabetical ? "primary" : "secondary"}
//                 onPress={() => {
//                     setReverseAlphabetical(!reverseAlphabetical);
//                 }
//                 }
//             >
//                 {/* <ButtonText>{`Sort ${!!reverseAlphabetical ? 'A-Z' : 'Z-A'}`}</ButtonText> */}
//                 <ButtonIcon as={!!reverseAlphabetical ? ArrowUp01 : ArrowDown01} color={
//                     !!!reverseAlphabetical ? "black" : "white"
//                 } />
//             </Button >
//         )
//     }

//     const fadeAnim = React.useRef(new Animated.Value(0)).current;

//     useEffect(() => {
//         // Animate loading in/out
//         Animated.timing(fadeAnim, {
//             toValue: !!countries ? 1 : 0,
//             duration: 1500,
//             useNativeDriver: true,
//             easing: !!countries ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
//         }).start();

//         //set count state to the length of the countries array
//         !!countries?.length && countRef.current === countries.length ? setCount(countries?.length ?? 0) : updateCountRef(countries?.length ?? 0);
//     }, [countries]);

//     // useEffect(() => {
//     //     controllerRef.current = new AbortController();
//     //     const signal = controllerRef.current instanceof AbortController ? controllerRef.current.signal : null;
//     //     setAbortableTimeout({
//     //         callback: () => {
//     //             if (!textInput || textInput.trim().length === 0) {
//     //                 setFilteredCountries(countries ?? []);
//     //                 return;
//     //             }

//     //             const result = findCountryByKey(
//     //                 countries,
//     //                 { keys: ['name.common', 'cca2', 'cca3'], searchValue: textInput },
//     //                 true
//     //             );
//     //             setFilteredCountries(result);
//     //         }, delay: 300, signal
//     //     });

//     //     return () => controllerRef.current?.abort();
//     // }, [textInput, countries]);


//     // useEffect(() => {
//     //     if (!userActivity) {
//     //         const filteredCountries = findCountryByKey(countries, { keys: ['name', 'cca2', 'cca3'], searchValue: textInput }, true);
//     //         setCountries(filteredCountries);
//     //         setCount(filteredCountries.length);
//     //     }
//     // }, [textInput, userActivity]);

//     const handleCountryTap = (country: CountryFilters) => {
//         console.log('PRESSED', { country });
//         controllerRef.current = new AbortController();
//         controllerRef.current.abort();
//         setCurrentCountry(country);
//         setTextInput(country.name.common);
//     }

//     const CountryList = React.memo(({ countries, currentCountry, reverse, onSelect }:
//         {
//             countries: CountryFilters[] | null;
//             currentCountry: CountryFilters | null;
//             reverse: boolean;
//             onSelect: (country: CountryFilters) => void;
//         }) => {

//         const OnPressFn = !!onSelect ? onSelect : handleCountryTap;
//         if (!!!countries || countries.length === 0) {
//             return (<VStack className="gap-2">
//                 <Text className="text-typography-error">No countries found</Text>
//             </VStack>)
//         }
//         const reverseArray = !!reverse
//         const sorted = countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
//         return (

//             <VStack className="gap-2" reversed={reverseArray}>
//                 {//if countries
//                     // !!countries?
//                     sorted?.map((country, index) => (
//                         <Pressable
//                             key={index}
//                             className={`gap-2 flex-row items-center hover:bg-background-50 p-2 rounded-md  ${currentCountry?.cca3 === country.cca3 ?
//                                 'bg-background-success' : ''}`}
//                             onPress={() => { OnPressFn(country) }}
//                         >
//                             <Text className="text-typography-600">{`${country.flag} ${country.name.common}`}</Text>
//                         </Pressable>
//                     ))}
//             </VStack>

//         );
//     }, (prevProps, nextProps) => {
//         return (
//             prevProps.countries === nextProps.countries &&
//             prevProps.currentCountry?.cca3 === nextProps.currentCountry?.cca3
//         );
//     });

//     return (
//         <SafeAreaView className="my-safe-or-3.5 pb-safe-offset-2 border-red-100 border-2 h-full w-screen">
//             <MobileHeader title="Select a Country" icon={Map} />

//             <Pressable
//                 onPress={() => {
//                     setShowDrawer(true);
//                 }}
//                 // className="gap-2"
//                 className="absolute bottom-100 right-40 px-2 m-safe-offset-2 bg-primary-500 w-16 h-16 rounded-full justify-center items-center shadow-md"
//             >
//                 <Icon as={!!showDrawer ? PanelLeftClose : PanelLeftOpen} size="xl" color="white" />
//                 {/* <Text className="text-typography-100">Pick a country</Text> */}
//             </Pressable>

//             <VStack className="justify-center items-center margin-top-20">
//                 <HStack space="sm" className="gap-2">

//                     <Text className="text-typography-600">{`Countries Found:`}</Text>
//                     {/* <CreateCountBadge count={count ?? 0}
//                         thresholds={{ grey: 0, blue: 50, yellow: 20, red: 1, green: 250 }} /> */}
//                     <Badge size="sm" action={count > 100 ? "error" : count > 50 ? "warning" : "muted"}>
//                         <BadgeText>{count}</BadgeText>
//                     </Badge>
//                 </HStack >
//                 <Text className="text-typography-600">{`Selected Country: ${currentCountry?.name?.common ?? 'N/A'}`}</Text>
//                 <Drawer
//                     isOpen={showDrawer}
//                     onClose={() => {
//                         setShowDrawer(false);
//                     }}
//                 >
//                     <DrawerBackdrop />
//                     <DrawerContent className="w-[270px] md:w-[300px]">
//                         <DrawerHeader className="justify-center flex-col gap-2">
//                             <VStack className="justify-center items-center">
//                                 <Text size="lg">Choose your country</Text>
//                                 <Text size="sm" className="text-typography-600">
//                                     Select a country from the list below
//                                 </Text>
//                             </VStack>
//                             {/* <Input>
//                                 <InputField
//                                     ref={inputRef}
//                                     type="text"
//                                     placeholder="Search"
//                                     value={textInput}
//                                     onChange={(e) => {
//                                         controllerRef.current = new AbortController();
//                                         controllerRef.current.abort();
//                                         console.log({ textInput: e.nativeEvent.text, textInputState: textInput });
//                                         setTextInput(e.nativeEvent.text);
//                                     }}
//                                     onFocus={() => {
//                                         console.log("Input is focused");
//                                         !!!controllerRef.current ? controllerRef.current = new AbortController() : controllerRef.current.abort();
//                                         controllerRef.current.abort()
//                                     }
//                                     }
//                                     // onBlur={() => {
//                                     //     console.log("Input is blurred");
//                                     //     setUserActivity(false);
//                                     // }}
//                                     onBlur={(e: any) => {
//                                         console.log("Input is blurred");
//                                         if (textInput === "" || e.nativeEvent.text === "") {
//                                             //clear selection
//                                             setCurrentCountry(null);
//                                             return;
//                                         };

//                                         findCountryByKey(countries, { keys: ['name', 'cca2', 'cca3'], searchValue: e.nativeEvent.text }, true).then(filteredCountries => {
//                                             setCountries(filteredCountries as CountryFilters[]);
//                                         });
//                                     }}
//                                     submitBehavior="blurAndSubmit"
//                                 // className="h-12 text-pink-500 placeholder:text-pink-500"
//                                 />
//                                 <InputSlot>
//                                     <Button
//                                         className="mr-2"
//                                         variant="link"
//                                         disabled={textInput === ""}
//                                         onPress={() => {
//                                             setTextInput("");
//                                             setCurrentCountry(null);
//                                             if (!!inputRef?.current) {
//                                                 inputRef.current?.focus();
//                                             }
//                                             controllerRef.current.abort();
//                                         }}

//                                     >
//                                         <ButtonIcon as={CircleX} color={textInput === "" ? "grey" : "red"} />
//                                     </Button>
//                                 </InputSlot>
//                             </Input> */}
//                             <HStack className="flex-direction-row gap-3 justify-between">
//                                 <SaveButton ref={submitRef} />
//                                 <Button
//                                     variant="link"
//                                     action={!!!currentCountry ? "secondary" : "negative"}
//                                     disabled={!!!currentCountry}
//                                     onPress={() => {
//                                         setTextInput("");
//                                         setCurrentCountry(null);
//                                     }}
//                                 >
//                                     <ButtonText className={!!!currentCountry ? "text-typography-300" : "text-error-500"}>Clear</ButtonText>
//                                 </Button>
//                                 <ReverseButton />
//                             </HStack>
//                         </DrawerHeader>
//                         <Divider className="my-4" />
//                         <DrawerBody contentContainerClassName="gap-2">
//                             {!!!countries ? (
//                                 <TouchableWithoutFeedback /* Disables clicks behind overlay */>
//                                     <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
//                                         <Center style={{ flex: 1 }}>
//                                             <Box className="w-[80%] bg-background-100 p-5 rounded-md items-center">
//                                                 {/* XXL Spinner */}
//                                                 <Spinner size="large" className="my-3" />
//                                                 {/* Text Content */}
//                                                 <Heading size="3xl" className="mb-2">
//                                                     Filtering Countries
//                                                 </Heading>
//                                                 <Text className="text-center text-muted">If this is a taking a while, there may be a large amount of countries to filter through</Text>

//                                             </Box>
//                                         </Center>
//                                     </Animated.View>
//                                 </TouchableWithoutFeedback>
//                             ) : (<CountryList
//                                 countries={countries}
//                                 currentCountry={currentCountry}
//                                 onSelect={(country) => {
//                                     console.log('PRESSED', { country });
//                                     handleCountryTap(country);
//                                 }}
//                                 reverse={reverseAlphabetical}
//                             />)}
//                         </DrawerBody>
//                         <DrawerFooter

//                         >
//                             <SaveButton ref={submitRef} />
//                         </DrawerFooter>
//                     </DrawerContent>
//                 </Drawer>
//             </VStack >
//             <Footer footerChildren={<MobileFooter footerIcons={SideBarContentList} />} />
//         </SafeAreaView >
//     );


// }

// const renderSelectOptions = (sortedData: any[], valueKey: string, labelKey: string = "name") => {
//     if (!!!sortedData || !!!valueKey || !!!labelKey) {
//         throw new Error(`sortedData, valueKey, and labelKey are required, received: ${{ valueKey, labelKey, sortedData: sortedData.length }}`);
//     }
//     console.log("Rendering select options:", { sortedData: sortedData.length });
//     return (
//         <VStack space="md" className="h-full">

//             {
//                 sortedData.map((item, index) => (
//                     <SelectItem
//                         className="text-black"
//                         key={`${index}-${item[valueKey]}`} value={item[valueKey]} label={item[labelKey]}
//                     />
//                 ))
//         }
//         </VStack>
//     )
// }

// export default function CountrySelect() {
//     const [selectOptions, setSelectOptions] = React.useState<CountryFilters[] | null>(null);
//     const methods = useForm({
//         defaultValues: {
//             country: "Canada",
//         },
//         reValidateMode: "onChange",
//         mode: "onBlur",
//         resolver: zodResolver(locationSchema),
//     })

//     const data = async () => {
//         return await loadLocalCountriesData();
//     }

//     useEffect(() => {
//         data().then((data) => {
//             setSelectOptions(data as CountryFilters[]);
//         }
//         );
//         console.log("Data loaded:", selectOptions?.length ?? 0);
//     }, []);
//     //debugging effect
//     useEffect(() => {
//         if (methods.getFieldState("country").isDirty) {
//             console.log("selection", methods.watch("country"));

//         }
//     }, [methods.watch("country")]);

//     const RenderCountrySelect = (props: any = {
//         methods
//     }) => {
//         const { methods: { control, errors = {}, ...formMethods } } = props;

//         return (
//             <>
//                 <FormControl
//                     isInvalid={!!errors.country}
//                 >
//                     <FormControlLabel className="mb-2">
//                         <FormControlLabelText>Country</FormControlLabelText>
//                     </FormControlLabel>
//                     <Controller
//                         name="country"
//                         control={control}
//                         rules={{
//                             validate: async (value) => {
//                                 try {
//                                     await locationSchema.parseAsync({ country: value });
//                                     return true;
//                                 } catch (error: any) {
//                                     return error.message;
//                                 }
//                             },
//                         }}
//                         render={({ field: { onChange, onBlur, value } }) => (
//                             (selectOptions ?? []).length > 0 ? (
//                                 <Select
//                                     onValueChange={onChange}
//                                     selectedValue={value}
//                                     className="w-full p-4"
//                                     closeOnOverlayClick={true}
//                                     initialLabel="Select a country"
//                                     defaultValue="Canada"

//                                 >
//                                     <SelectTrigger
//                                         variant="outline"
//                                         size="md"
//                                         disabled={selectOptions?.length === 0}>
//                                         <SelectInput placeholder="Select" />
//                                         <SelectIcon className="mr-3" as={selectOptions?.length === 0 ? Lock : ChevronDownIcon} color={selectOptions?.length === 0 ? "grey" : "black"} />
//                                     </SelectTrigger>
//                                     <SelectPortal>
//                                         <SelectBackdrop />
//                                         <SelectContent>
//                                             <SelectDragIndicatorWrapper>
//                                                 <SelectDragIndicator />
//                                             </SelectDragIndicatorWrapper>
//                                             {
//                                                 renderSelectOptions(selectOptions ?? [], "name", "name")
//                                             }
//                                         </SelectContent>
//                                     </SelectPortal>
//                                 </Select>)
//                                 :
//                                 <Spinner size="large" />
//                         )}
//                     />
//                     <FormControlError>
//                         <FormControlErrorIcon as={AlertCircle} size="md" />
//                         <FormControlErrorText>
//                             {errors?.country?.message ?? "Please select a country"}
//                         </FormControlErrorText>
//                     </FormControlError>
//                 </FormControl >
//             </>
//         );
//     }

//     return (
//         <RenderCountrySelect methods={methods} />
//     );

// }


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
});
const createQRCode = (value: string) => {
    return (
        <QRcode
            value={value}
            size={50}
            backgroundColor="white"
            color="black"
        />
    )
}

const InviteShareComponent = (props: {
    onInvite: (args: any) => void;
    onShare: (args: any) => void;
    onQR: (args: any) => void;
    qrCode?: string;
    currentPath: string;
    ResourceQR?: JSX.Element | null | undefined;
}) => {

    return (
        <HStack
            className="py-5 px-6 border rounded-xl border-border-300 justify-between items-center"
            space="2xl"
        >
            <HStack space="2xl" className="items-center">
                <Box className="md:h-50 md:w-50 h-10 w-10">
                    <Center>

                        {//show QR code if it exists
                            props.ResourceQR ?? createQRCode(props?.qrCode ?? props.currentPath)
                        }
                    </Center>
                    {/* {

                        (<Image
                            source={require(props?.PromoImageURI ?? "@/assets/profile-screens/profile/image1.png")}
                            className="h-full w-full object-cover rounded-full"
                            alt="Promo Image"
                        />)} */}
                </Box>
                <VStack>
                    <Text className="text-typography-900 text-lg" size="lg">
                        Share this with someone
                    </Text>
                    <Text className="font-roboto text-sm md:text-[16px]">
                        {props?.qrCode ?? `QR code ${props.currentPath}`}
                    </Text>
                </VStack>
            </HStack>
            <Button
                onPress={props.onInvite}
                className="p-0 md:py-2 md:px-4 bg-background-0 active:bg-background-0 md:bg-background-900 ">
                <ButtonText className="md:text-typography-0 text-typography-800 text-sm">
                    Invite
                </ButtonText>
            </Button>
        </HStack>
    )
}

const ResourceContentTemplate = (
    {
        resource,
        onEditButtonPress,
        resourceType,
        title,
        subtitle,
        imageURI,
        bannerURI,
        resourceStats,
        sections,
        modal,
    }:
        {
            resource: Partial<userProfile | inventory | task | product | vendor>,
            onEditButtonPress: (args: any) => any,
            resourceType: ResourceType,
            title?: string,
            subtitle?: string,
            imageURI?: string,
            bannerURI?: string,
            resourceStats?: {
                value: any,
                labelText: string
            }[] | null | undefined;
            sections?: {
                title: string;
                children: JSX.Element
            }[] | null | undefined;
            modal?: JSX.Element | null | undefined;
            // keys?: Partial<{
            //     nameKey?: Partial<keyof userProfile | keyof inventory | keyof task | keyof product | keyof vendor>,
            //     descriptionKey?: Partial<keyof userProfile | keyof inventory | keyof task | keyof product | keyof vendor>,
            //     imageURIKey?: Partial<keyof userProfile | keyof inventory | keyof task | keyof product | keyof vendor>,
            //     bannerURIKey?: string | Partial<keyof userProfile | keyof inventory | keyof task | keyof product | keyof vendor>,
            // }> | null | undefined
        }
) => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const windowDimensions = useRef(Dimensions.get('window'));
    const { height: windowHeight, width: windowWidth } = windowDimensions.current;
    const [showSideList, setShowSideList] = React.useState(false);
    const pathname = usePathname();
    const fullUrl = Linking.createURL(pathname);
    const router = useRouter();
    const toast = useToast();
    //effect to set side list visibility
    React.useEffect(() => {
        console.log("Resource Content Template mounted");
        console.log(Colors[Appearance.getColorScheme() ?? "light"].background)

        if (isWeb) {
            window.addEventListener('resize', () => {
                windowDimensions.current = Dimensions.get('window');
            });
        }
        //set side list visibility if WindowWidth is less than 768
        console.log('setting side list visibility:', windowWidth > viewPort.height, { showSideList });
        setShowSideList(windowWidth > viewPort.height);

        return () => {
            if (isWeb) {
                window.removeEventListener('resize', () => {
                    windowDimensions.current = Dimensions.get('window');
                });
            }
        }
    }, [windowDimensions.current]);

    const translateY = scrollY.interpolate({
        inputRange: [0, ((windowHeight * 0.3) + 100)], // Header moves out of view when scrolling down //[triggerHeight, triggerHeight + 100],
        outputRange: [(windowHeight * 0.3 + 100), 0], // Header moves into view when scrolling up //[0, 100],
        extrapolate: 'clamp',
    });

    const resourceBannerURI = "https://avatar.iran.liara.run/public" //`${process.env.EXPO_RANDOM_AVATAR_API}/app` //bannerURI ?? "@/assets/image2.png";
    return (
        // <Animated.ScrollView> {/*or regular scroll view*/}
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingBottom: isWeb ? 0 : 160,
                paddingTop: 70,
                flexGrow: 1,
                backgroundColor: "#3d1e00", //Colors[Appearance.getColorScheme() ?? "light"].background,
                backgroundSize: "cover",

            }}
        >
            {/*
            *---------------------------------------------
             * Image header 
             * ---------------------------------------------
             * */}

            <VStack className="h-full w-full py-8" space="2xl">
                <Box className="relative w-full md:h-[478px] h-[380px] bg-banner object-cover"
                    style={{
                        backgroundColor: Colors[Appearance.getColorScheme() ?? "light"].background,
                    }}
                >

                    {/* --------------------------------------------
                    *Banner Background Color
                     * ---------------------------------------------
                     */}
                </Box>
                <HStack className="absolute pt-6 px-10 hidden md:flex"

                >
                    <Button variant="link" onPress={() => {
                        console.log("home button pressed");
                        router.push({
                            pathname: "/(tabs)/(stacks)/[type].[id]" as RelativePathString,
                            params: {
                                type: "household",
                                id: (resource as inventory)?.inventory_id,
                            }
                        })
                    }}>
                        <Text className="text-typography-900 font-roboto">
                            home &gt; {` `}
                        </Text>
                    </Button>
                    <Text className="font-semibold text-typography-900 ">
                        {//capitalize resource type
                            subtitle ?? (!!resourceType && typeof resourceType === 'string') ?
                                capitalize(resourceType) :
                                "Resource"
                        }</Text>
                </HStack>
                <Center className="absolute md:mt-14 mt-6 w-full md:px-10 md:pt-6 pb-4"

                >
                    <VStack space="lg" className="items-center">
                        {/* --------------------------------------------
                        *Resource Image
                         * ---------------------------------------------
                         */}
                        <Avatar size="2xl" className="bg-primary-600">
                            <AvatarImage
                                alt="Profile Image"
                                className="h-full w-full"
                                source={{
                                    uri: `https://avatar.iran.liara.run/username?username=${(resource as any)?.name ?? (resource as any)?.product_name ?? "Fake Name"
                                        }`
                                }}
                                defaultSource={5}
                            />
                            {/* <AvatarImage 
                            alt="Profile Image"
                            className="h-full w-full"
                            source={{

                                // loadingIndicatorSource={fakeUserAvatar}
                            
                            
                            /> */}
                            {/* <AvatarFallbackText
                                className="text-typography-900 text-center"
                                size="2xl"
                            >
                                {(resource as any)?.name?.charAt(0) ?? (resource as any)?.product_name?.charAt(0) ?? "R"}
                            </AvatarFallbackText> */}
                            <AvatarBadge />
                        </Avatar>
                        <VStack className="gap-1 w-full items-center">
                            <Text size="2xl" className="font-roboto text-dark">
                                {title ?? (resource as any)?.name ?? (resource as any)?.product_name ?? "Resource Name"}
                            </Text>
                            <Text className="font-roboto text-sm text-typography-700">
                                {subtitle ?? (resourceType === 'profile' ? "User" : `${capitalize(resourceType)}`)}
                            </Text>
                        </VStack>
                        <>
                            <HStack className="justify-between items-center gap-3 flex-wrap">
                                {
                                    //* --------------------------------------------
                                    //* Resource Stats
                                    // ---------------------------------------------
                                    //*
                                    !!resourceStats ? resourceStats?.map((stat, index) => {
                                        return ![resourceStats.length - 1].includes(index) ?
                                            (<>
                                                <VStack className="py-3 px-4 items-center" space="xs">
                                                    <Text className="text-dark font-roboto font-semibold justify-center items-center">
                                                        {stat.value}
                                                    </Text>
                                                    <Text className="text-dark text-xs font-roboto">
                                                        {stat.labelText}
                                                    </Text>
                                                </VStack>
                                                <Divider orientation="vertical" className="h-10" />
                                            </>
                                            ) : (
                                                <VStack className="py-3 px-4 items-center" space="xs">
                                                    <Text className="text-dark font-roboto font-semibold justify-center items-center">
                                                        {stat.value}
                                                    </Text>
                                                    <Text className="text-dark text-xs font-roboto">
                                                        {stat.labelText}
                                                    </Text>
                                                </VStack>
                                            )
                                    }) : (<></>)
                                }
                            </HStack>
                        </>
                        <Button
                            variant="outline"
                            action="secondary"
                            onPress={(e: any) => onEditButtonPress(e)}
                            className="gap-3 relative"
                        >
                            <ButtonText className="text-dark">Edit {`${capitalize(resourceType)}`}</ButtonText>
                            <ButtonIcon as={EditIcon} />
                        </Button>
                    </VStack>
                </Center>
                <VStack className="mx-6" space="xl"
                    style={{
                        backgroundColor: Colors[Appearance.getColorScheme() ?? "light"].background,
                        // backgroundClip: "clip",
                        backgroundSize: "cover",

                    }}
                >
                    <Center>
                        <InviteShareComponent
                            onInvite={() => {
                                toast.show({
                                    duration: 1000,
                                    placement: "bottom",
                                    render: ({ id }) => {
                                        return (
                                            <Toast id={id} variant="solid" action="success">
                                                <VStack className="gap-2">
                                                    <ToastTitle action="success" variant="solid">Invite Button Pressed</ToastTitle>
                                                    <ToastDescription size="sm">Invite button was pressed</ToastDescription>
                                                </VStack>
                                            </Toast>
                                        )
                                    }
                                })
                            }}
                            onShare={() => { }}
                            onQR={() => { }}
                            currentPath={fullUrl}
                        />
                    </Center>
                </VStack>
                {
                /* --------------------------------------------
                *Resource Sections
                 * ---------------------------------------------
                 */}
                {!!sections ? (
                    <VStack className="mx-6" space="2xl"
                        style={{
                            backgroundColor: Colors[Appearance.getColorScheme() ?? "light"].background,
                            // backgroundClip: "clip",
                            backgroundSize: "cover",

                        }}
                    >
                        {
                            sections?.map((section, index) => {
                                return (
                                    <>

                                        <VStack key={index} className="gap-2">
                                            <Heading className="font-roboto" size="xl">
                                                {section.title}
                                            </Heading>
                                            {section.children}
                                        </VStack>
                                    </>
                                )
                            })
                        }
                    </VStack>) : <></>}
            </VStack>
        </ScrollView>
    )
    {/* </Animated.ScrollView> */ }
}

export default function AppRoot() {
    const resource = fakeProduct;
    const task = fakeTask;
    const toast = useToast();
    // const placeholderImages = 

    return (
        <ResourceContentTemplate
            resource={resource}
            onEditButtonPress={() => {
                console.log("editButtonPressed");
                toast.show({
                    duration: 1000,
                    placement: "bottom",
                    render: ({ id }) => {
                        return (
                            <Toast id={id} variant="solid" action="success">
                                <VStack className="gap-2">
                                    <ToastTitle action="success" variant="solid">Edit Button Pressed</ToastTitle>
                                    <ToastDescription size="sm">Edit button was pressed</ToastDescription>
                                </VStack>
                            </Toast>
                        )
                    }
                })
            }}
            resourceType="product"
            title={resource.product_name}
            subtitle={resource.product_category}
            imageURI={`${process.env.EXPO_RANDOM_AVATAR_API}/all`}
            bannerURI={"https://unsplash.com/photos/snow-covered-mountains-under-a-clear-bright-sky-cNb7hPlkItg"}
            resourceStats={[
                {
                    labelText: "Quantity",
                    value: `${Math.floor((resource.current_quantity ?? 1) / (resource.max_quantity ?? 1) * 100) + "%"} ${resource.quantity_unit}`,
                },
                {
                    labelText: "Auto-Order",
                    value: `${resource.auto_replenish ? "On" : "Off"}`,
                },
                {
                    labelText: "Last Updated",
                    value: `${formatDatetimeObject(new Date(resource.updated_dt))}`
                },
                {
                    labelText: "Expiration Date",
                    value: `${formatDatetimeObject(new Date(resource.expiration_date))}`
                },
                {
                    labelText: "Last Scanned",
                    value: `${formatDatetimeObject(new Date(resource.last_scanned))}`
                },
                {
                    labelText: "Draft Status",
                    value: `${resource.draft_status ?? "draft"}`
                }
            ]}
            sections={[
                {
                    title: "Scan History",
                    children: resource.last_scanned && resource.last_scanned.length > 0 ?
                        (
                            <VStack className="gap-2"
                                style={{
                                    backgroundColor: Appearance.getColorScheme() === "dark" ? "#3d1e00" : "#f5f5f5",
                                }}
                            >
                                {
                                    (Object.entries(resource.scan_history) ?? []).map(([scannedDate, scanDetails], index, array) => {
                                        return (
                                            <HStack key={index} className="gap-2">
                                                <Text>{formatDatetimeObject(new Date(scannedDate))}</Text>
                                                <Text>{scanDetails.scanned_by}</Text>
                                                <Text>{scanDetails.scan_location}</Text>
                                            </HStack>
                                        )
                                    })
                                }
                            </VStack>
                        ) : (
                            <VStack className="gap-2">
                                <Text className="text-typography-100">No scan history available</Text>
                                <Button
                                    // className="text-typography-0"

                                    variant="solid"
                                    action="positive"
                                    onPress={() => {
                                        console.log("Scan history button pressed");
                                    }}
                                >
                                    <ButtonIcon as={ScanQrCode} />
                                    <ButtonText className="text-typography-100"

                                    >Scan Now</ButtonText>
                                </Button>
                            </VStack>
                        )
                }
            ]}
        />
    )
}