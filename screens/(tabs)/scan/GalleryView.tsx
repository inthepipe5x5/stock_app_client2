import { useState, useRef, useEffect, useMemo } from "react";
import { Dimensions, Alert, AppState, Appearance } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { VStack } from "@/components/ui/vstack";
import { Center } from "@/components/ui/center";
import { Pressable } from "@/components/ui/pressable";
import { Image } from "@/components/ui/image";
import { Icon } from "@/components/ui/icon";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
// import { useMediaContext } from "@/components/contexts/MediaContext";
import { uploadToSupabase } from "@/lib/supabase/buckets";
import { uriToBlob } from "@/lib/camera/utils";
import { Trash2 } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { RelativePathString, router, useLocalSearchParams } from "expo-router";
import useSnapPoints from "@/hooks/useSnapPoints";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import {
    Select,
    SelectTrigger,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectItem,
} from "@/components/ui/select"
import { ChevronDownIcon } from "@/components/ui/icon"
import { ThemedView } from "@/components/ThemedView";
const { width } = Dimensions.get("window");
import Colors from "@/constants/Colors";

interface GalleryComponentProps {
    bucketName: string;
    uploading: boolean;
    selectedURIs: Blob[];
    setSelectedURIs: (uris: Blob[]) => void;
    setMedia?: (uris: string[]) => void;
}
//#region GalleryComponent component
/// GalleryComponent component allows users to select and upload images from their device's gallery to a specified Supabase bucket.
/// It handles image selection, upload progress, and displays the selected images in a scrollable view.
export function GalleryComponent({
    bucketName,
    setMedia,
    uploading,
    selectedURIs,
    setSelectedURIs }: GalleryComponentProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const params = useLocalSearchParams();
    const { media, mediaType, action } = params as {
        media?: string[] | null | undefined;
        mediaType?: ("images" | "videos") | null | undefined;
        action?: "preview" | "edit" | "upload" | null | undefined;
    };

    useEffect(() => {
        const retrieveMedia = async () => {
            if (media && media.length > 0) {
                const mediaURIs = await Promise.all(media.map(async (uri: string) => {
                    const blobData = await axios.get(uri, {
                        responseType: "blob"
                    });

                    return blobData.data;
                }));
                if (!!mediaURIs) {
                    setSelectedURIs(mediaURIs);
                    setActiveIndex(0);
                }
                if (mediaType === "videos") {
                    router.replace({
                        pathname: '+/not-found' as RelativePathString,
                        params: {
                            message: "Media type not supported"
                        }
                    })

                }
            }
        }
        retrieveMedia();
    }
        , [media, action, mediaType]);

    const handlePickImages = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission required", "Please grant gallery permissions to select photos.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsMultipleSelection: true,
            allowsEditing: false,
            quality: 1,
            selectionLimit: 5,
        });

        if (!result.canceled) {
            const blobs = await Promise.all(
                result.assets.map(async (asset) => {
                    const response = await fetch(asset.uri);
                    return await response.blob();
                })
            );
            setSelectedURIs(blobs);
            //update media context with new blobs
            if (!!setMedia) {
                setMedia(blobs.map(blob => URL.createObjectURL(blob)));
            }
        }
    };



    const handleScroll = (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
        setActiveIndex(index);
    };

    return (
        <VStack className="flex-1 items-center justify-center p-4">
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={{ flexGrow: 0 }}
            >
                {selectedURIs.length > 0 ? (
                    selectedURIs.map((uri, index) => (
                        <Pressable
                            key={index}
                            className="w-full"
                            style={{ width }}
                        >
                            <Center className="h-[300px] w-full">
                                <Image
                                    source={{ uri: URL.createObjectURL(uri) }}
                                    alt={`Image ${index + 1}`}
                                    className="w-full h-full resize-cover rounded-lg"
                                />
                            </Center>
                        </Pressable>
                    ))
                ) :
                    (
                        <Center className="h-[300px] w-full">
                            <Skeleton className="w-[90%] h-[90%] rounded-lg" />
                        </Center>
                    )}
            </ScrollView>

            {/* Dots Indicator */}
            <Center className="flex-row justify-center mt-4 space-x-1">
                {selectedURIs.map((_, index) => (
                    <Center
                        key={index}
                        className={cn(
                            "h-2 w-2 rounded-full",
                            activeIndex === index
                                ? "bg-primary-500"
                                : "bg-background-200"
                        )}
                    />
                ))}
            </Center>

            {/* Action Buttons */}
            <VStack className="w-full mt-6 space-y-3">
                <Button
                    className="flex-3"
                    onPress={handlePickImages}
                    action="primary"
                    variant="solid"
                    disabled={uploading || selectedURIs.length >= 5}
                    android_ripple={{ color: "rgba(0, 0, 0, 0.2)" }}
                    onPressIn={handlePickImages}
                >
                    <ButtonText>{selectedURIs.length > 0 ? "Pick More Images" : "Select Images"}</ButtonText>
                </Button>
                <Button
                    className="flex-1"
                    onPress={handlePickImages}
                    action={selectedURIs.length > 0 || selectedURIs.length < 5 ? "secondary" : "negative"}
                    variant={selectedURIs.length > 0 || selectedURIs.length < 5 ? "solid" : 'outline'}
                    disabled={uploading || selectedURIs.length >= 5 || selectedURIs.length === 0}
                    android_ripple={{ color: "rgba(0, 0, 0, 0.2)" }}
                    onPressOut={() => {
                        setSelectedURIs([]);
                        if (!!setMedia) {
                            setMedia([]);
                        }
                    }}
                >
                    <ButtonIcon as={Trash2} size="sm" color="bg-error-400" className="mr-2" />
                    <ButtonText>Clear</ButtonText>
                </Button>

                {/* {
                    selectedURIs.length > 0 ? (
                        <Button
                            onPress={handleUploadImages}
                            action="positive"
                            variant="solid"
                            disabled={uploading}
                        >
                            <ButtonText>{uploading ? "Uploading..." : "Upload Media"}</ButtonText>
                        </Button>
                    )
                        : null
                } */}
            </VStack>
        </VStack>
    );
}

//#endregion GalleryComponent component
//#region GalleryView component
/// GalleryView component is a wrapper for the GalleryComponent, providing additional bottomsheet functionality and layout.
/// It handles the visibility of the bottom sheet and manages the selected media state.
export default function GalleryView() {
    const [bucketName, setBucketName] = useState<'product_images' | 'household_images'>("product_images");
    const [selectedURIs, setSelectedURIs] = useState<Blob[]>([]);
    const colors = Colors[Appearance.getColorScheme() as "light" | "dark"];
    const params = useLocalSearchParams();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const {
        snapPoints,
        handleSnapPointChange,
        initialIndex
    } = useSnapPoints({
        ref: bottomSheetRef,
    })
    const [uploading, setUploading] = useState<boolean>(false);

    const handleUploadImages = async () => {
        try {
            setUploading(true);

            for (const uri of selectedURIs) {
                const blobData = await axios.get(URL.createObjectURL(uri), {
                    responseType: "blob"
                });

                const fileExtension = "jpg"; // Default file extension
                const fileName = `${bucketName}_image_${Date.now()}.${fileExtension}`; // Generate a unique file name

                const uploadResult = await uploadToSupabase(
                    {
                        blob: blobData.data,
                        fileExtension,
                        uri: URL.createObjectURL(blobData.data),
                    },
                    bucketName,
                    fileName,
                    fileExtension
                );

                if (!uploadResult) {
                    throw new Error(`Failed to upload image: ${uri}`);
                }
            }

            Alert.alert("Upload complete", "All images were uploaded successfully!");
            setSelectedURIs([]); // Clear after upload
        } catch (error) {
            console.error(error);
            Alert.alert("Upload failed", "Some images failed to upload.");
        } finally {
            setUploading(false);
        }
    };
    return (
        <GestureHandlerRootView style={{
            flex: 1,
            padding: 24,
            backgroundColor: colors.background,
        }}>
            <VStack className="flex-1 items-center justify-center p-4">
                <GalleryComponent
                    bucketName={bucketName}
                    // setMedia={setMedia}
                    uploading={uploading}
                    selectedURIs={selectedURIs}
                    setSelectedURIs={setSelectedURIs}
                />
            </VStack>
            <BottomSheet
                ref={bottomSheetRef}
                index={initialIndex}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                onChange={handleSnapPointChange}
                backgroundStyle={{ backgroundColor: colors.background }}
                handleIndicatorStyle={{ backgroundColor: colors.primary.main }}
                handleComponent={() => {
                    return (
                        <ThemedView>
                            <Button
                                onPress={handleUploadImages}
                                action={selectedURIs?.length > 0 ? "positive" : "secondary"}
                                variant={selectedURIs?.length > 0 ? "solid" : "outline"}
                                className="w-full flex-1"
                                android_ripple={{ color: "rgba(0, 0, 0, 0.2)" }}
                                disabled={selectedURIs?.length > 0 || uploading}
                            >
                                <ButtonText>{selectedURIs?.length > 0 ? "Upload" + bucketName.replace("_", " ") : "No media selected"}</ButtonText>
                            </Button>
                        </ThemedView>
                    )
                }}
            >
                <BottomSheetView className="flex-1 flex-col justify-center items-center p-4">
                    <Select
                        defaultValue={bucketName}
                        onValueChange={(value) => {
                            setBucketName(value as 'product_images' | 'household_images');
                            handleSnapPointChange(0);
                        }}
                        closeOnOverlayClick={true}
                    >
                        <SelectTrigger className="w-full" variant="outline" size="lg">
                            <Button
                                action="secondary"
                                variant="outline"
                                className="w-full flex-1"
                                android_ripple={{ color: "rgba(0, 0, 0, 0.2)" }}
                            >
                                <ButtonText>{bucketName.replace("_", " ")}</ButtonText>
                                <SelectIcon as={ChevronDownIcon} size="sm" color="bg-primary-500" className="mr-2" />
                            </Button>
                        </SelectTrigger>
                        <SelectPortal>
                            <SelectContent className="w-full">
                                <SelectBackdrop />
                                <SelectDragIndicatorWrapper>
                                    <SelectDragIndicator />
                                </SelectDragIndicatorWrapper>
                                {["product_images", "household_images"].map((item, idx) => (
                                    <SelectItem
                                        key={`${item}-${bucketName}-${idx}`}
                                        value={item}
                                        label={item.split("_")
                                            .map((word => word.charAt(0)
                                                .toUpperCase() + word.slice(1)))
                                            .join(" ")
                                        }
                                        isDisabled={item === bucketName}
                                        className={cn(
                                            "flex-row items-center justify-between",
                                            item === bucketName ? "bg-primary-500" : "bg-background-200"
                                        )}
                                        android_ripple={{ color: "rgba(0, 0, 0, 0.2)" }}
                                    />
                                ))}
                            </SelectContent>
                        </SelectPortal>
                    </Select>
                </BottomSheetView>
            </BottomSheet>
        </GestureHandlerRootView>
    );
}