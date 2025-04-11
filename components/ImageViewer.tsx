import { ThemedView } from "@/components/ThemedView";
import { Text } from "@/components/ui/text";
import {
    Button,
    ButtonText,
    ButtonIcon,
    ButtonSpinner
} from "@/components/ui/button";
import { Image as RNImage, Dimensions, Appearance, Alert } from "react-native";
import { useState } from "react";
import { Camera, CameraOff, Images } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { viewPort } from "@/constants/dimensions";
const placeholderImage = '@/assets/image2.png'; // Placeholder image
import Colors from "@/constants/Colors";

import { ScrollView } from "react-native-gesture-handler";
import { VStack } from "@/components/ui/vstack";
import { Center } from "@/components/ui/center";
import { Pressable } from "@/components/ui/pressable";
import { Image } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadToSupabase } from "@/lib/supabase/buckets";
import { uriToBlob } from "@/lib/camera/utils"; // helper that turns URI into blob

const { width } = Dimensions.get("window");

interface GalleryUploaderProps {
    bucketName: string;
}
const ImageViewer = ({ uri = placeholderImage }: { uri: string }) => {
    const [imageUri, setImageUri] = useState<string | null>(uri ?? null);
    const { width, height } = Dimensions.get('window');
    const viewPortWidth = viewPort.width ?? width;
    const viewPortHeight = viewPort.height ?? height;
    const aspectRatio = viewPortWidth / viewPortHeight;
    const theme = Appearance.getColorScheme() as keyof typeof Colors ?? "light"
    const imageWidth = viewPortWidth * 0.8; // 80% of the viewport width
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const colors = Colors[theme];
    const oppositeColor = colors?.background === colors?.text ? colors?.text : colors?.background;

    console.log({ imageUri });

    return (
        <ThemedView className={cn("flex-1 items-center justify-center",
            viewPortWidth <= viewPort.breakpoints.X.mobile ? "min-width-[300px]" : "min-width-[400px]",
            viewPortHeight >= viewPort.breakpoints.X.mobile ? 'gap-4' : 'gap-2',
            viewPortWidth >= viewPort.breakpoints.X.mobile ? "flex-row" : "flex-col",
        )}>
            <ThemedView
                className={cn('flex-1'
                    , viewPortWidth >= viewPort.breakpoints.X.mobile ? "flex-row" : "flex-col",
                    darkMode ? "bg-slate-800" : "bg-white",
                    darkMode ? "border-slate-700" : "border-gray-300",
                    "rounded-lg border-2 justify-center items-center p-4 gap-2",
                    `shadow-inner ${theme === 'dark' ? "shadow-slate-200" : "shadow-slate-500"}` // Add an inside shadow
                )
                }
            >
                {uri ? (
                    <>
                        <RNImage
                            source={{ uri }}
                            className={cn("w-72 h-72 rounded-lg border-2 border-gray-300",
                                aspectRatio > 1 ? "aspect-[16/9]" : "aspect-[9/16]" // Adjust the aspect ratio based on the viewport

                            )}
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
            </ThemedView>
            <ThemedView
                className={cn("align-center flex 1/3 justify-center mx-2 px-2",

                )}
            >
                <Button
                    onPress={() => setImageUri(null)}
                    className="mt-4 bg-blue-500"
                    action={imageUri ? 'positive' : 'secondary'}
                    variant={imageUri ? 'solid' : 'outline'}
                >
                    {imageUri ? (
                        <ButtonSpinner className="text-white" />
                    ) : (
                        <ButtonText className={imageUri ? "text-white" : "text-slate-500"}>Take a picture</ButtonText>
                    )}
                    <ButtonIcon as={imageUri ? CameraOff : Camera} className={imageUri ? "text-white" : "text-slate-500"} />
                </Button>
            </ThemedView>

        </ThemedView>
    );
};
export default ImageViewer;

