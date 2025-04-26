
import React, {
    useRef,
    useEffect,
    useCallback,
    Suspense,
} from "react";
import {
    RelativePathString,
    router,
    Stack,
} from "expo-router";
import {
    Button,
    StyleSheet,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Platform,
    Image as RNImage,
    Dimensions,
    Animated,
    View, Button as RNButton
} from "react-native";
// import { Link } from "expo-router";
// import SquareOverlay from "@/components/ui/camera";

// import * as session from "@/lib/supabase/session";
import {
    Camera, CameraDevice,

    CodeType,
    getCameraDevice,
    useCameraDevice,
    useCameraPermission,
    useCodeScanner
} from 'react-native-vision-camera'
import { useAppState } from "@react-native-community/hooks";
import { useState } from "react";

import { Feather } from "@expo/vector-icons";
import * as Linking from 'expo-linking';
import { useIsFocused } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { CameraIcon, CameraOff, Code, Images, Scan, SquareDashed, SwitchCameraIcon } from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import { Badge, BadgeText } from "@/components/ui/badge";
import RoundedHeader from "@/components/navigation/RoundedHeader";
import supabase from "@/lib/supabase/supabase";
import { useOpenFoodFactsAPI } from "@/components/contexts/OpenFoodFactsAPI";
import { setAbortableTimeout } from "@/hooks/useDebounce";
import { Heading } from "@/components/ui/heading"
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalCloseButton,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@/components/ui/modal"
import { Icon, CloseIcon } from "@/components/ui/icon"
import { Text as GSText } from "@/components/ui/text"
import { Center } from "@/components/ui/center";
import { Button as GSButton, ButtonText as GSButtonText } from "@/components/ui/button";
import {
    Actionsheet,
    ActionsheetContent,
    ActionsheetItem,
    ActionsheetItemText,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
    ActionsheetBackdrop,
} from "@/components/ui/actionsheet"
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import axios from "axios";
import appInfo from '@/app.json';
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import defaultSession from "@/constants/defaultSession";
import SquareOverlay, { SquareOverlayArea } from "@/components/ui/camera/SquareOverlay";
import LoadingOverlay from "@/components/navigation/TransitionOverlayModal";
import { set } from "react-hook-form";
import { Spinner } from "@/components/ui/spinner";
import { Box } from "@/components/ui/box";
import { useQuery } from "@tanstack/react-query";

export default function ScanView({ handleBarcodeScanned }: {
    handleBarcodeScanned?: (barcode: any) => void;
}) {
    const [uri, setUri] = useState<string | null | undefined>(null);
    const [mode, setMode] = useState<"picture" | "video">("picture");
    const [facing, setFacing] = useState<string>("back");
    const [cameraReady, setCameraReady] = useState<boolean>(false);

    const [squareOverlay, setSquareOverlay] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [promptMessage, setPromptMessage] = useState<{
        id: string;
        title: string;
        description?: string;
        variant: "solid" | "outline";
        action: "success" | "error" | "info" | "warning";
    } | null | undefined>(null);
    const cameraLockRef = useRef<boolean>(false); // used to lock the camera

    const [scannedData, setScannedData] =
        useState<string | null>(null);
    const { width, height } = Dimensions.get("window");
    const [showActionSheet, setShowActionSheet] = useState<boolean>(false);
    const globalContext = useUserSession();
    const { state } = globalContext ?? defaultSession;
    const isFocused = useIsFocused();
    const appState = useAppState();
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back') ?? null

    useEffect(() => {
        if (isFocused && appState === "active") {
            setCameraReady(true);
        } else {
            setCameraReady(false);
        }
    }, [isFocused, appState]);

    if (!!!device) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>No Devices detected</Text>
                <GSButton
                    onPress={() => router.back()}
                    action="positive"
                >
                    <GSButtonText>Go Back</GSButtonText>
                </GSButton>
            </View>
        );
    }







    //ask for permissions if not granted and can ask again
    if (!hasPermission) {
        return (
            <View style={testCameraStyles.container}>
                <Text style={{ textAlign: "center" }}>
                    We need your permission to use the camera
                </Text>
                <RNButton onPress={requestPermission} title="Camera Permission Request" />
            </View>
        );
    };


    //function to cancel any pending async tasks and navigate back to the previous screen
    const navigateBack = () => {
        router.canGoBack() ? router.back() : router.dismissTo("/" as RelativePathString);
    }

    const toggleMode = () => {
        setMode((prev) => (prev === "picture" ? "video" : "picture"));
    };

    const toggleFacing = () => {
        setFacing((prev) => (prev === "back" ? "front" : "back"));
    };

    const renderPicture = () => {
        console.log({ uri });

        return (
            <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
                {uri ? (
                    <>
                        <RNImage
                            source={{ uri }}
                            style={{
                                width: 300,
                                height: 300,
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: "#ccc",
                            }}
                            resizeMode="contain"
                        />
                        <Text style={{ marginTop: 10, fontSize: 16, color: "#333" }}>
                            Photo Preview
                        </Text>
                    </>
                ) : (
                    <Text style={{ fontSize: 18, color: "#888" }}>No photo selected</Text>
                )}
                <RNButton
                    onPress={() => setUri(null)}
                    title="Take another picture"
                    color="#007BFF"
                />
            </View>
        );
    };

    //set the image picker to open the image library
    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            // allowsEditing: true,
            quality: 1,
        });

        //on success, set the uri to the selected image
        if (!!result?.assets && !!result?.assets[0]?.uri) {
            setUri(result.assets[0].uri);

            setPromptMessage({
                id: "photo_selected",
                title: "Photo selected",
                description: "Photo chosen successfully",
                variant: "solid",
                action: "success",
            } as any);
        }
        else if (!result.canceled) {
            console.log(result);
            setPromptMessage({
                id: "photo_selection_error",
                title: "Error selecting photo",
                description: "Photo selection failed",
                variant: "solid",
                action: "error",
            } as any);
        } else {
            console.log("Image picker cancelled");
        }

    };

    const toggleSquareOverlay = () => {
        // cameraRef.current?.pausePreview();
        setSquareOverlay((prev) => !prev);
        // cameraRef.current?.resumePreview();
    }

    const parseLink = async (link: string) => {
        console.log('parsing link =>', { link });
        const parsedLink = await Linking.canOpenURL(link) ? Linking.parse(link) : null;
        if (parsedLink === null) {
            console.warn(`Failed to parse link ${link}`);
            return;
        }
        console.log("Parsed Link", parsedLink);
        const { queryParams, scheme, path } = parsedLink
        console.log("Parsed link => ", { queryParams, scheme, path });
        return await Linking.openURL(link)
    }

    const codeTypes =
        ['code-128'
            , 'code-39'
            , 'code-93'
            , 'codabar'
            , 'ean-13'
            , 'ean-8'
            , 'itf'
            , 'itf-14'
            , 'upc-e'
            // , 'upc-a'
            , 'qr'
            , 'pdf-417'
            , 'aztec'
            , 'data-matrix'] as CodeType[];
    if (Platform.OS === 'android') {
        codeTypes.push('upc-a');
    }

    const codeScanner = useCodeScanner({
        codeTypes,
        onCodeScanned: (codes, frame) => {
            for (const code of codes) {
                console.log(code.type, ":", code.value);
                // if (code.frame) {
                // 
                // }
            }
        }
    })

    const renderPromptMessage = () => {
        if (!!!promptMessage) return null;

        return (
            <Animated.View
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: [{ translateX: -50 }, { translateY: -50 }],
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    borderRadius: 30,
                    padding: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    margin: 5,
                    // Use Animated API for transitions
                    opacity: new Animated.Value(1),
                }}
                onLayout={() =>
                    setTimeout(() => {
                        Animated.timing(new Animated.Value(1), {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }).start(() => setPromptMessage(null)); //remove the prompt 
                    }, 2000)
                }
            >
                <Box
                    className={cn(promptMessage?.variant === "solid" ? "bg-success-700" :
                        promptMessage?.action === 'error' ? 'bg-error-400' : "bg-background-50",)}
                >
                    <Text style={{ color: "white", fontSize: 16, textAlign: "center" }}>
                        {promptMessage?.title ?? "Try scanning something"}
                    </Text>
                    {promptMessage?.description ? (
                        <Text style={{ color: "white", fontSize: 14, textAlign: "center" }}>
                            {promptMessage?.description}
                        </Text>
                    ) : null}
                </Box>
            </Animated.View>
        );
    };

    const ScanActionSheet = (handleClose?: () => any) => {
        const closeFn = !!handleClose ? handleClose : () => {
            setUri(null);
            setShowActionSheet(false);
        };
        return (
            <Actionsheet
                isOpen={showActionSheet}
                defaultIsOpen={false}
                closeOnOverlayClick={true}
                isKeyboardDismissable={true}
                trapFocus={false}
                // snapPoints={[0, 100, 200]}
                // onOpen={() => {
                //     // setShowActionSheet(true);
                //     console.log("Actionsheet opened", { showActionSheet });
                // }}
                // onClose={() => {
                //     cameraRef.current?.resumePreview();
                // }}
                preventScroll={false} // ensure scroll is not prevented when open
            >
                <ActionsheetBackdrop />
                <ActionsheetContent
                    style={{ maxHeight: height * 0.75 }}
                >
                    <ActionsheetDragIndicatorWrapper>
                        <ActionsheetDragIndicator />
                    </ActionsheetDragIndicatorWrapper>
                    {
                        !!uri ?
                            (
                                <ActionsheetItem
                                    className="bg-success-700"
                                    onPress={() => {
                                        setLoading(true);
                                        router.push({
                                            pathname: "/(tabs)/household/[household_id]/products/add" as RelativePathString,
                                            params: {
                                                household_id: state?.households?.[0]?.id,
                                                media: [uri as string],
                                                barcodeData: scannedData ?? "",
                                            }
                                        })
                                    }}>
                                    {renderPicture()}
                                    <ActionsheetItemText
                                        className="text-typography-white"
                                    >
                                        Upload
                                    </ActionsheetItemText>
                                </ActionsheetItem>)
                            : null
                    }

                    <ActionsheetItem onPress={closeFn}>
                        <ActionsheetItemText className={cn('text-semibold', 'text-error-700')} >Cancel</ActionsheetItemText>
                    </ActionsheetItem>
                </ActionsheetContent>
            </Actionsheet >
        )
    }

    return (
        <SafeAreaView style={[StyleSheet.absoluteFillObject]}>
            <StatusBar barStyle="default" />
            <Stack.Screen
                options={{
                    headerShown: true,
                    animation: "fade",
                    presentation: "modal",
                    headerStyle: {
                        backgroundColor: "transparent",
                    },
                    headerShadowVisible: false,
                    headerTintColor: "white",

                    header: () => {
                        return (
                            <RoundedHeader
                                title="Camera"
                                icon={cameraReady ? CameraOff : CameraIcon}
                                onBack={navigateBack}
                                onMenu={() => {
                                    // cameraLockRef.current = !cameraLockRef.current;
                                    setShowActionSheet(true);
                                    console.log("Actionsheet opened", { showActionSheet });

                                }}
                                twCnStyling={{
                                    menu: {
                                        icon: !!cameraLockRef?.current ? "text-muted-100" : "text-success-200",
                                        pressable: !!cameraLockRef?.current ? "text-muted-100" :
                                            "text-success-200",
                                        // pressable: "bg-transparent",
                                    },
                                }}
                            />
                        )
                    }
                }} />
            <View
                style={[testCameraStyles.container,
                { backgroundColor: squareOverlay ? 'rgba(0,0,0,0.5)' : 'transparent' }]} //to help focus the square overlay
            >

                {/* {!!showPermissionModal ? <RequestPermissionModal variant="default" /> : null} */}
                {/* {uri ? renderPicture() : renderCamera()} */}
                <LoadingOverlay
                    visible={!cameraReady}
                    noRedirect={true}
                />

                <Camera
                    device={device as CameraDevice}
                    isActive={cameraReady}
                    style={{ flex: 1 }}
                    codeScanner={codeScanner}
                />;


                {renderPromptMessage()}
            </View>
            {ScanActionSheet()}
        </SafeAreaView>
    );
}

const testCameraStyles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "rgb(01,01,10,0.5)",
        // backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",

    },
    image: {
        width: "80%",
        height: "80%",
        aspectRatio: 1,
        resizeMode: "contain",
    },
    camera: {
        flex: 1,
        width: "100%",
    },
    shutterContainer: {
        position: "absolute",
        bottom: 44,
        left: 0,
        width: "100%",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 30,
        backgroundColor: 'transparent',
    },
    shutterBtn: {
        backgroundColor: "transparent",
        borderWidth: 5,
        borderColor: "white",
        width: 85,
        height: 85,
        borderRadius: 45,
        alignItems: "center",
        justifyContent: "center",
    },
    shutterBtnInner: {
        width: 70,
        height: 70,
        borderRadius: 50,
    },
});