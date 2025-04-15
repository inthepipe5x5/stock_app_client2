// LoadingOverlay.js
import React, { useEffect, useRef } from "react";
import {
  Modal,
  Animated,
  Easing,
  StyleSheet,
  TouchableWithoutFeedback,
  Appearance
} from "react-native";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { Spinner } from "@/components/ui/spinner";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { cn } from "@gluestack-ui/nativewind-utils/cn";

export interface LoadingOverlayProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
  dismissToURL?: any;
  nextUrl?: any;
  noRedirect: boolean
}

export default function LoadingOverlay({
  visible,
  title = "Loading...",
  subtitle,
  description,
  nextUrl,
  dismissToURL = "/(auth)/(signin)",
  noRedirect = false,
}: LoadingOverlayProps): JSX.Element {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = Appearance.getColorScheme() ?? "light";
  const colors = Colors[colorScheme as keyof typeof Colors];
  // Animate overlay in/out
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 1000,
      useNativeDriver: true,
      easing: visible ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
    }).start();
    // Redirect to nextUrl after 3 seconds
    if (nextUrl && !!!noRedirect) {
      setTimeout(() => {
        router.push(nextUrl as any);
      }, 3000);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onDismiss={() => {
        // ConfirmClose(dismissToURL);
        if (noRedirect) {
          return;
        }
        console.log("Dismissed Modal");
        router.canDismiss() ? router.dismiss() : router.push(dismissToURL);
      }}
    >
      <TouchableWithoutFeedback /* Disables clicks behind overlay */
        style={[styles.overlay, { opacity: fadeAnim }]}
      >
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <Center style={{
            flex: 1,
            backgroundColor: colors.background
          }}>
            <Box className={cn("w-[80%] p-5 rounded-md items-center"
              , colorScheme === "dark" ? "text-typography-50" : "text-typography-950"
            )}
              style={{
                elevation: 5,
                backgroundColor: 'rgba:(0,0,0,0)', // Transparent background unlike the overlay bg
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }}

            >
              {/* XXL Spinner */}
              <Spinner
                size="large"
                className="my-3"
                color={Colors[colorScheme]?.accent ?? colors.accent}
                accessibilityLabel="Loading"
              />
              {/* Text Content */}
              <Heading size="3xl" className="mb-2">
                {title ?? "Loading..."}
              </Heading>
              {!!subtitle ? <Text className="text-center mb-1">{subtitle}</Text> : null}
              {!!description ? (
                <Text className="text-center text-muted">{description}</Text>
              )
                : null}
            </Box>
          </Center>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal >
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
