import React, { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    useColorScheme,
} from "react-native";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { Spinner } from "@/components/ui/spinner";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useRouter, useLocalSearchParams, RelativePathString, useFocusEffect } from "expo-router";
import { LoadingOverlayProps } from "@/components/navigation/TransitionOverlayModal";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";

export default function LoadingView(props?: Partial<LoadingOverlayProps> & {
    error?: any;
}) {
    const router = useRouter();
    const params = useLocalSearchParams();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const timeoutDuration = Number(params?.timeoutDuration?.[0]) ?? 10000;
    const animationDuration = Number(params?.animationDuration?.[0]) ?? 1000;
    const visible = props?.visible ?? Boolean(params?.visible?.[0]) ?? true;
    const title = props?.title ?? params?.title?.[0] ?? "Loading...";
    const description = props?.description ?? params?.description?.[0] ?? null;
    const [timedOut, setTimedOut] = React.useState<boolean>(false);
    const subtitle = props?.subtitle ?? params?.subtitle?.[0] ?? `Please wait...${!!timeoutDuration ?
        'You will be redirected in ' + timeoutDuration / 1000 + ' seconds'
        : ''}`;
    const nextUrl = props?.dismissToURL ?? props?.nextUrl ?? params?.nextUrl?.[0] ?? null;
    const colorTheme = params?.colorTheme?.[0] ?? useColorScheme() ?? 'light';
    const colors = Colors[colorTheme as keyof typeof Colors] ?? Colors.light;
    const oppositeColors = Colors[useColorScheme() === 'dark' ? 'light' : 'dark'];
    // Animate overlay in/out
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: visible ? 1 : 0,
            duration: animationDuration,
            useNativeDriver: true,
            easing: visible ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
        }).start();


    }, [visible, animationDuration]);

    // Handle timeout and navigation
    useFocusEffect(
        React.useCallback(() => {
            //handle if route is timedOut
            if (timedOut) {
                if (nextUrl) {
                    router.push({
                        pathname: nextUrl as RelativePathString,
                        params: params ?? {},
                    });
                } else if (router.canGoBack()) {
                    router.back();
                } else {
                    router.replace({
                        pathname: '/+not-found',
                        params: {
                            message: "Something went wrong. Please try again.",
                        },
                    });
                }
            }
            // If the component is still mounted and hasn't timed out, set the timeout
            else if (!!!timedOut) {
                const setTimedOutTimer = setTimeout(() => {
                    setTimedOut(true);


                }, timeoutDuration);



                // Clean up timeout when component unmounts
                return () => clearTimeout(setTimedOutTimer);
            }
        }, [nextUrl, timedOut])
    );


    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                <Center className="flex-1 px-4">
                    <Box className="w-full max-w-md bg-background-100 p-6 rounded-lg items-center justify-center">
                        {/* Spinner */}
                        <Spinner size={200} className="my-5" color={colors.primary?.main ?? "#4F46E5"} />

                        {/* Title */}
                        {title && (
                            <Heading size="xl" className="text-center my-2 text-typography-900">
                                {title}
                            </Heading>
                        )}

                        {/* Subtitle */}
                        {subtitle && (
                            <Text className="text-center text-typography-700 mb-2">{subtitle}</Text>
                        )}

                        {/* Optional description */}
                        {description && (
                            <Text className="text-center text-typography-500">{description}</Text>
                        )}
                    </Box>
                </Center>
            </Animated.View>
        </SafeAreaView>

    );
}

