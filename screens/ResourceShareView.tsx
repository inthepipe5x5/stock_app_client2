import { useEffect, useState } from "react";
import { RelativePathString, router, useLocalSearchParams, usePathname, useSegments } from "expo-router";
import * as Linking from "expo-linking";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { ThemedView } from "@/components/ThemedView";
import { Database } from "@/lib/supabase/dbTypes";
import InviteUserModal from "@/components/navigation/InviteUserModal";
import { Heading, CopyIcon } from "lucide-react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { Appearance, FlatList, Keyboard, KeyboardAvoidingView } from "react-native";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import defaultSession, { userProfile } from "@/constants/defaultSession";
import Colors from "@/constants/Colors";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import * as Clipboard from "expo-clipboard";
import { Toast, useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { Center } from "@/components/ui/center";
import supabase from "@/lib/supabase/supabase";
import { set } from "react-hook-form";
import { HouseholdMemberList } from "./(tabs)/newsfeed/MemberActionCards";

type ResourceShareViewProps = {
    resourceType?: keyof Database['public']['Tables'] | null | undefined;
    resourceId?: { key: string, value: string } | null | undefined;
    link?: RelativePathString | null | undefined;
};

export default function ResourceShareView(props: ResourceShareViewProps) {
    const currentPath = usePathname();
    const params = useLocalSearchParams();
    const segments = useSegments();
    const toast = useToast();
    const { household_id } = params;
    const [householdId, setHouseholdId] = useState<string | null>(null);
    const [resourceType, setResourceType] = useState<keyof Database['public']['Tables'] | null>(props?.resourceType ?? null);
    const [deepLink, setDeepLink] = useState<string | null>(props?.link ?? null);
    const [searchField, setSearchField] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const qc = useQueryClient();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const globalContext = useUserSession();
    const { state } = globalContext || defaultSession;
    const colorScheme = (state?.user?.preferences?.theme) === "system" ? (Appearance.getColorScheme() ?? "light") : state?.user?.preferences?.theme ?? "light";
    const colors = Colors[colorScheme as keyof typeof Colors];

    useEffect(() => {
        console.log("ResourceShareView params", params);
        setHouseholdId(
            !!household_id ? (Array.isArray(household_id) ? household_id[0] : household_id) : null
        );

        // determine resource type from params or segments
        if (!!params?.resourceType) {
            setResourceType(Array.isArray(params.resourceType) ? params?.resourceType?.[0] as keyof Database['public']['Tables'] : params?.resourceType as keyof Database['public']['Tables']);
        } else if (segments.length > 0) {
            const resourceSegment = segments[segments.length - 1];
            const resourceType = resourceSegment.split("/").reverse().find(segment => segment.includes("_id"))?.split("_")[0] as keyof Database['public']['Tables'];
            setResourceType(resourceType);
        }
    }, [params]);



    const createShareLink = (baseLink: RelativePathString | null | undefined = currentPath as RelativePathString, queryParams: any = {
        household_id: householdId,
        resourceType: props.resourceType,
        resourceId: props.resourceId,
    }) => {
        const resourceIdKey = `${props.resourceType}_id`;
        const inviteParams = {
            household_id: householdId,
            resourceType: props.resourceType,
            resourceId: props.resourceId,
            [props.resourceId?.key ?? resourceIdKey]: props.resourceId?.value,
            action: 'join',
            ...queryParams,
        };

        const path = !!baseLink ? baseLink : `/(tabs)/(search)/${queryParams.resourceType}/${queryParams.resourceId}`;

        return Linking.createURL(path, { queryParams: inviteParams });
    };

    const handleShare = async () => {
        const link = createShareLink();
        setDeepLink(link);
        // Optionally open the link
        // await Linking.openURL(link);
    };

    if (loading) {
        return (
            <ThemedView className="flex-1 bg-gray-200 opacity-35 justify-center items-center">
                <Center className="opacity-0">
                    <Text className="text-typography-500">Loading...</Text>
                    <Spinner className="mt-2" size="large" color={colors.primary.main} />
                </Center>
            </ThemedView>
        )
    }

    return (
        <ThemedView className="flex-1 bg-gray-200">
            <Button
                onPress={() => setShowInviteModal(true)}
                className="flex-row items-center gap-2"
                variant="outline"
                size="md"
                action="secondary"
            >
                Share Resource
            </Button>

            {/* Invite User Component */}

            <VStack className="flex-1 bg-white p-4">
                <VStack className="gap-2">
                    <Heading size="md" className="text-typography-950">
                        Grow your household
                    </Heading>
                    <Text size="sm" className="text-typography-500">
                        Share this link to invite others to collaborate on this resource.
                    </Text>
                </VStack>
                <VStack className="gap-4 mt-4">
                    <KeyboardAvoidingView behavior="padding" className="flex-1">
                        <Input variant="outline" size="sm" className="flex-1 max-w-72">
                            <InputField value={searchField} editable={false} />
                        </Input>
                        {!!householdId ?
                            <HouseholdMemberList
                                household_id={householdId}
                                currentUser={!!state?.user ? state?.user : null}
                                onSelect={
                                    setSearchField
                                }
                            /> :
                            <Text className="text-typography-500">No members found</Text>}
                    </KeyboardAvoidingView>
                    <Pressable
                        onPress={() => {
                            setLoading(true);
                            if (!deepLink) return;
                            Clipboard.setStringAsync(deepLink);
                            toast.show({
                                placement: "top",
                                duration: 2000,
                                render: (id) => (
                                    <Toast id={String(id)} variant="outline" action="success" className="w-[90%] mx-auto">
                                        <Text className="text-typography-50">Link copied to clipboard</Text>
                                    </Toast>
                                ),
                            });
                            setLoading(false);
                        }}
                        className="h-9 w-9 justify-center items-center border border-outline-300 rounded"
                    >
                        <Icon as={CopyIcon} className="stroke-background-800" />
                    </Pressable>

                </VStack>
                <Button
                    onPress={() => router.canDismiss() ? router.dismiss() : router.back()}
                    className="mt-4"
                    variant="outline"
                    size="md"
                    action="secondary"
                >
                    <ButtonText>Close</ButtonText>
                </Button>
            </VStack>

        </ThemedView >
    );
}