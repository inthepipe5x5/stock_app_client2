import ImageViewer from '@/components/ImageViewer';
import { useEffect } from 'react';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import DashboardLayout from '../_layout';

export default function MediaDetail() {
    const params = useLocalSearchParams();
    const { media, mediaType, action } = params as {
        media?: string[] | null | undefined;
        mediaType?: ('images' | 'videos') | null | undefined;
        action?: 'preview' | 'edit' | 'upload' | null | undefined;
    };

    //dismiss modal if media is null or undefined
    useEffect(() => {
        if (!!media) {
            router.canGoBack() ? router.back() : router.dismiss();
        }
    }
        , [media]);

    return (
        <DashboardLayout>
            <Stack.Screen
                options={{
                    headerShown: false,
                    animation: 'fade',
                    animationDuration: 300,
                    animationTypeForReplace: 'push',
                    presentation: 'modal',
                }}
            />
            <ImageViewer uri={(media?.[0] as string) ?? "@/assets/image2.png"} />
        </DashboardLayout>
    )
}