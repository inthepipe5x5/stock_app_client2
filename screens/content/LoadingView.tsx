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
import { useRouter, Stack } from "expo-router";
import { LoadingOverlayProps } from "@/components/navigation/TransitionOverlayModal";

export default function LoadingView(props?: Partial<LoadingOverlayProps> & {
    error: any;
}) {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const visible = props?.visible ?? true;
    // Animate overlay in/out
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: visible ? 1 : 0,
            duration: 1000,
            useNativeDriver: true,
            easing: visible ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
        }).start();
        // Redirect to nextUrl after 3 seconds
        setTimeout(() => {
            //handle if a nextUrl is provided
            if (props?.nextUrl) {
                router.push(props?.nextUrl as any);
            }
            //handle if user dismisses the modal
            router.canGoBack() ? router.back() : router.replace(props?.dismissToURL ?? {
                pathname: '/+not-found',
                params: {
                    message: 'No URL provided',
                },
            });
        }, 3000);

    }, [props?.visible, props?.nextUrl, props?.dismissToURL]);

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
                <Box className="w-[80%] bg-background-100 p-5 rounded-md items-center">
                    {/* XXL Spinner */}
                    <Spinner size="large" className="my-3" />
                    {/* Text Content */}
                    <Heading size="3xl" className="mb-2">
                        {props?.title ?? "Loading..."}
                    </Heading>
                    {!!props?.subtitle && typeof props?.subtitle === 'string' ?
                        <Text className="text-center mb-1">{props?.subtitle}</Text> : null}

                    {
                        !!props?.description && typeof props?.description === 'string' ?
                            (
                                <Text className="text-center text-muted">{props?.description}</Text>
                            ) : null
                    }
                </Box>
            </Center>
        </Animated.View>)
}