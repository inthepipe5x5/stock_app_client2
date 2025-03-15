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
import { useState, useEffect, useRef } from "react";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import LoadingOverlay from "@/components/navigation/TransitionOverlayModal";

const SessionExpiredModal = (props: any) => {
    const [confirmCloseModal, setConfirmCloseModal] = useState(props?.showModal ?? false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const router = useRouter();


    const dismissToUrl = props?.dismissToUrl ?? "/(auth)/(signin)/authenticate";
    
    useEffect(() => {
        if (!confirmCloseModal) {

            // ConfirmClose(dismissToURL);
            console.log("Dismissed Modal");

            Animated.timing(fadeAnim, {
                toValue: confirmCloseModal ? 1 : 0,
                duration: 1000,
                useNativeDriver: true,
                easing: confirmCloseModal ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
            }).start();

            router.canDismiss() ? router.dismiss() : router.push(dismissToURL);
        }

    }, [confirmCloseModal]);

    return (
        <TouchableWithoutFeedback /* Disables clicks behind overlay */>
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <ConfirmClose dismissToUrl={dismissToURL}
                    setDisplayAlertFn={setConfirmCloseModal}
                    visible={confirmCloseModal}
                    title="Session expired"
                    description="Please sign in again" />
            </Animated.View>
        </TouchableWithoutFeedback >
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
});
