import React, { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
} from "react-native";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { Spinner } from "@/components/ui/spinner";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import ConfirmClose from "@/components/navigation/ConfirmClose";
import { useRouter, Stack, useLocalSearchParams, RelativePathString } from "expo-router";
import { LoadingOverlayProps } from "@/components/navigation/TransitionOverlayModal";

export default function LoadingView(props?: Partial<LoadingOverlayProps> & {
    error?: any;
}) {
    const router = useRouter();
    const params = useLocalSearchParams();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const visible = props?.visible ?? Boolean(params?.visible?.[0]) ?? true;
    const title = props?.title ?? params?.title?.[0] ?? "Loading...";
    const description = props?.description ?? params?.description?.[0] ?? null;
    const subtitle = props?.subtitle ?? params?.subtitle?.[0] ?? "Please wait...";
    const nextUrl = props?.dismissToURL ?? props?.nextUrl ?? params?.nextUrl?.[0] ?? null;

    // Animate overlay in/out
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: visible ? 1 : 0,
            duration: 3000,
            useNativeDriver: true,
            easing: visible ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
        }).start();
        // Redirect to nextUrl after 3 seconds
        setTimeout(() => {
            //handle if a nextUrl is provided
            if (nextUrl) {
                router.push({
                    pathname: nextUrl as RelativePathString,
                    params: params ?? {},
                });
            }
            //handle if user dismisses the modal
            router.canGoBack() ? router.back() : router.replace(nextUrl ?? {
                pathname: '/+not-found',
                params: {
                    ...params,
                    message: 'No URL provided',
                },
            });
        }, 3000);

    }, [props, params, visible]);

    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            <Stack.Screen
                options={{
                    headerShown: false,
                    presentation: 'transparentModal',
                    contentStyle: {
                        // backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 'auto',
                        paddingVertical: 'auto',
                        margin: 'auto'
                    },
                }}
            />
            <Center style={{ flex: 1 }}>
                <Box className="w-[80%] bg-background-100 p-5 rounded-md items-center justify-center">
                    {/* XXL Spinner */}
                    <Spinner size="large" className="my-3 px-auto py-auto mt-4" />
                    {/* Text Content */}
                    <Heading size="3xl" className="my-auto text-center mb-2">
                        {title ?? "Loading..."}
                    </Heading>

                    {
                        !!subtitle && typeof subtitle === 'string' ?
                            <Text className="text-center mb-1 size-5">
                                {subtitle}
                            </Text>
                            :
                            null
                    }

                    {
                        !!description && typeof description === 'string' ?
                            (
                                <Text className="text-center text-muted">
                                    {description}
                                </Text>
                            ) : null
                    }
                </Box>
            </Center>
        </Animated.View>)
}