import { useState, useRef, useEffect } from "react";
import { Dimensions, Alert, AppState } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { VStack } from "@/components/ui/vstack";
import { Center } from "@/components/ui/center";
import { Pressable } from "@/components/ui/pressable";
import { Image } from "@/components/ui/image";
import { Icon } from "@/components/ui/icon";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { useMediaContext } from "@/components/contexts/MediaContext";
import { uploadToSupabase } from "@/lib/supabase/buckets";
import { uriToBlob } from "@/lib/camera/utils";
import { Trash2 } from "lucide-react-native";
import { setAbortableTimeout } from "@/hooks/useDebounce";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { RelativePathString, router, useLocalSearchParams } from "expo-router";

const { width } = Dimensions.get("window");

interface GalleryUploaderProps {
    bucketName: string;
}

export default function GalleryUploader({ bucketName }: GalleryUploaderProps) {
    const [selectedURIs, setSelectedURIs] = useState<Blob[]>([]);
    const [uploading, setUploading] = useState<boolean>(false);
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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });

        if (!result.canceled) {
            const blobs = await Promise.all(
                result.assets.map(async (asset) => {
                    const response = await fetch(asset.uri);
                    return await response.blob();
                })
            );
            setSelectedURIs(blobs);
        }
    };

    const handleUploadImages = async () => {
        try {
            setUploading(true);

            for (const uri of selectedURIs) {
                const blobData = await axios.get(uri, {
                    responseType: "blob"
                });
                const fileExtension = uri.split('.').pop() ?? 'jpg';

                const uploadResult = await uploadToSupabase(
                    {
                        blob: blobData.data,
                        fileExtension,
                        uri,
                    },
                    bucketName
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
                                    source={{ uri }}
                                    alt={`Image ${index + 1}`}
                                    className="w-full h-full resize-cover rounded-lg"
                                />
                            </Center>
                        </Pressable>
                    ))
                ) : (
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
                    onPress={handlePickImages}
                    action="primary"
                    variant="solid"
                    disabled={uploading}
                >
                    <ButtonText>{selectedURIs.length > 0 ? "Pick More Images" : "Select Images"}</ButtonText>
                </Button>

                {
                    selectedURIs.length > 0 ? (
                        <Button
                            onPress={handleUploadImages}
                            action="positive"
                            variant="solid"
                            disabled={uploading}
                        >
                            <ButtonText>{uploading ? "Uploading..." : "Upload to Supabase"}</ButtonText>
                        </Button>
                    )
                        : null
                }
            </VStack>
        </VStack>
    );
}
