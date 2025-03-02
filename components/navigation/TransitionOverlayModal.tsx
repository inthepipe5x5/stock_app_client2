// LoadingOverlay.js
import React, { useEffect, useRef } from "react";
import {
  Modal,
  Animated,
  Easing,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { Spinner } from "@/components/ui/spinner";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import ConfirmClose from "@/components/navigation/ConfirmClose";
import { useRouter } from "expo-router";
interface LoadingOverlayProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
  dismissToURL?: any;
  nextUrl?: any;
}

export default function LoadingOverlay({
  visible,
  title = "Loading...",
  subtitle,
  description,
  nextUrl,
  dismissToURL = "/(auth)/(signin)",
}: LoadingOverlayProps): JSX.Element {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  // Animate overlay in/out
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
      easing: visible ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
    }).start();
    // Redirect to nextUrl after 3 seconds
    if (nextUrl) {
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
        ConfirmClose(dismissToURL);
      }}
    >
      <TouchableWithoutFeedback /* Disables clicks behind overlay */>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <Center style={{ flex: 1 }}>
            <Box className="w-[80%] bg-background-100 p-5 rounded-md items-center">
              {/* XXL Spinner */}
              <Spinner size="large" className="my-3" />
              {/* Text Content */}
              <Heading size="3xl" className="mb-2">
                {title}
              </Heading>
              {subtitle && <Text className="text-center mb-1">{subtitle}</Text>}
              {description && (
                <Text className="text-center text-muted">{description}</Text>
              )}
            </Box>
          </Center>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
