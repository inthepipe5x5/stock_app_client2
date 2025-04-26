import ImageViewer from "@/components/ImageViewer";
import { Redirect, RelativePathString, useLocalSearchParams } from "expo-router";

export default function MediaPage() {
    const { media, type } = useLocalSearchParams<{ media: string, type: string }>();
    
    return [media, type].every(Boolean) ? (
        <ImageViewer uri={Array.isArray(media) ? media?.[0] : media} />
    ) :
        <Redirect href={{
            pathname: '/+not-found' as RelativePathString,
            params: { message: "Media not found" }
        }} />
        ;
}