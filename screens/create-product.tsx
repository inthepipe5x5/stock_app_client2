import { ThemedView } from "@/components/ThemedView";
import { Text } from "@/components/ui/text";
import {
    Button,
    ButtonText,
    ButtonIcon,
    ButtonSpinner,
} from "@/components/ui/button";
import { Appearance, Image as RNImage } from "react-native";
import { useRef, useState } from "react";
import { ArrowLeftCircle, ArrowRightCircle, Camera, CameraOff, CircleX, Images } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Redirect, RelativePathString, router, useLocalSearchParams } from "expo-router";
import { Database } from "@/lib/supabase/dbTypes";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { FloatingFooter } from "@/components/navigation/Footer";
import SubmitButton from "@/components/navigation/SubmitButton";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import defaultSession from "@/constants/defaultSession";
import ResourceBackgroundMedia from "./content/ResourceBackgroundMedia";
import ImageViewer from "@/components/ImageViewer";
import { Controller, set, useForm } from "react-hook-form";
import GalleryUploader from "./(tabs)/scan/GalleryView";
import { Modal, ModalBackdrop, ModalContent } from "@/components/ui/modal";
import { Pressable } from "react-native";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { FormControl, FormControlError, FormControlLabel } from "@/components/ui/form-control";
import { Divider } from "@/components/ui/divider";
import { Menu, MenuItem } from "@/components/ui/menu";
import { HStack } from "@/components/ui/hstack";
import { useQuery } from "@tanstack/react-query";
import supabase from "@/lib/supabase/supabase";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { CurrentQuantityStatus, UnitMeasurements } from "@/lib/schemas/enums";
import Colors from "@/constants/Colors";
import InventorySelectDropDown from "@/screens/content/inventories/InventorySelect";
// import Product from "./content/products/external/[id]";

const renderPicture = (uri?: string | null) => {
    // const [imageUri, setImageUri] = useState<string | null>(uri ?? null);
    // console.log({ imageUri });

    return (
        <ThemedView className="flex-1 items-center justify-center">
            {uri ? (
                <>
                    <RNImage
                        source={{ uri }}
                        className="w-72 h-72 rounded-lg border-2 border-gray-300"
                        resizeMode="contain"
                    />
                    <Text className="mt-2 text-lg text-gray-800">
                        Photo Preview
                    </Text>
                </>
            ) : (
                <Text className="text-lg text-gray-500">No photo selected</Text>
            )}
            {/* Button to take a picture using the camera or select from the gallery */}

            <Button
                onPress={() => router.push('/(scan)')}
                className="mt-4 bg-blue-500"
            >
                {uri ? (
                    <ButtonSpinner className="text-white" />
                ) : (
                    <ButtonText className={uri ? "text-white" : "text-slate-500"}>Take a picture</ButtonText>
                )}
                <ButtonIcon as={Camera} className={uri ? "text-white" : "text-slate-500"} />
            </Button>

        </ThemedView>
    );
};


export const AddResourceLayout = (props: {
    styling?: {
        primary?: { [key: string]: any };
        secondary?: { [key: string]: any };
        tertiary?: { [key: string]: any };
        footer?: { [key: string]: any };
        related?: { [key: string]: any };
    };
    primarySlot: React.ReactNode;
    secondarySlot?: React.ReactNode;
    tertiarySlot?: React.ReactNode;
    related?: React.ReactNode[]
    footerSlot?: React.ReactNode;
}) => {
    const { styling, primarySlot } = props;

    return (
        <ThemedView
            className={cn("flex-1 items-center justify-center flex-col",
                (props?.secondarySlot || props?.tertiarySlot) ? "lg:flex-row gap-4" : "gap-0",
            )}
            style={styling?.primary ?? {}}
        >
            {primarySlot}

            {props?.secondarySlot ? (
                <ThemedView
                    className="flex-1 items-center justify-center"
                    style={styling?.secondary ?? {}}
                >
                    {props?.secondarySlot}
                </ThemedView>
            ) : null}

            {
                props?.tertiarySlot ? (
                    <ThemedView
                        className="flex-1 items-center justify-center"
                        style={styling?.tertiary ?? {}}
                    >
                        {props?.tertiarySlot}
                    </ThemedView>)
                    : null
            }
            {props?.footerSlot ? (
                <ThemedView
                    className="flex-1 items-center justify-center"
                    style={styling?.footer ?? {}}
                >
                    {props?.footerSlot}
                </ThemedView>
            ) : null
            }
            {props?.related ? (props?.related ?? []).map((related, idx) => (
                <ThemedView
                    key={`${related}-${idx}`}
                    className="flex-1 items-center justify-center"
                    style={styling?.related ?? {}}
                >
                    {props?.related}
                </ThemedView>
            )) : null}
        </ThemedView>
    );
}

export const AddProductForm = (props: { initialData: { [key: string]: any } | null }) => {
    const [product, setProduct] = useState<Partial<Product>>(props?.initialData ?? {});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const globalContext = useUserSession();
    const { household_id, inventory_id } = useLocalSearchParams<{
        household_id: string,
        inventory_id: string
    }>();
    const [selectedInventory, setSelectedInventory] = useState<string>(inventory_id ?? "");
    const handleChange = (key: string, value: any) => {
        setProduct((prev) => ({ ...prev, [key]: value }));
    };
    const form = useForm({
        defaultValues: {
            product_name: product?.product_name ?? "",
            description: product?.description ?? "",
            auto_replenish: product?.auto_replenish ?? false,
            current_quantity: product?.current_quantity ?? 0,
            current_quantity_status: product?.current_quantity_status ?? "full",
            quantity_unit: product?.quantity_unit ?? "pack",
            inventory_id: inventory_id ?? null,
        },
    })

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Submit the product data to the server or database
            // await submitProduct(product);
            console.log("Product submitted:", product);
        } catch (err) {
            setError("Failed to submit product. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    const userHouseholdData = useQuery({
        queryKey: ['households', { user_id: globalContext?.state?.user?.user_id as string }],
    })
    // const userHouseholdData = useQuery({
    //     queryKey: ['households', 'inventories', { user_id: globalContext?.state?.user?.user_id ?? "" }],
    //     queryFn: async () => {
    //         // Fetch the user's household data from the server or database
    //         const { data: households, error } = await supabase
    //             .from('user_households')
    //             .select('household_id')
    //             .eq('user_id', globalContext?.state?.user?.user_id ?? "")
    //             .order('household_id', { ascending: true });
    //         if (error) {
    //             throw new Error(error.message);
    //         }

    //         const { data: inventories, error: inventoryError } = await supabase
    //             .from('inventories')
    //             .select()
    //             .in('household_id', households.map((household) => household.household_id))
    //             .order('category', { ascending: false });
    //         if (inventoryError) {
    //             throw new Error(inventoryError.message);
    //         }
    //         return { households, inventories };
    //     },
    //     enabled: !!globalContext?.state?.user?.user_id,
    //     refetchOnWindowFocus: false,
    // })

    // return { product, loading, error, handleChange, handleSubmit };
    return (
        <ThemedView className={cn("flex-1 items-center justify-center flex-col")}>
            <VStack className="my-2" space={'lg'}>
                <Heading className="text-2xl font-bold mb-4">Add Product</Heading>
                <ThemedView className="md:mb-3 mb-2 px-1 flex-col">
                    <FormControl>
                        <FormControlLabel>Name</FormControlLabel>
                    </FormControl>
                    <Controller
                        defaultValue={product?.product_name ?? ""}
                        control={form.control}
                        name="product_name"
                        render={({ field: { onChange, value, onBlur } }) => (
                            <Input
                                className="flex-row min-w-[300px] w-max md:max-w-[300px] h-full"
                            >
                                <InputSlot className="flex-start">
                                    <Pressable
                                        onPress={() => {
                                            handleChange("product_name", "");
                                            form.setValue("product_name", "")
                                        }}>
                                        <InputIcon as={CircleX} />
                                    </Pressable>
                                </InputSlot>
                                <InputField
                                    className="flex-1"
                                    placeholder="Product Name"
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={(text: string) => {
                                        onChange(text);
                                        ;
                                    }}
                                    onSubmitEditing={(text) => handleChange("product_name", text)}
                                    type="text"
                                    autoCapitalize="words"
                                    autoCorrect={true}
                                />
                            </Input>
                        )}
                    />
                    <FormControlError>
                        {typeof form?.formState?.errors?.product_name?.message === 'string'
                            ? form?.formState?.errors?.product_name?.message
                            : null}
                    </FormControlError>
                </ThemedView>
                <Divider className="w-[90%] align-top justify-center" />
                <ThemedView className="md:mb-3 mb-2 px-1 flex-col">
                    {/* <Menu
                        selectionMode="single"
                        closeOnSelect={true}
                        onSelectionChange={(selectedKeys) => {
                            handleChange("inventory_id", Array.from(selectedKeys)?.[0])
                        }}
                        selectedKeys={!!userHouseholdData?.data?.inventories ? userHouseholdData?.data?.inventories?.map((inventory) => inventory?.id)?.[0] : undefined}
                        disabledKeys={!!userHouseholdData?.data?.inventories ? userHouseholdData?.data?.inventories?.map((inventory) => inventory?.id)?.[0] : undefined}
                        placement="bottom"
                        accessibilityViewIsModal={true}
                        className="flex-row items-center justify-start w-full h-full flex-1 flex-grow"
                        trigger={() =>
                        (<Pressable className="flex-col gap-1 items-center justify-between w-full h-full border-y-0">
                            <HStack className="items-center justify-start w-full h-full">
                                <Badge />
                                <Heading className="ml-auto text-lg font-bold mb-2">Product Type</Heading>
                            </HStack>
                            <Text>
                                Product Type
                            </Text>
                        </Pressable>)
                        }
                    >
                        {!!userHouseholdData?.data ? userHouseholdData?.data?.inventories?.map((inventory) => (
                            <MenuItem
                                key={inventory?.id}
                                onPress={() => handleChange("product_type", inventory?.id)}
                            >
                                <Text>{inventory?.name ?? inventory?.product_category}</Text>
                            </MenuItem>
                        )) :
                            <ThemedView className="flex-1 items-center justify-center flex-col">
                                <Spinner size={"large"} color="blue.500" />
                            </ThemedView>}
                    </Menu> */}
                    <InventorySelectDropDown
                        selectedInventory={selectedInventory}
                        setSelectedInventory={setSelectedInventory}
                        householdId={household_id}
                    />
                </ThemedView>
                <Divider className="w-[90%] align-top justify-center" />
                <ThemedView className="md:mb-3 mb-2 px-1 flex-col">
                    <FormControl>
                        <FormControlLabel>Product Description</FormControlLabel>
                    </FormControl>
                    <Controller
                        defaultValue={product?.description ?? ""}
                        control={form.control}
                        name="description"
                        render={({ field: { onChange, value, onBlur } }) => (
                            <Input
                                className="flex-row min-w-[300px] w-max md:max-w-[300px] h-full"
                            >
                                <InputSlot className="flex-start">
                                    <Pressable
                                        onPress={() => {
                                            handleChange("description", "");
                                            form.setValue("description", "")
                                        }}>
                                        <InputIcon as={CircleX} />
                                    </Pressable>
                                </InputSlot>
                                <InputField
                                    className="flex-1 m-2"
                                    placeholder="Product Description"
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={(text: string) => {
                                        onChange(text);
                                    }}
                                    onSubmitEditing={(text) => handleChange("description", text)}
                                    type="text"
                                    autoCapitalize="sentences"
                                    autoCorrect={true}
                                />
                            </Input>
                        )}
                    />
                </ThemedView>
                <Divider className="w-[90%] align-top justify-center" />
                <ThemedView className="md:mb-3 mb-2 px-1 flex-col">
                    <HStack space={"md"} className="justify-start items-center w-full h-full flex-1 flex-grow">
                        <Switch
                            value={product?.auto_replenish ?? false}
                            onValueChange={(value) => {
                                handleChange("auto_replenish", value);
                            }}
                            className="mr-auto flex-start"
                        />
                        <Text className="text-lg font-bold mb-2">Auto Replenish</Text>
                    </HStack>
                    <Text className="text-gray-500 mb-2">Enable auto-replenish for this product</Text>
                    {/* <FormControlLabel>Replenish Quantity</FormControlLabel> */}

                </ThemedView>
                <Divider className="w-[90%] align-top justify-center" />
                <ThemedView className="md:mb-3 mb-2 px-1 flex-col md:flex-row">
                    <FormControlLabel>Product Status</FormControlLabel>
                    <Menu
                        selectionMode="single"
                        closeOnSelect={true}
                        onSelectionChange={(selectedKeys) => {
                            handleChange("current_quantity_status", Array.from(selectedKeys)?.[0])
                        }}
                        selectedKeys={form.getValues("current_quantity_status")}
                        disabledKeys={form.getValues("current_quantity_status")}
                        placement="bottom"
                        accessibilityViewIsModal={true}
                        className="flex-row items-center justify-start w-full h-full flex-1 flex-grow"
                        trigger={() =>
                        (<Pressable className="flex-col gap-1 items-center justify-between w-full h-full border-y-0">
                            <HStack className="items-center justify-start w-full h-full">
                                <Badge />
                                <Heading className="ml-auto text-lg font-bold mb-2">Product Status</Heading>
                            </HStack>
                            {/* <Text>
                                Product Type
                            </Text> */}
                        </Pressable>)
                        }
                    >
                        {CurrentQuantityStatus.map((unit: string, idx: number) => (
                            <MenuItem
                                key={`${unit}-${idx}`}
                                onPress={() => handleChange("quantity_unit", unit)}
                            >
                                <Text>{unit}</Text>
                            </MenuItem>
                        ))}
                    </Menu>
                    <ThemedView className="md:mb-3 mb-2 px-1 flex-col">
                        <ThemedView className="flex-row items-center justify-start w-full h-full flex-1 flex-grow gap-4 space-evenly">
                            <Pressable>
                                <ArrowLeftCircle
                                    disabled={!product?.current_quantity || product?.current_quantity === 0}
                                    onPress={() => {
                                        if (!!product?.current_quantity && product?.current_quantity > 1)
                                            handleChange("current_quantity", product?.current_quantity ? product?.current_quantity - 1 : 0);
                                        else handleChange("current_quantity", 0);
                                    }}
                                    className={!!product?.current_quantity || product?.current_quantity === 0 ? "text-background-muted" : "text-blue-500"}
                                    size={48}
                                />
                                <Text className="text-lg font-bold mb-2">{product?.current_quantity ?? 0}</Text>
                                <ArrowRightCircle
                                    onPress={() => {
                                        handleChange("current_quantity", product?.current_quantity ? product?.current_quantity + 1 : 1);
                                    }}
                                    className="text-blue-500"
                                    size={48}
                                />
                            </Pressable>
                        </ThemedView>
                        <Menu
                            selectionMode="single"
                            closeOnSelect={true}
                            onSelectionChange={(selectedKeys) => {
                                handleChange("quantity_unit", Array.from(selectedKeys)?.[0])
                            }}
                            selectedKeys={form.getValues("quantity_unit")}
                            disabledKeys={form.getValues("quantity_unit")}
                            placement="bottom"
                            accessibilityViewIsModal={true}
                            className="flex-row items-center justify-start w-full h-full flex-1 flex-grow"
                            trigger={() =>
                            (<Pressable className="flex-col gap-1 items-center justify-between w-full h-full border-y-0">
                                <HStack className="items-center justify-start w-full h-full">
                                    <Badge />
                                    <Heading className="ml-auto text-lg font-bold mb-2">Product Quantity</Heading>
                                </HStack>
                                <Text>
                                    Product Type
                                </Text>
                            </Pressable>)
                            }
                        >
                            {UnitMeasurements.map((unit: string, idx: number) => (
                                <MenuItem
                                    key={`${unit}-${idx}`}
                                    onPress={() => handleChange("quantity_unit", unit)}
                                >
                                    <Text>{unit}</Text>
                                </MenuItem>
                            ))}
                        </Menu>
                    </ThemedView>
                </ThemedView>
            </VStack >
        </ThemedView >
    )
}

type Product = Database["public"]["Tables"]["products"]["Row"]
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"]
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"]

const AddProductScreen = () => {
    const submitBtnRef = useRef<any>(null);
    const globalContext = useUserSession();
    const state = globalContext?.state || defaultSession;
    const dispatch = globalContext?.dispatch || (() => { });

    const [productData, setProductData] = useState<ProductInsert | ProductUpdate | null>(null);
    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [resourceMedia, setResourceMedia] = useState<string[] | null>(null);
    const theme = !!state?.user?.preferences?.theme ?
        (state?.user?.preferences?.theme === 'system' ? Appearance.getColorScheme() : state?.user?.preferences?.theme) :
        Appearance.getColorScheme();
    const colors = Colors[theme ?? 'light'];
    const params = useLocalSearchParams();

    //set the image picker to open the image library
    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            // allowsEditing: true,
            quality: 1,
            allowsMultipleSelection: true,
            selectionLimit: 5
        });

        //on success, updated selected images
        if (!!result?.assets) {
            const selectedMedia = new Set([...(resourceMedia ?? []), ...(result.assets ?? []).map((asset: any) => asset.uri)]);
            setResourceMedia(Array.from(selectedMedia));
        }

    }

    const ImagePreviewWithBadge = ({
        resourceMedia,
        setShowModal,
    }: {
        resourceMedia: string[] | null;
        setShowModal: (show: boolean) => void;
    }) => {
        return (
            <Pressable
                onPress={() => setShowModal(true)}
                className="relative w-full h-64 items-center justify-center"
            >
                {resourceMedia?.[0] ? (
                    <RNImage
                        source={{ uri: resourceMedia[0] }}
                        className="w-full h-full rounded-lg"
                        resizeMode="contain"
                    />
                ) : (
                    <ThemedView className="w-full h-full items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                        <Text className="text-gray-500">Select a photo</Text>
                    </ThemedView>
                )}
                {resourceMedia?.length ? (
                    <Badge
                        className="absolute top-2 right-2 bg-blue-500 text-white"
                        size="sm"
                    >
                        {resourceMedia.length ?? 0}
                    </Badge>
                ) : null}
            </Pressable>
        );
    };




    const MediaSection = ({ resourceMedia, setResourceMedia }: { resourceMedia: string[] | null, setResourceMedia: (uri: string[]) => void }) => {
        const [showImageViewer, setShowImageViewer] = useState(false);
        return (<>
            <ImagePreviewWithBadge
                resourceMedia={resourceMedia}
                setShowModal={(show) => console.log("Modal state:", show)}
            />
            <Modal
                isOpen={showImageViewer}
                onClose={() => {
                    setShowImageViewer(false);


                }}
            >
                <ModalBackdrop />
                <ModalContent className="flex-1 items-center justify-center flex-col">
                    {!!resourceMedia?.[0] ?
                        <GalleryUploader bucketName="product_images" />
                        :
                        <ThemedView className="flex-1 items-center justify-center flex-col">
                            <Text className="text-lg text-gray-500">No photo selected</Text>
                            <Button
                                onPress={pickImageAsync}
                                className="mt-4 bg-blue-500"
                            >
                                {resourceMedia ? (
                                    <ButtonSpinner className="text-white" />
                                ) : (
                                    <ButtonText className={resourceMedia ? "text-white" : "text-slate-500"}>Pick a picture</ButtonText>
                                )}
                                <ButtonIcon as={Camera} className={resourceMedia ? "text-white" : "text-slate-500"} />
                            </Button>
                        </ThemedView>
                    }
                </ModalContent>
            </Modal>
        </>
        );
    }

    const handleSubmit = async () => {
        setLoading(true);

        // Handle the form submission logic here
    }

    if (!state?.isAuthenticated) {
        console.log("User is not authenticated. Redirecting to sign-in page.");
        return (
            <Redirect
                href={{
                    pathname: '/(auth)/(signin)',
                    params: {
                        redirect: '/(tabs)/household/[household_id]/products/add',
                        ...params,
                    },
                }}
            />
        );
    }

    const initialData: Partial<Product> = {
        id: "",
        auto_replenish: false,
        barcode: null,
        current_quantity: 0,
        current_quantity_status: 'full',
        description: null,
        draft_status: "draft", // Assuming "draft" is a valid default value
        expiration_date: null,
        icon_name: null,
        inventory_id: null,
        is_template: false,
        last_scanned: null,
        max_quantity: null,
        media: {},
        min_quantity: null,
        photo_url: null,
        product_category: null,
        product_name: "",
        qr_code: null,
        quantity_unit: "pack",
        scan_history: {},
        updated_dt: new Date().toISOString(),
        vendor_id: null,
    };

    if (loading) {
        return (
            <ThemedView className="flex-1 items-center justify-center flex-col">
                <Spinner size={"large"} color={colors.primary.main} />
            </ThemedView>
        );
    }

    return (
        <ResourceBackgroundMedia>
            <AddResourceLayout
                primarySlot={<AddProductForm initialData={initialData} />}
                secondarySlot={
                    <MediaSection
                        resourceMedia={resourceMedia}
                        setResourceMedia={setResourceMedia}
                    />
                }
                footerSlot={
                    (<FloatingFooter>
                        <SubmitButton
                            focusRef={submitBtnRef}
                            onSubmit={() => { }}
                            disabled={false}
                            btnText="Submit"
                            cnStyles={{ btn: "bg-success-400" }}
                        />
                    </FloatingFooter>)
                }
            />
        </ResourceBackgroundMedia>
    )
}

export default AddProductScreen;