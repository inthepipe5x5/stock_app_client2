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
import { product, inventory, task, vendor, household } from "@/constants/defaultSession";
import { useLocalSearchParams } from "expo-router";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import supabase from "@/lib/supabase/supabase";
import { fetchUserInventories, fetchUserTasks, fetchUserHouseholdsByUser, fetchSpecificUserHousehold } from "@/lib/supabase/session";
import { pluralizeStr, singularizeStr } from "@/utils/pluralizeStr";
import { capitalize } from "@/utils/capitalizeSnakeCaseInputName";
import { useRouter } from "expo-router";
type resourceType = "product" | "inventory" | "task" | "vendor";
type ResourceSearchScreenWithFiltersProps = {
    //required
    resourceType: resourceType;
    resourceData: product[] | inventory[] | task[] | vendor[];
    resourceFilters: keyof Partial<product> | keyof Partial<inventory> | keyof Partial<task> | keyof Partial<vendor>;
    //optional
};

const defaultFilters = {
    isTemplate: false,
    draftStatus: "confirmed",
}

const returnResourceQueryFn = (resourceType: resourceType, user_id: string, householdIdList: string[], filterParams?: { [key: string]: any }) => {

    switch (resourceType) {
        case "product":
            return await supabase.from<product>("products").select("*").eq("user_id", user_id).then(({ data }) => data);
        case "inventory":
            return await fetchUserInventories({ user_id }, householdIdList);
        case "task":
            return await fetchUserTasks({ user_id });
        case "vendor":

            const [filterKey] = filterParams ? Object.keys(filterParams) : [];
            const filterValues = filterParams ? Object.values(filterParams) : [];
            return await supabase.from<vendor>("suppliers").select("*").in(filterKey, filterValues)
        default:
            return [];
    }
}


export default function ResourceSearchScreenWithFilters(props: ResourceSearchScreenWithFiltersProps) {
    const router = useRouter();
    const params = useLocalSearchParams<{
        userId?: string
        householdId?: string
        messageTitle?: string,
        messageDescription?: string,
    }>();
    const [showDrawer, setShowDrawer] = useState<boolean>(false);
    const [filters, setFilters] = useState(defaultFilters);
    const currentSession = useUserSession();
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [disableForm, setDisableForm] = useState<boolean>(false);
    const [associatedUserId, setAssociatedUserId] = useState<string | null>(params.userId ?? currentSession?.state?.user?.user_id ?? null);
    const [selectedResource, setSelectedResource] = useState<product | inventory | task | vendor | null>(null);
    const toast = useToast();

    // const householdData = useQuery<household[]>({
    //     queryKey: ["household", associatedUserId],
    //     queryFn: async () => {
    //         const data = await fetchUserHouseholdsByUser({ user_id: associatedUserId ?? undefined });
    //         return data.map(item => item.household).flat();
    //     },
    //     enabled: !!associatedUserId,
    // });

    const householdData = useQuery({
        queryKey: ["household", resourceData.household_id],
        queryFn: async () => {
            const data = await fetchSpecificUserHousehold({ household_id: params.householdId[0] ?? resourceData?.user_id });
            console.log("Household Data:", data);
            return data;
        }
    });

    const permissions = createPermissionsObject({ type: resourceType, data: resourceData }, useHousehouldQuery.data);
    const resourceSpecificActions: { [key in ResourceType]: (props: any) => JSX.Element } = {
        "household": <HouseHoldActions {...props} />,
        "task": <TaskActions {...props} />,
        "product": <ProductActions {...props} />,
    }


    const inventoryData = useQuery<inventory[]>({
        queryKey: ["inventory", associatedUserId],
        queryFn: async () => {
            return await fetchUserInventories({ user_id: associatedUserId });
        },
        enabled: !!associatedUserId && !!householdData.data // Only fetch data if associatedUserId && householdData is available
    });

    const resourceData = useQuery<product[] | task[] | vendor[]>({
        queryKey: [props.resourceType, associatedUserId],
        queryFn: () => { }
        enabled: !!associatedUserId && !!householdData.data // Only fetch data if associatedUserId && householdData is available
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



    interface Filters {
        [key: string]: any;
    }

    const applyFiltersFn = (
        data: product[] | inventory[] | task[] | vendor[],
        filters: Filters
    ): (product | inventory | task | vendor)[] => {
        if (!filters) return data;
        const filtered = (data ?? []).filter((item: any) => {
            for (const key in filters) {
                const filterValue = filters[key] as any;
                const itemValue = (item as any)[key];

                if (Array.isArray(filterValue)) {
                    if (!Array.isArray(itemValue) || !filterValue.every(val => itemValue.includes(val))) {
                        return false;
                    }
                } else if (typeof filterValue === 'object') {
                    if (JSON.stringify(filterValue) !== JSON.stringify(itemValue)) {
                        return false;
                    }
                } else {
                    if (filterValue !== itemValue) {
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
                        <Heading size="3xl" className="mb-5">{`Find ${capitalize(pluralizeStr(props.resourceType))}`} </Heading>
                        <Text className="text-muted mb-5">{`${capitalize(pluralizeStr(props.resourceType))}`} Filters are available.</Text>
                    </Box>
                </Center>
                <Divider className="mb-4" />

                {resourceData.isLoading ? (
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

                        {   /* Action Sheet for Selecting Resource Actions */}



                        <Button className="fixed-bottom-right pt-4 mt-2 flex-auto" onPress={() => {
                            console.log("Submit button pressed => Selected Resource:", selectedResource ?? "None");

                            if (!selectedResource || selectedResource === null) {
                                setAlertMessage("Please select a resource to proceed.");
                            }

                            const resourceId = selectedResource ? (selectedResource as any).id ?? (selectedResource as any)[`${singularizeStr(props.resourceType)}_id`] ?? null : null;
                            router.push({ pathname: "/(tabs)/(search)/[resource].[id]", params: { resource: props.resourceType ?? "product", id: resourceId } });
                        }} action="positive" isDisabled={!selectedResource || disableForm}>
                            <ButtonText>Submit</ButtonText>
                        </Button>
                    </>
                )}
            </SafeAreaView>
        </>
    );
}
