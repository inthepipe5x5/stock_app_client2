import { ThemedView } from "@/components/ThemedView";
import { Text } from "@/components/ui/text";
import {
    Button,
    ButtonText,
    ButtonIcon,
    ButtonSpinner
} from "@/components/ui/button";
import { Image as RNImage } from "react-native";
import { useState } from "react";
import { Camera, CameraOff, Images } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

const renderPicture = (uri: string) => {
    const [imageUri, setImageUri] = useState<string | null>(uri ?? null);
    console.log({ imageUri });

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
                onPress={() => setImageUri(null)}
                className="mt-4 bg-blue-500"
            >
                {imageUri ? (
                    <ButtonSpinner className="text-white" />
                ) : (
                    <ButtonText className={uri ? "text-white" : "text-slate-500"}>Take a picture</ButtonText>
                )}
                <ButtonIcon as={Camera} className={uri ? "text-white" : "text-slate-500"} />
            </Button>

        </ThemedView>
    );
};
