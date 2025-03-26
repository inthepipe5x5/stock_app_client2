import React, { useState, useCallback, useMemo, useContext, createContext, useRef } from "react";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { useQuery } from "@tanstack/react-query";
import { Text } from "@/components/ui/text";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Heading } from "@/components/ui/heading";
import MemberActionCards from "../(tabs)/newsfeed/MemberActionCards";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalHeader } from "@/components/ui/modal";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icon";
import { useLocalSearchParams } from "expo-router";
import DashboardLayout from "../_layout";
import { inventory, product, task, userProfile, vendor } from "@/constants/defaultSession";
import { createURL, useLinkingURL } from "expo-linking";
import { ResourceActionSheetWrapper, ResourceActionSheetProps, ResourceType, actionType } from "@/components/navigation/ResourceActionSheet";
import supabase from "@/lib/supabase/supabase";
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import { BoxIcon, EditIcon, House, Mail, StoreIcon } from "lucide-react-native";
import { Divider } from "@/components/ui/divider";
import { SafeAreaView } from "react-native-safe-area-context";
import { SideBarContentList } from "@/components/navigation/NavigationalDrawer";
import { Animated } from "react-native";
import { Dimensions } from "react-native";
import { Box } from "@/components/ui/box";
import { fakeUserAvatar } from "@/lib/placeholder/avatar";
import { Center } from "@/components/ui/center";
import { Avatar, AvatarBadge, AvatarImage } from "@/components/ui/avatar";
import getRandomHexColor from "@/utils/getRandomHexColor";
import { Image } from "@/components/ui/image";
import { capitalize } from "@/utils/capitalizeSnakeCaseInputName";
import { PostgrestError } from "@supabase/supabase-js";

export type ResourceDetailParams = {
    isLoading: boolean,
    // resourceId: string,
    fetchFn: (args: any) => any,
    fillerCount?: number,
    props: any,
    resourceType: ResourceType,
    data: Partial<product> | Partial<task> | Partial<inventory> | Partial<vendor> | null | undefined,
    children?: any,
    modal?: JSX.Element | null | undefined,
}

const ResourceDetailSkeleton = ({ fillerCount, placeholder }: {
    fillerCount: number, placeholder: {
        header?: string | null | undefined,
        subheader?: string | null | undefined,
        description?: string | null | undefined,
    }
}) => {
    const skeletonArray = Array.from({ length: fillerCount }, (_, i) => i);

    return (
        <VStack className="justify-center align-center">

            <Heading size="md" className="text-typography-500">
                <Spinner /> {!!placeholder?.header ? placeholder?.header : ""}
            </Heading>
            {placeholder?.subheader ? <Text size="md">{placeholder?.subheader}</Text> : null}
            <VStack className="justify-center align-center"></VStack>
            {
                skeletonArray.map((_, index) => (
                    <Skeleton key={index} className="w-full h-12" speed={1}>
                        <VStack className="w-full h-full">
                            <HStack className="w-full h-full">
                                {placeholder?.description ? <Text size="sm">{placeholder?.description}</Text> : null}
                                <Spinner className="w-1/4" />
                                <SkeletonText speed={3} className="w-1/2" />
                            </HStack>
                            <SkeletonText speed={1} className="w-3/4" />
                        </VStack>
                    </Skeleton>
                ))
            }
        </VStack >
    );
}

//for products/tasks/inventories

type ResourceModalProps = {
    visible: boolean;
    onClose: () => void;
    children: any;
    content: {
        heading?: string | null | undefined;
        subheading?: string | null | undefined;
        description?: string | null | undefined;
        action?: "primary" | "secondary" | "positive" | "negative" | "default";
    };
};

export const ResourceModal = ({ visible, onClose, children, content }: ResourceModalProps) => {
    const { heading, subheading, description, action } = content;
    return (
        <Modal
            isOpen={visible}
            onClose={onClose}
            closeOnOverlayClick={true}
            avoidKeyboard={true}
        >
            <ModalBackdrop />
            <ModalContent>
                <ModalHeader>
                    <HStack className="justify-between align-center">
                        <Heading size="md">{heading ?? "Resource heading"}</Heading>
                        <Button variant="outline" onPress={onClose} action={action ?? "primary"}>
                            <CloseIcon />
                        </Button>
                    </HStack>
                </ModalHeader>
                <ModalBody>
                    <VStack className="justify-center align-center">
                        <Text size="md">{subheading ?? "Resource subheading"}</Text>
                        <Text size="sm">{description ?? "Resource description"}</Text>
                        {children}
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}


export const ResourceLayout = ({ children, SideBarContent, ...props }: any) => {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showDrawer, setShowDrawer] = useState<boolean>(false);

    return (
        <SafeAreaView>
            <DashboardLayout>
                <VStack className="h-full w-full mb-16 md:mb-0">

                    {/* <SideBar visible={showDrawer} /> */}

                    {/* <ResourceModal visible={showModal} onClose={() => setShowModal(false)}>
                <VStack className="justify-center align-center">
                {children}
                </VStack>
                </ResourceModal> */}

                    {children}
                </VStack>
            </DashboardLayout>
        </SafeAreaView >
    )
}

export const ResourceDetail = ({ isLoading, data, resourceType, fillerCount, children, ...props }: ResourceDetailParams) => {

    const DefaultResourceDetail = ({ data, resourceType }: { data: Partial<product> | Partial<task> | Partial<inventory> | Partial<vendor> | null | undefined, resourceType: ResourceType }) => {
        let badgeIcon = (<BoxIcon />);
        let nameKey = "name";
        let badgeColor = "blue"
        let draftStatus = "draft";
        switch (resourceType) {
            case "product":
                nameKey = "product_name";
                badgeColor = "green";
                badgeIcon = (<BoxIcon />);
                break;
            case "task":
                nameKey = "task_name";
                badgeColor = "blue";
                badgeIcon = (<Mail />);
                break;
            case "inventory":
                nameKey = "name";
                badgeColor = "grey";
                badgeIcon = (<House />);
                break;
            case "vendor":
                nameKey = "name";
                badgeColor = "yellow";
                badgeIcon = (<StoreIcon />);
                break;
            default:
                nameKey = "name";
                badgeColor = "grey";
                badgeIcon = (<BoxIcon />);
                break;
        }

        switch (data?.draft_status ?? "archived") {
            case "published":
                badgeColor = "blue";
                break;
            case "archived":
                badgeColor = "yellow";
                break;
            case "confirmed":
                badgeColor = "green";
                break;
            case "deleted":
                badgeColor = "red";
                break;
            default:
                badgeColor = "grey";
                break;
        }

        if (!!data) {
            return (
                <VStack className="justify-center align-center">
                    <HStack className="justify-between align-center">
                        <Heading size="md">{(data as any)[nameKey] ?? "Name"}</Heading>
                        <Badge className={`bg-${badgeColor}-500`}>
                            <BadgeText> {resourceType} </BadgeText>
                            {!!badgeIcon ? badgeIcon : (<BoxIcon />)}
                        </Badge>
                    </HStack>
                    <Divider className="w-full" />
                    <Text size="md">{data.description}</Text>
                </VStack>
            )
        }
        return (
            <VStack className="justify-center align-center">
                <HStack className="justify-between align-center">
                    <Text size="md"><SkeletonText speed={4} gap={2} /></Text>
                    <Badge className="bg-grey-500">
                        <Spinner size="large" />
                    </Badge>
                </HStack>
            </VStack>
        )
    };

    return (
        <VStack className="justify-center align-center">
            {
                //render resource detail if data is available, else show skeleton
                !!!isLoading ? !!(children) ?
                    (<VStack className="justify-center align-center">
                        <DefaultResourceDetail
                            data={data}
                            resourceType={resourceType ?? "product"} />
                        (children)
                    </VStack>
                    )
                    : (
                        <DefaultResourceDetail data={data} resourceType={resourceType ?? "product"} />
                    )
                    : ResourceDetailSkeleton({ fillerCount: fillerCount ?? 5, placeholder: { header: "Resource header", subheader: "Resource subheader", description: "Resource description" } })
                // (
                //     skeletonArray.map((_, index) => (
                //         <Skeleton key={index} className="w-full h-12" speed={1}>
                //             <VStack className="w-full h-full">
                //                 <HStack className="w-full h-full">
                //                     <Spinner className="w-1/4" />
                //                     <SkeletonText speed={3} className="w-1/2" />
                //                 </HStack>
                //                 <SkeletonText speed={1} className="w-3/4" />
                //             </VStack>
                //         </Skeleton>
                //     ))
                // )
            }
        </VStack>
    );
}

const ResourceContentTemplate = (
    { resource, onEditButtonPress, keys, resourceType }:
        {
            resource: Partial<userProfile | inventory | task | product | vendor>,
            onEditButtonPress: (args: any) => any,
            resourceType: ResourceType,
            keys?: Partial<{
                nameKey?: Partial<keyof userProfile | keyof inventory | keyof task | keyof product | keyof vendor>,
                descriptionKey?: Partial<keyof userProfile | keyof inventory | keyof task | keyof product | keyof vendor>,
                imageURIKey?: Partial<keyof userProfile | keyof inventory | keyof task | keyof product | keyof vendor>,
                bannerURIKey?: string | Partial<keyof userProfile | keyof inventory | keyof task | keyof product | keyof vendor>,
            }> | null | undefined
        }
) => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const windowDimensions = useRef(Dimensions.get('window'));
    const { height: windowHeight, width: windowWidth } = windowDimensions.current;

    const translateY = scrollY.interpolate({
        inputRange: [0, ((windowHeight * 0.3) + 100)], // Header moves out of view when scrolling down //[triggerHeight, triggerHeight + 100],
        outputRange: [(windowHeight * 0.3 + 100), 0], // Header moves into view when scrolling up //[0, 100],
        extrapolate: 'clamp',
    });
    //generate image URI if falsy
    const imageURI = keys?.imageURIKey ?? fakeUserAvatar(
        {
            name: (resource as any)?.name ?? (resource as any)?.product_name ?? "Resource",
            size: 24,
            avatarBgColor: getRandomHexColor() ?? 'ffe0c2',
            fontColor: '#1f160f'
        }
    )
    //generate banner URI if falsy
    const bannerURI = keys?.bannerURIKey ?? fakeUserAvatar(
        {
            name: (resource as any)?.name ?? (resource as any)?.product_name ?? "Resource",
            size: 24,
            avatarBgColor: getRandomHexColor() ?? 'ffe0c2',
            fontColor: '#1f160f'
        }
    )

    //generate the resource stats
    const resourceStats = [];
    switch (resourceType) {
        case "product":
            resourceStats.push({ key: "Price", value: (resource as any)?.price ?? 0 });
            resourceStats.push({ key: "Quantity", value: ((resource as any)?.current_quantity ?? 0) / ((resource as any)?.max_quantity ?? 1) ?? 0 });
            resourceStats.push({ key: "Category", value: (resource as any)?.category ?? "Category" });
            break;
    }


    return (
        <Animated.ScrollView> {/*or regular scroll view*/}
            {/*
            *---------------------------------------------
             * Image header 
             * ---------------------------------------------
             * */}

            <VStack className="h-full w-full py-8" space="2xl">
                <Box className="relative w-full md:h-[478px] h-[380px]">
                    {/* --------------------------------------------
                    *Banner Image
                     * ---------------------------------------------
                     */}
                    <Image
                        source={require(bannerURI ?? "@/assets/image2.png")}
                        className="h-full w-full object-cover"
                        alt="Banner Image"
                    // contentFit="cover"
                    />

                </Box>
                <HStack className="absolute pt-6 px-10 hidden md:flex">
                    <Text className="text-typography-900 font-roboto">
                        home &gt; {` `}
                    </Text>
                    <Text className="font-semibold text-typography-900 ">
                        {//capitalize resource type
                            !!resourceType && typeof resourceType === 'string' ?
                                capitalize(resourceType) :
                                "Resource"
                        }</Text>
                </HStack>
                <Center className="absolute md:mt-14 mt-6 w-full md:px-10 md:pt-6 pb-4">
                    <VStack space="lg" className="items-center">
                        {/* --------------------------------------------
                        *Resource Image
                         * ---------------------------------------------
                         */}
                        <Avatar size="2xl" className="bg-primary-600">
                            <AvatarImage
                                alt="Profile Image"
                                className="h-full w-full"
                                source={require(imageURI ?? "@/assets/image3.png")}
                            />
                            <AvatarBadge />
                        </Avatar>
                        <VStack className="gap-1 w-full items-center">
                            <Text size="2xl" className="font-roboto text-dark">
                                {(resource as any)?.name ?? (resource as any)?.product_name ?? "Resource Name"}
                            </Text>
                            <Text className="font-roboto text-sm text-typography-700">
                                {resourceType === 'profile' ? "User" : `${capitalize(resourceType)}`}
                            </Text>
                        </VStack>
                        {
                            //* --------------------------------------------
                            //* Resource Stats
                            // ---------------------------------------------
                            //*
                        }
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
            </VStack>
        </Animated.ScrollView>
    )
}

export type ResourceModalContent = {
    heading?: string | null | undefined;
    subheading?: string | null | undefined;
    description?: string | null | undefined;
    action?: "primary" | "secondary" | "positive" | "negative" | "default";
}
export type ResourceDetailPageParams = {
    resourceId?: string | null | undefined,
    fetchFn: (args: any) => any,
    props: any,
    modal?: Partial<ResourceModalContent> | null | undefined,
}
//create context for resource page child components to access resource data
const resourcePageContext = createContext({});

const ResourceDetailPage = ({ resourceId, fetchFn, modal }: ResourceDetailPageParams) => {
    const [showModal, setShowModal] = useState(false);
    const [showActionsheet, setShowActionsheet] = useState(false);
    const [modalContent, setModalContent] = useState<{
        heading?: string | null | undefined;
        subheading?: string | null | undefined;
        description?: string | null | undefined;
        action?: "primary" | "secondary" | "positive" | "negative" | "default";
    } | null | undefined>(modal ?? null);

    const params = useLocalSearchParams()
    const { id: idArray, type, action, relation } = params;
    const [resultData, setResultData] = useState<Partial<product> | Partial<task> | Partial<inventory> | Partial<vendor> | null | undefined>(null);


    const closeModal = () => { setShowModal(false); setModalContent(null); };   //close modal

    const currentResource = {
        id: resourceId ?? idArray[0],
        type: type[0],
        action: action[0],
        relation: relation[0],
    }
    const resourceData = useQuery({
        queryKey: ['resource', resourceId],
        queryFn: () => fetchFn({ resource_id: resourceId }),
        enabled: !!currentResource.id,
        refetchOnMount: true, //refetch data on mount
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
    })

    if (resourceData.data) {
        setResultData(resourceData.data);
    }

    if (resourceData.error) {
        console.error("Error fetching resource:", resourceData.error);
        // return (
        //     <HStack className="justify-center align-center">
        //         <Text className="text-typography-500">No data available</Text>
        //     </HStack>
        // )
        //show modal
        setModalContent({
            heading: "Error",
            subheading: "Error fetching resource",
            description: "No data available",
            action: "negative",
        });
        setShowModal(true);
    }
    //create context for resource page child components to access resource data
    const resourcePageContext = createContext({});

    type resourceData = {
        data: Partial<product> | Partial<task> | Partial<inventory> | Partial<vendor> | null | undefined,
        type: ResourceType,
        action?: actionType | null | undefined,
    }

    const updateResource = async (resourceData: resourceData, idKey: "id" | "user_id" | "household_id" = "id") => {
        if (!!resourceData && !!resourceData.data) {
            setResultData((prevData) => ({ ...prevData, ...resourceData.data }));
            const { data, error } = await supabase
                .from(resourceData.type)
                .update(resourceData)
                .eq(idKey, resourceData.data.id)
                .select();

            if (error) {
                console.error("Error updating resource:", error);
                setModalContent({
                    heading: "Error",
                    subheading: "Error updating resource",
                    description: "No data available",
                    action: "negative",
                });
                setShowModal(true);
            }
            console.log("Resource updated:", data);
            return data;

        }
    }

    const deleteResource = async (resourceData: resourceData) => {
        if (!!resourceData && !!resourceData.data) {
            setResultData(null);
            const { data: deletedData, error } = await supabase.from(currentResource.type)
                .delete()
                .eq('id', resourceData.data.id)
                .select();

            if (error) {
                console.error(`Unable to delete resource ${{ resourceData }}`, error);
                const errMessage = error?.message ? `deleteResource Fn failed. REASON: ${error.message} ${error?.details ?? ""} ${error?.cause ?? ""}` : "deleteResource Fn failed. No error message available";
                setModalContent({
                    heading: error?.name ?? "Error",
                    subheading: `Error deleting resource ${error?.code ?? error?.hint ?? ""}`,
                    description: Object.keys(error).reduce((accum, nextKey) => {
                        return (error[nextKey as keyof PostgrestError] as unknown as PostgrestError) 
                        && (["message", "detail", "hint"] as string[]).includes(nextKey.toLowerCase()) ? `${accum} ${error[nextKey as keyof PostgrestError] ?? ""}` : accum;
                    },
                        `Unable to delete ${{ type }} resource  ${resourceData.data.id ?? "Resource"}`
                    ),
                    action: "negative",
                });
                setShowModal(true);
                const fnError = new Error(errMessage);
                throw (fnError);
            }
            console.log("Resource deleted:", { deletedData });
            return deletedData;
        }
    }


    const resourceContextValue = useMemo(() => ({
        resource: {
            data: resultData,
            type: currentResource.type,
        },
        showActionsheet,
        setShowActionsheet,
        showModal,
        setShowModal,

        // context: { //include user and household data from global useUserSession context? context 
        //     user: null ?? {},
        //     household: null ?? {},
        // }
        deleteResource,
        updateResource,
        isLoading: resourceData.isLoading ?? false,
        fetchFn: () => { },
        props: {},
    }), [resultData]);


    return (
        <resourcePageContext.Provider value={resourceContextValue}>
            <ResourceActionSheetWrapper {...{
                data: resultData,
                resourceType: currentResource.type,
                userPermissions: {},
                ...resourceContextValue
            }}>
                <DashboardLayout
                    title={currentResource.type}
                    isSidebarVisible={false}
                    dismissToURL="/(tabs)/(dashboard)"
                >
                    <ResourceLayout>
                        <ResourceDetail
                            fetchFn={() => { }}
                            fillerCount={5}
                            props={{}}
                            resourceType="product"
                            isLoading={resourceData.isLoading}
                            data={resultData ?? null}
                        >
                            <ResourceModal
                                visible={showModal}
                                onClose={closeModal}
                                content={modalContent ?? {}}
                            >
                                <VStack className="justify-center align-center">
                                    <Text size="md">Resource data not available</Text>
                                </VStack>
                            </ResourceModal>
                        </ResourceDetail>
                    </ResourceLayout>
                </DashboardLayout>
            </ResourceActionSheetWrapper>
        </resourcePageContext.Provider>
    )

}

//exports
export default ResourceDetailPage;
const useResourceContext = () => useContext(resourcePageContext);
export { useResourceContext, resourcePageContext };