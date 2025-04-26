/**
 * page: new-user 
 * check if a new user has a household and if not, redirect to create one.
 * 
 */
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter, Redirect, RelativePathString } from "expo-router";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import { useState } from "react";
import { set } from "react-hook-form";
import DashboardLayout from "@/screens/_layout";
import ComponentCard from "@/screens/modular/ComponentCard";
import { House, HouseIcon, Icon } from "lucide-react-native";
import { ScrollView } from "react-native";
import * as Linking from "expo-linking";
import { handleUrlParams } from "expo-router/build/fork/getStateFromPath-forks";


//new user - no households

//new user - invite to join households

//new user - continue creating household (they are in drafts)

export default function NewUserHouseholdLanding() {
    const globalContext = useUserSession();
    const dispatch = globalContext?.dispatch;

    const params = useLocalSearchParams();
    const router = useRouter();
    const qc = useQueryClient();
    const [mappedHouseholds, setMappedHouseholds] = useState<Record<"profiles" | "household" | "relation", any> | null>(null);

    //check if user is authenticated and has a valid session
    if (!!!globalContext || !!!globalContext?.state || !!!globalContext?.state?.user?.user_id || !!!globalContext?.isAuthenticated) {
        return <Redirect href="/(auth)" />;
    }
    if (params?.newUser !== 'true') {

        router.setParams({ newUser: "false" })
        return <Redirect href={{
            pathname: "/(tabs)" as RelativePathString,
            params: { newUser: 'false' }
        }} />
    }
    //check pre-fetched data
    const prefetchedHouseholds = qc.getQueryData<
        {
            profiles: any[];
            households: any[];
            user_households: any[];
        }>(['userHouseholds', globalContext?.state?.user?.user_id]);

    if (!!!prefetchedHouseholds) {
        return (
            <Redirect href={{
                pathname: "/(tabs)/household/create" as RelativePathString,
                params: { newUser: 'true' }
            }} />
        )
    }

    if (!!prefetchedHouseholds) {
        //map household data to user household data via the joint table data returned
        const mapping = (prefetchedHouseholds?.user_households ?? []).reduce((acc: any, curr: any) => {
            // find the related household in the prefetched data
            const household = (prefetchedHouseholds?.households ?? []).find((household) => household.id === curr.household_id);
            if (household) {
                acc[household.id] = {
                    household,
                    relation: curr,
                    householdProfiles: (prefetchedHouseholds?.profiles ?? []).filter((profile) => profile.household_id === household.id),
                };
            }
            return acc;
        }, {});

        // update state
        if (!!mapping) setMappedHouseholds(mapping);
    }
    const getNextLink = async () => {
        let pathname = "/(tabs)/household" as RelativePathString;
        let routeParams = { household_id: "", newUser: 'true', action: 'join' };

        const linkingURL = await Linking.getInitialURL()
        //parse the linking URL to get the household id
        if (!!linkingURL) {
            const parsedLink = Linking.parse(linkingURL) || null;
            // const queryParams = await Linking.parse(url.toString())
            if (parsedLink) {
                const { queryParams, hostname, scheme, path } = parsedLink || null;
                //check if household_id is in the query params
                if (queryParams && Object.keys(queryParams).length > 0 && "household_id" in queryParams) {

                }
                    pathname = pathname + "[household_id]" as RelativePathString;
                    routeParams.household_id = householdIdFromLink;
                    routeParams.newUser = 'true';
                    routeParams.action = 'join';
                    //check if the household id is in the mapped households

                }
            } else {
                pathname = pathname + "/create" as RelativePathString;
                // routeParams.household_id = "create";

            }

            return { pathname, routeParams, originalURL: linkingURL };
        }

        const existingHouseholds = () => {
            const { pathname, routeParams, originalURL } = getNextLink();

            return pathname.endsWith('/join') ? (

                <ComponentCard
                    title="Join Household"
                    description="You can join an existing household."
                    icon={<House size={40} color="#000" />}
                    url={require('@/assets/auth/forget.png')}
                    onPress={() => {
                        router.push({
                            pathname: "/(tabs)/household/join",
                            params: { newUser: 'true' }
                        })
                    }}
                />
            ) :
                (
                    <ComponentCard
                        title="Household"
                        description="You are already a member of this household. You can continue creating your household or join an existing one."
                        icon={<HouseIcon size={40} color="#000" />}
                        url={require('@/assets/auth/register.png')}
                        onPress={() => {
                            router.push({
                                pathname: "/(tabs)/household/create",
                                params: { newUser: 'true' }
                            })
                        }}
                    />)
        }



        return (
            <DashboardLayout>
                {mappedHouseholds ?
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            paddingBottom: 20,
                        }}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        style={{
                            width: "100%",
                            paddingHorizontal: 20,
                        }}
                    >

                        {
                            Object.entries(mappedHouseholds).map(([key, value]) => {
                                const DynamicIcon = value?.household?.styling?.icon_name
                                    ? require("lucide-react-native")[value.household.styling.icon_name]
                                    : HouseIcon;
                                return (
                                    <ComponentCard
                                        key={key}
                                        title={value?.household?.name}
                                        description={value?.household?.description}
                                        showIcon={true}
                                        icon={<DynamicIcon />}
                                        url={value?.household?.media?.url ?? `${process.env.EXPO_RANDOM_AVATAR_API}/username?username=${value?.household?.name.replace(" ", "+")}`}
                                        darkUrl={value?.household?.media?.darkUrl ?? `${process.env.EXPO_RANDOM_AVATAR_API}/username?username=${value?.household?.name.replace(" ", "+")}`}
                                        onPress={() => {
                                            router.push({
                                                pathname: "/(tabs)/household/[household_id]" as RelativePathString,
                                                params: { household_id: value?.household?.id, newUser: 'true' },
                                            })
                                        }}
                                    />
                                )
                            })}
                    </ScrollView>
                    : null}
            </DashboardLayout>
        )

    }