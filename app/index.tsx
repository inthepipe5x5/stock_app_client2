import { fetchCountries, CountryFilters, countryResult } from "@/utils/countries";
import React, { useEffect, useState, useMemo } from "react";
import { Text, Platform, Appearance, ToastAndroid } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "@/components/ui/icon";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Heading } from "@/components/ui/heading";
import { Divider } from "@/components/ui/divider";
import LoadingOverlay from "@/components/navigation/TransitionOverlayModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { locationSchema } from "@/lib/schemas/userSchemas";
import { useToast } from "@/components/ui/toast";
import { SafeAreaView } from "react-native-safe-area-context";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import CountryFilterDrawer from "@/components/forms/CountryFilterDrawer";
import CountriesActionSheet from "@/components/forms/CountriesActionSheet";
import { lowerCaseSort } from "@/utils/sort";
import useDebounce from "@/hooks/useDebounce"; // Ensure debounce hook is used
import { sortAlphabetically } from "@/utils/sort";
import { KeyboardAvoidingView } from "@/components/ui/keyboard-avoiding-view";

export default function LocationFormWithFilters() {
    const [showDrawer, setShowDrawer] = useState<boolean>(false);
    const [filters, setFilters] = useState({
        independent: true,
        region: ["Africa", "Americas", "Asia", "Europe", "Oceania"],
    });

    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [disableForm, setDisableForm] = useState<boolean>(false);

    const schema = locationSchema.partial();
    const toast = useToast();
    const methods = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            country: ""
        }
    });
    const { handleSubmit, getValues } = methods;

    const countryData = useQuery<CountryFilters[]>({
        queryKey: ["countries"],
        queryFn: fetchCountries,
    });

    useEffect(() => {
        if (alertMessage) {
            showToast(alertMessage);
            setAlertMessage(null);
        }
    }, [alertMessage]);

    const showToast = (message: string) => {
        if (!message) return;
        if (Platform.OS === "android") {
            ToastAndroid.showWithGravityAndOffset(message, ToastAndroid.LONG, ToastAndroid.BOTTOM, 0, 200);
        } else {
            toast.show({
                placement: "top",
                duration: 5000,
                render: ({ id }) => (
                    <Alert id={id} variant="outline" action="info">
                        {message}
                    </Alert>
                ),
            });
        }
    };

    const handleFailedSubmit = (error: any) => {
        console.error("Form submission failed:", error);
        showToast(`Submission failed: ${error.message}`);
        setDisableForm(false);
    };

    const handleSuccessfulSubmit = (data: any) => {
        showToast(`Submitted with: ${data.country}`);
        setDisableForm(false);
        console.log("Submitted Data:", data);
    };

    const onSubmit = async () => {
        console.log("Submitting form with:", methods.getValues());
        showToast(`Submitting form with: ${methods.getValues()}`);
        setDisableForm(true);
        await methods.trigger();
        handleSubmit(handleSuccessfulSubmit, handleFailedSubmit)();
    };

    const applyFiltersFn = (data: any, filters: { [key: string]: any }) => {
        if (!filters) return data;
        const filtered = (data ?? []).filter((country: CountryFilters) => {
            for (const key in filters) {
                const filterValue = filters[key] as any;
                const countryValue = (country as any)[key];

                if (Array.isArray(filterValue)) {
                    if (!Array.isArray(countryValue) || !filterValue.every(val => countryValue.includes(val))) {
                        return false;
                    }
                } else if (typeof filterValue === 'object') {
                    if (JSON.stringify(filterValue) !== JSON.stringify(countryValue)) {
                        return false;
                    }
                } else {
                    if (filterValue !== countryValue) {
                        return false;
                    }
                }
            }
            return true;
        });
        return filtered;
    }

    return (
        <>
            <SafeAreaView className="px-5 py-15">
                <Center>
                    <Box>
                        <Heading size="3xl" className="mb-5">Location Form</Heading>
                        <Text className="text-muted mb-5">Please fill out the form below to update your location.</Text>
                    </Box>
                </Center>
                <Divider className="mb-4" />

                {countryData.isLoading ? (
                    <LoadingOverlay visible title="Loading Countries" />
                ) : (
                    <>
                        <Button className="fixed-top-left p-4" variant="link" onPress={() => setShowDrawer(true)}>
                            <ButtonIcon as={SearchIcon} fill={Appearance.getColorScheme() === "light" ? "black" : "white"} />
                        </Button>

                        {/* Country Filter Drawer */}
                        <CountryFilterDrawer
                            countries={countryData.data}
                            isLoading={countryData.isLoading}
                            showDrawer={showDrawer}
                            setFilters={setFilters}
                        />

                        {   /* Action Sheet for Selecting Countries */}
                        <CountriesActionSheet
                            countries={countryData.data}
                            isLoading={countryData.isLoading}
                            handleFocus={(name: string) => showToast(`Focusing on: ${name}`)}
                            // filteredCountries={filteredCountries}
                            showActionSheet={showDrawer}
                            methods={methods}
                            getValues={getValues}
                            setShowActionSheet={setShowDrawer}
                        />


                        <Button className="fixed-bottom-right pt-4 mt-2 flex-auto" onPress={onSubmit} action="positive" isDisabled={!countryData.isLoading || disableForm}>
                            <ButtonText>Submit</ButtonText>
                        </Button>
                    </>
                )}
            </SafeAreaView>
        </>
    );
}
