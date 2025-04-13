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
import { RelativePathString, useLocalSearchParams, usePathname, useRouter } from "expo-router";
import DashboardLayout from "../_layout";
import { inventory, product, task, userProfile, vendor } from "@/constants/defaultSession";
import { createURL, useLinkingURL } from "expo-linking";
import { ResourceActionSheetWrapper, ResourceActionSheetProps, ResourceType, actionType } from "@/components/navigation/ResourceActionSheet";
import supabase from "@/lib/supabase/supabase";
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import { BoxIcon, EditIcon, House, Mail, QrCodeIcon, ScanQrCode, StoreIcon } from "lucide-react-native";
import { Divider } from "@/components/ui/divider";
import { SafeAreaView } from "react-native-safe-area-context";
import { SideBarContentList } from "@/components/navigation/NavigationalDrawer";
import { Animated, Appearance, Platform, ScrollView } from "react-native";
import { Dimensions } from "react-native";
import { Box } from "@/components/ui/box";
import { fakeUserAvatar } from "@/lib/placeholder/avatar";
import { Center } from "@/components/ui/center";
import { Avatar, AvatarBadge, AvatarImage } from "@/components/ui/avatar";
import getRandomHexColor from "@/utils/getRandomHexColor";
import { Image } from "@/components/ui/image";
import { capitalize } from "@/utils/capitalizeSnakeCaseInputName";
import { PostgrestError } from "@supabase/supabase-js";
import { fakeProduct, fakeTask } from "@/__mock__/ProductTasks";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { StatusBar } from "expo-status-bar";
import { MobileHeader } from "@/components/navigation/Header";
import { formatDatetimeObject } from "@/utils/date";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import Colors from "@/constants/Colors";
import { isWeb } from "@gluestack-ui/nativewind-utils/IsWeb";
import { viewPort } from "@/constants/dimensions";
import QRCode from 'react-native-qrcode-svg';
import * as Linking from "expo-linking";

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

/**Invite Share Card Component
 * 
 * @param props 
 * @returns Invite Share Card Component
 */
export const InviteShareComponent = (props: {
    onInvite: (args: any) => void;
    onShare: (args: any) => void;
    onQR: (args: any) => void;
    qrCode?: string;
    currentPath: string;
    ResourceQR?: JSX.Element | null | undefined;
}) => {
    const createQRCode = (value: string) => {
        return (
            <QRCode
                value={value}
                size={50}
                backgroundColor={Appearance.getColorScheme() === 'light' ? '#b3b3b3' : '#fbfbfb'} //Colors[Appearance.getColorScheme() ?? "light"].background,
                color={Appearance.getColorScheme() !== 'light' ? 'black' : 'white'} //Colors[Appearance.getColorScheme() ?? "light"].background,
            />
        )
    }


    return (
        <HStack
            className="py-5  px-6 justify-between items-center rounded-2xl"
            space="2xl"
            style={{
                backgroundColor: Appearance.getColorScheme() === 'light' ? '#b3b3b3' : '#fbfbfb' //Colors[Appearance.getColorScheme() ?? "light"].background,
                ,
                backgroundSize: "cover",
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.5,
                shadowRadius: 4.65,
                elevation: Platform.OS === 'android' ? 6 : 0, // For Android
            }}
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



export const ResourceContentTemplate = (
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

    // React.useEffect(() => {

    // }, []);

    return (
        <DashboardLayout>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: isWeb ? 0 : 160,
                    // paddingTop: 70,
                    paddingHorizontal: 10,
                    flexGrow: 1,
                    borderWidth: 8,
                    backgroundColor: Colors[Appearance.getColorScheme() ?? "light"].primary.main,
                    //"#3d1e00", //Colors[Appearance.getColorScheme() ?? "light"].background,
                    // backgroundSize: "cover",
                    // backgroundClip: "clip",
                    // backgroundAttachment: "fixed",
                    // backgroundPosition: "center",
                    // backgroundRepeat: "no-repeat",
                    // backgroundOrigin: "content-box",
                    // backgroundSize: "cover",
                    // backgroundColor: '#fff', // Required for shadows to work

                }}
            >
                {/*
            *---------------------------------------------
             * Image header 
             * ---------------------------------------------
             * */}
                <StatusBar style="auto" />

                <VStack className="h-full w-full py-8 rounded-lg" space="2xl"
                    style={{
                        backgroundColor: Appearance.getColorScheme() === 'light' ? '#9999999' : '#fbfbfb', //Colors[Appearance.getColorScheme() ?? "light"].background,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.5,
                        shadowRadius: 4.65,
                        elevation: Platform.OS === 'android' ? 6 : 0, // For Android
                    }}
                >
                    <Box className="relative w-full md:h-[478px] h-[380px] bg-banner object-cover"

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
                    <Center className="absolute md:mt-14 mt-6 w-full md:px-10 md:pt-6 pb-4">
                        <VStack space="lg" className="items-center">
                            {/* --------------------------------------------
                        *Resource Image
                         * ---------------------------------------------
                         */}
                            <HStack space="2xl" className="align-center justify-start w-full">
                                <Avatar size="md" className="bg-primary-600 pr-1">
                                    <AvatarImage
                                        alt="Profile Image"
                                        className="h-full w-full"
                                        source={{
                                            uri: `https://avatar.iran.liara.run/username?username=${(resource as any)?.name ?? (resource as any)?.product_name ?? "Fake Name"
                                                }`
                                        }}
                                        defaultSource={5}
                                    />
                                    <AvatarBadge />
                                </Avatar>
                                {
                            /* --------------------------------------------
                            *Resource Title & Subtitle
                         * ---------------------------------------------
                            */}
                                <VStack className="gap-1">
                                    <Text size="2xl" className="font-roboto text-dark">
                                        {title ?? (resource as any)?.name ?? (resource as any)?.product_name ?? "Resource Name"}
                                    </Text>
                                    <Text className="font-roboto text-sm text-typography-700">
                                        {subtitle ?? (resourceType === 'profile' ? "User" : `${capitalize(resourceType)}`)}
                                    </Text>
                                </VStack>
                            </HStack>
                            <Button
                                variant="solid"
                                action="secondary"
                                onPress={(e: any) => onEditButtonPress(e)}
                                className="gap-3 relative"
                                style={{
                                    backgroundColor: Appearance.getColorScheme() === 'light' ? Colors.light.primary.main : Colors.dark.primary.main,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 3 },
                                    shadowOpacity: 0.5,
                                    shadowRadius: 4.65,
                                    elevation: Platform.OS === 'android' ? 6 : 0, // For Android
                                }}
                            >
                                <ButtonText className="text-dark">Edit {`${capitalize(resourceType)}`}</ButtonText>
                                <ButtonIcon as={EditIcon} />
                            </Button>
                            <>
                                <HStack className=" mx-1 px-1 items-center gap-3 flex-wrap justify-evenly w-full">
                                    {
                                        //* --------------------------------------------
                                        //* Resource Stats
                                        // ---------------------------------------------
                                        //*
                                        !!resourceStats ? resourceStats?.map((stat, index) => {
                                            return ![resourceStats.length - 1].includes(index) ?
                                                (<>
                                                    <VStack className="py-3 px-2 items-center " space="xs">
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
                                                    <VStack className="py-3 px-2 items-center " space="xs">
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

                        </VStack>
                    </Center>

                    <VStack className="mx-6 bg-slate-100 border-collapse" space="xl"
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
                                onQR={() => {
                                    toast.show({
                                        duration: 5000,
                                        placement: "bottom",
                                        render: ({ id }) => {
                                            return (
                                                <Toast id={id} variant="solid" action="success">
                                                    <HStack className="gap-2 flex-1" space="md">
                                                        <Button
                                                            variant="outline"
                                                            action="primary"
                                                            onPress={() => {
                                                                toast.close(id);
                                                                router.push({
                                                                    pathname: "/(scan)",
                                                                    params: {
                                                                        type: "qr",
                                                                        id: resourceId,
                                                                    }
                                                                })
                                                            }
                                                            }
                                                        >
                                                            <ButtonIcon as={QrCodeIcon} className="text-dark" />
                                                            <ButtonText>
                                                                Confirm Redirect
                                                            </ButtonText>
                                                        </Button>
                                                        <VStack className="gap-2 mr-auto px-2">
                                                            <ToastTitle action="success" variant="solid">QR Code Scanned</ToastTitle>
                                                            <ToastDescription size="sm">Confirm if you would like to be redirected</ToastDescription>
                                                        </VStack>
                                                    </HStack>
                                                </Toast>
                                            )
                                        }
                                    })
                                }}
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
                        <VStack className="px-6 py-2 max-w-full rounded-2xl" space="2xl"
                            style={{
                                backgroundColor: Appearance.getColorScheme() === 'light' ? '#b3b3b3' : '#fbfbfb' //Colors[Appearance.getColorScheme() ?? "light"].background,
                                ,
                                backgroundSize: "cover",
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 3 },
                                shadowOpacity: 0.5,
                                shadowRadius: 4.65,
                                elevation: Platform.OS === 'android' ? 6 : 0, // For Android
                            }}
                        >
                            {
                                sections?.map((section, index) => {
                                    return (
                                        <>

                                            <VStack key={`${index}-${section.title}`} className="gap-2">
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
        </DashboardLayout>
    )
    {/* </Animated.ScrollView> */ }
}


export function TestResourceDetailPage() {
    const resource = fakeProduct;
    const task = fakeTask;
    const toast = useToast();
    const router = useRouter();
    // const placeholderImages = 
    const [isOwner, setIsOwner] = React.useState<boolean>(false); //this is just a placeholder for debugging, should be moved to the resource template level

    return (
        <DashboardLayout>
            <StatusBar style="light" />
            <MobileHeader
                title={(resource as any)?.name ?? "Resource Name"}
                icon={BoxIcon}
            />
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
                // bannerURI={"https://unsplash.com/photos/snow-covered-mountains-under-a-clear-bright-sky-cNb7hPlkItg"}
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
                        children:
                            (
                                <VStack className="gap-2"
                                    style={{
                                        backgroundColor: Appearance.getColorScheme() === 'light' ? '#b3b3b3' : '#fbfbfb',

                                    }}
                                >
                                    {
                                        resource.scan_history && Object.keys(resource.scan_history).length > 0 ?
                                            (Object.entries(resource.scan_history)).map(([scannedDate, scanDetails], index, array) => {
                                                return (
                                                    <HStack key={`${index}-${scannedDate}`} className="gap-2">
                                                        <Text>{formatDatetimeObject(new Date(scannedDate))}</Text>
                                                        <Text>{scanDetails.scanned_by}</Text>
                                                        <Text>{scanDetails.scan_location}</Text>
                                                    </HStack>
                                                )
                                            }) : (
                                                <VStack className="gap-2">
                                                    <Text className="text-error-900">No scan history available</Text>
                                                </VStack>
                                            )
                                    }
                                </VStack>
                            )
                    },
                    // {
                    //     title: "Tasks",
                    //     children:
                    //         (
                    //             <Pressable
                    //                 onPress={() => {
                    //                     console.log("Task Card Pressed");
                    //                     // router.push({
                    //                     //     pathname: "/(tabs)/(stacks)/[type].[id]" as RelativePathString,
                    //                     //     params: {
                    //                     //         type: "task",
                    //                     //         id: (task as task)?.task_id,
                    //                     //     }
                    //                     // })
                    //                     toast.show({
                    //                         duration: 1000,
                    //                         placement: "bottom",
                    //                         render: ({ id }) => {
                    //                             return (
                    //                                 <Toast id={id} variant="solid" action="success">
                    //                                     <VStack className="gap-2">
                    //                                         <ToastTitle action="success" variant="solid">Task Card Pressed</ToastTitle>
                    //                                         <ToastDescription size="sm">Task card was pressed</ToastDescription>
                    //                                     </VStack>
                    //                                 </Toast>
                    //                             )
                    //                         }
                    //                     })
                    //                 }
                    //                 }               >

                    //                 {/* {
                    //                     CompactContentCard({
                    //                         ...mapSingleProductToContentCard(task),
                    //                         badge: mapSingleProductToContentCard(task).badge ? (
                    //                             <Badge
                    //                                 action={mapSingleProductToContentCard(task).badge?.badgeType}
                    //                             >
                    //                                 <BadgeIcon as={mapSingleProductToContentCard(task).badge?.Icon} />
                    //                                 <BadgeText>{mapSingleProductToContentCard(task).badge?.text}</BadgeText>
                    //                             </Badge>
                    //                         ) : null,
                    //                     })
                    //                 } */}
                    //             </Pressable>
                    //         )
                    // }
                ]}
            />

            < VStack
                className={
                    cn(
                        "bg-background-0 justify-between w-full absolute left-0 bottom-0 right-0 p-3 overflow-hidden items-center border-t-border-300  md:hidden border-t",
                        {
                            "pb-5": Platform.OS === "ios"
                        },
                        { "pb-5": Platform.OS === "android" }
                    )}
            >

                {/* <Banner
                    bannerLink="https://unsplash.com/photos/snow-covered-mountains-under-a-clear-bright-sky-cNb7hPlkItg"
                    bannerText="Product Details"
                    bannerLinkText="Product details and inventory"

                /> */}

                {/* <VStack
                    className="gap-2 fixed bottom-0 left-0 right-0 bg-background-0 p-4 border-t border-border-300 shadow-lg"
                > */}
                <HStack space='xs' className="w-full justify-between items-center">
                    <Button
                        variant="solid"
                        action={isOwner ? "primary" : "secondary"}
                        onPress={(e: any) => {
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
                        className="gap-3 relative "
                        style={{
                            // backgroundColor: Appearance.getColorScheme() === 'light' ? Colors.light.primary.main : Colors.dark.primary.main,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.5,
                            shadowRadius: 4.65,
                            elevation: Platform.OS === 'android' ? 6 : 0, // For Android
                        }}
                    >
                        <ButtonIcon as={EditIcon} />
                    </Button>
                    <Button
                        style={{
                            // backgroundColor: Appearance.getColorScheme() === 'light' ? Colors.light.primary.main : Colors.dark.primary.main,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.5,
                            shadowRadius: 4.65,
                            elevation: Platform.OS === 'android' ? 6 : 0, // For Android
                        }}
                        variant="solid"
                        action="positive"
                        className="w-[80%] px-safe-offset-1 active:bg-background-0 md:bg-background-900"
                        onPress={() => {
                            toast.show({
                                duration: 1000,
                                placement: "bottom",
                                render: ({ id }) => {
                                    return (
                                        <Toast id={id} variant="solid" action="success">
                                            <VStack className="gap-2">
                                                <ToastTitle action="success" variant="solid">Scan Button Pressed</ToastTitle>
                                                <ToastDescription size="sm">Scan button was pressed</ToastDescription>
                                            </VStack>
                                        </Toast>
                                    )
                                }
                            })

                            router.push({
                                pathname: "/(scan)"
                            })
                        }}
                    >
                        <ButtonIcon as={ScanQrCode} />
                        <ButtonText className="text-typography-100">Scan Now</ButtonText>
                    </Button>
                </HStack>
                {/* </VStack> */}
            </VStack >
        </DashboardLayout >
    )
}

//exports
export default ResourceDetailPage;
const useResourceContext = () => useContext(resourcePageContext);
export { useResourceContext, resourcePageContext };