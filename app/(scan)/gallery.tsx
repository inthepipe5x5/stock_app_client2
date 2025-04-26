import GalleryView from "@/screens/(tabs)/scan/GalleryView";
import DashboardLayout from "@/screens/_layout";
import { useLocalSearchParams } from "expo-router";

export default function Gallery() {
    const params = useLocalSearchParams();
    const { media, mediaType, action } = params as {
        media?: string[] | null | undefined;
        mediaType?: ("images" | "videos") | null | undefined;
        action?: "preview" | "edit" | "upload" | null | undefined;
    };
    return (
        <DashboardLayout>
            <GalleryView
                bucketName="product_images"
            />
        </DashboardLayout>
    )
}