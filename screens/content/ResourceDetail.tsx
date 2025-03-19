import React, { useState, useCallback, useMemo, useContext, createContext } from "react";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { useQuery } from "@tanstack/react-query";
import { Text } from "@/components/ui/text";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Heading } from "@/components/ui/heading";
import MemberActionCards from "../(tabs)/newsfeed/MemberActionCards";
import { S } from "@expo/html-elements";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalHeader } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icon";
import { useLocalSearchParams } from "expo-router";
import DashboardLayout from "../_layout";
import { inventory, product, task, vendor } from "@/constants/defaultSession";
import { createURL, useLinkingURL } from "expo-linking";
import { ResourceActionSheetWrapper, ResourceActionSheetProps, ResourceType, actionType } from "@/components/navigation/ResourceActionSheet";
import supabase from "@/lib/supabase/supabase";
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import { BoxIcon, House, Mail, StoreIcon } from "lucide-react-native";
import { Divider } from "@/components/ui/divider";
export type ResourceDetailParams = {
    isLoading: boolean,
    // resourceId: string,
    fetchFn: (args: any) => any,
    fillerCount?: number,
    props: any,
    resourceType: ResourceType,
    data: Partial<product> | Partial<task> | Partial<inventory> | Partial<vendor> | null | undefined,
    children?: any
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

    const resourcePageContext = createContext({});

    type resourceData = {
        data: Partial<product> | Partial<task> | Partial<inventory> | Partial<vendor> | null | undefined,
        type: ResourceType,
        action?: actionType | null | undefined,
    }

    const updateResource = async (resourceData: resourceData) => {
        if (!!resourceData && !!resourceData.data) {
            setResultData((prevData) => ({ ...prevData, ...resourceData.data }));
            const { data, error } = await supabase
                .from(resourceData.type)
                .update(resourceData)
                .eq('id', resourceData.data.id)
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
            const { data, error } = await supabase.from(currentResource.type).delete().eq('id', resourceData.data.id);

            if (error) {
                console.error("Error deleting resource:", error);
                setModalContent({
                    heading: "Error",
                    subheading: "Error deleting resource",
                    description: "No data available",
                    action: "negative",
                });
                setShowModal(true);
            }
            console.log("Resource deleted:", data);
            return data;
        }
    }


    const resourceContextValue = useMemo(() => ({
        resource: {
            data: resultData,
            type: currentResource.type,
        },
        showActionsheet,
        showModal,

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
                </DashboardLayout>
            </ResourceActionSheetWrapper>
        </resourcePageContext.Provider>
    )
    const useResourceContext = () => useContext(resourcePageContext);
    return useContext(resourcePageContext);
}

export default ResourceDetailPage;