
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
    AppStateStatus,
} from "react-native";
// import { Link } from "expo-router";
// import SquareOverlay from "@/components/ui/camera";
import {
    isCameraAvailable,
    getCameraTypes,
    uriToBlob,
} from "@/lib/camera/utils";
// import * as session from "@/lib/supabase/session";

import {
    BarcodeScanningResult,
    CameraMode,
    CameraType,
    CameraView,
    useCameraPermissions,
    scanFromURLAsync,
} from "expo-camera";
import { View, Button as RNButton, AppState } from 'react-native';
import { useState } from "react";

import { Feather } from "@expo/vector-icons";
import * as Linking from 'expo-linking';
import * as ImagePicker from 'expo-image-picker';
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { Camera, CameraOff, Images, Scan, SquareDashed, SwitchCameraIcon } from "lucide-react-native";
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

export default function ScanView({ onBarcodeScanned }: {
    onBarcodeScanned?: (data: BarcodeScanningResult) => void;
}) {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [uri, setUri] = useState<string | null | undefined>(null);
    const [mode, setMode] = useState<CameraMode>("picture");
    const [facing, setFacing] = useState<CameraType>("back");
    const [recording, setRecording] = useState(false);
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
    const appState = useRef(AppState.currentState);
    const cameraLockRef = useRef<boolean>(false); // used to lock the camera

    const [scannedData, setScannedData] =
        useState<BarcodeScanningResult | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const { width, height } = Dimensions.get("window");
    const [showActionSheet, setShowActionSheet] = useState<boolean>(false);
    const offAPI = useRef<any | null>(null)
    const globalContext = useUserSession();
    const { state } = globalContext ?? defaultSession;


    //useEffect to locks camera screen for 2 seconds when app is not focused
    useEffect(() => {
        abortControllerRef.current = abortControllerRef?.current ?? new AbortController();

        const subscription = AppState.addEventListener("change", (nextAppState) => {
            const previousState = appState.current;
            appState.current = nextAppState as AppStateStatus;

            if (
                previousState.match(/inactive|background/) &&
                nextAppState === "active"
            ) {
                console.log("App came back to foreground: unlocking camera");
                readyCamera()
            } else if (
                previousState === "active" &&
                nextAppState.match(/inactive|background/)
            ) {
                console.log("App going to background: locking camera after 2s");
                setAbortableTimeout({
                    callback: () => {
                        //lock camera & pause preview
                        lockCamera();
                    },
                    delay: 2000,
                    // signal: abortControllerRef.current?.signal,
                });
            }
        });

        //set OFFAPI instance
        if (!!!offAPI.current) {
            offAPI.current = offAPI.current ?? axios.create({
                baseURL: "https://world.openfoodfacts.org",
                headers: {
                    "User-Agent": `${appInfo.expo.name}/${appInfo.expo.version} (${process.env.EXPO_PUBLIC_CONTACT_EMAIL})`,
                    "Content-Type": "application/x-www-form-urlencoded",
                    "app_name": appInfo.expo.name,
                    "app_version": appInfo.expo.version,
                    "app_uuid": state?.user?.user_id ?? "db461921db32354c85b24061ef022d79f5a0cd9b8dfc2461aa890ffc6b935ba6"
                },

            })
        }
        // ensure it's turned off after first render
        readyCamera();
        //clean up by removing the subscription
        return () => {
            subscription.remove();
            //abort any pending requests
            //cancel any requests & reset controller ref
            // abortControllerRef.current?.abort();
            // abortControllerRef.current = new AbortController();
            // cameraLockRef.current = false;
            // setLoading(false);

            setScannedData(null);
        };
    }, []);


    //ask for permissions if not granted and can ask again
    if (!permission?.granted && permission?.canAskAgain) {
        return (
            <View style={testCameraStyles.container}>
                <Text style={{ textAlign: "center" }}>
                    We need your permission to use the camera
                </Text>
                <RNButton onPress={requestPermission} title="Camera Permission Request" />
            </View>
        );
    };
    const readyCamera = useCallback(() => {
        setLoading(false);
        cameraRef.current?.resumePreview();
        cameraLockRef.current = false; //unlock camera
        setCameraReady(true);
    }, []);

    const lockCamera = useCallback(() => {
        cameraLockRef.current = true; //lock camera
        cameraRef.current?.pausePreview();
        setLoading(true);
        setCameraReady(false);
    }, []);

    //function to cancel any pending async tasks and navigate back to the previous screen
    const navigateBack = () => {
        // abortControllerRef.current = abortControllerRef.current ?? new AbortController();
        //abort any pending requests
        //cancel any requests & reset controller ref
        // abortControllerRef.current?.abort();
        // abortControllerRef.current = new AbortController();
        //clear data
        // setScannedData(null);
        // setUri(null);
        // //lock camera
        // cameraLockRef.current = true;
        router.canGoBack() ? router.back() : router.dismissTo("/" as RelativePathString);
    }

    const takePicture = async () => {
        setLoading(true);
        setScannedData(null); //clear scanned data
        //cancel any requests & reset controller ref
        // abortControllerRef.current = abortControllerRef.current ?? new AbortController();
        // abortControllerRef.current?.abort();
        // abortControllerRef.current = new AbortController();

        // Lock camera if not already locked
        if (cameraLockRef.current) {
            console.log("Camera is locked");
            return;
        }

        if (!permission?.granted) {
            await requestPermission();
        }

        const photo = await cameraRef.current?.takePictureAsync();

        if (photo) {
            setPromptMessage({
                id: "photo_taken",
                title: "Photo taken",
                description: "Photo taken successfully",
                variant: "solid",
                action: "success",
            } as any);

            setUri(photo.uri);
            //scan for barcode
            const scanPhotoForBarcode = async (uri: string) => {
                const barcodeData = await scanFromURLAsync(uri as string);
                if (!!barcodeData[0]) {
                    setScannedData(barcodeData[0] as BarcodeScanningResult);
                    console.warn(`Barcode data: ${barcodeData[0]?.data}`);
                }
                console.log("Barcode data:", barcodeData);

                setPromptMessage({
                    id: "photo_barcode_scanned",
                    title: "Barcode scanned from  photo",
                    description: "Photo barcode scanned successfully",
                    variant: "solid",
                    action: "success",
                } as any);
                return barcodeData;
            };
            scanPhotoForBarcode(photo.uri)
            //cancel any requests & reset controller ref
            abortControllerRef.current?.abort();
            abortControllerRef.current = new AbortController();
            //unlock camera
            cameraLockRef.current = false;
            //resume camera preview
            cameraRef.current?.resumePreview();
            setLoading(false); // ✅ Force loading false after photo taken


            // Lock camera AFTER successful photo BUT no barcode
            if (!!uri && !!!scannedData) {
                cameraLockRef.current = true;
                cameraRef.current?.pausePreview();
                //show actionsheet
                setShowActionSheet(true);
                setLoading(false);
            }


            console.log("Picture taken:", { photo });
        }
    };

    const recordVideo = async () => {
        if (recording) {
            setRecording(false);
            cameraRef.current?.stopRecording();
            return;
        }

        if (!!!permission?.granted || cameraLockRef?.current) {
            console.log({ permission, cameraLockRef });
            if (!!!permission || !!!permission?.granted) requestPermission();
        }
        setRecording(true);
        const video = await cameraRef.current?.recordAsync();
        console.log({ video });
    };

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
        cameraRef.current?.pausePreview();
        setSquareOverlay((prev) => !prev);
        cameraRef.current?.resumePreview();
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

    const handleCodeScan = ({
        bounds,
        data,
        type,
        cornerPoints,
    }: BarcodeScanningResult) => {

        // Lock camera view if if data is scanned for better user experience
        abortControllerRef.current = abortControllerRef.current ?? new AbortController();
        if (
            !!data && !cameraLockRef.current
        ) {
            //lock camera
            cameraLockRef.current = true;
            cameraRef.current?.pausePreview();
            setLoading(true)
        }
        //if squareOverlay is enabled, restrict the scanned area to the square overlay area
        const overlayArea = SquareOverlayArea(200)
        if (squareOverlay && !cornerPoints.every(p =>
            p.x >= overlayArea.x &&
            p.x <= overlayArea.x + overlayArea.width &&
            p.y >= overlayArea.y &&
            p.y <= overlayArea.y + overlayArea.height
        )) {
            console.log("Barcode scanned outside of square overlay area");
            //cancel any requests & reset controller ref
            abortControllerRef.current?.abort();
            abortControllerRef.current = new AbortController();
            cameraLockRef.current = false;
            cameraRef.current?.resumePreview();
            setLoading(false)
            return;
        }

        //  //Set delay for better user experience when scanning URL/Link data
        setAbortableTimeout({
            callback: async () => {
                console.log(
                    `scanned the following data type ${type}: `,
                    data
                );
                //if data is scanned and camera is not locked

                if (["qr", "url"].includes(
                    type.toLowerCase()
                )) { await parseLink(data) }

                const [dbResponse, offDataResponse, offPricesResponse] = await Promise.all([
                    supabase
                        .from("products")
                        .select()
                        .eq("barcode", data)
                        .single(),
                    offAPI.current.get(`/product/${data}`),
                    offAPI.current.get(`https://prices.openfoodfacts.org/api/v1/product/code/${data}`)
                ]);
                console.log({ dbResponse, offDataResponse });
                if (dbResponse.error) {
                    console.warn({
                        title: "Error fetching product by barcode",
                        description: dbResponse.error.message,
                    });

                    throw dbResponse.error;
                }

                const productData = dbResponse.data;
                console.log({ productData });
                setScannedData(productData);

                //unlock camera
                cameraLockRef.current = false;
                cameraRef.current?.resumePreview();
            },
            delay: 1000,
            signal: abortControllerRef.current?.signal
        }
        );
        cameraRef?.current?.resumePreview();
        cameraLockRef.current = false
        setLoading(false)
    }

    const renderCamera = () => {
        console.log("Rendering camera with state:", {
            permission,
            loading,
            cameraReady,
            active: !cameraLockRef.current,
        });

        return (
            <CameraView
                style={[testCameraStyles.camera,
                    // !!squareOverlay ? { backgroundColor: "transparent" } : { backgroundColor: "rgb(0,0,0,0.5)" }
                ]}
                ref={cameraRef}
                mode={mode}
                facing={facing}
                mute={true} //record no sound since it's not needed
                // active={!cameraLockRef.current} //!!cameraLockRef?.current ? false : true} //lock camera when app is not in focus
                animateShutter={true}
                // onCameraReady={() => {
                // setLoading(false);
                // if (cameraRef?.current) cameraRef.current?.resumePreview();
                // }}
                onCameraReady={readyCamera}
                barcodeScannerSettings={{
                    barcodeTypes: [
                        "ean13",
                        "ean8",
                        "qr",
                        "aztec",
                        "pdf417",
                        "upc_e",
                        "datamatrix",
                        "code39",
                        "code93",
                        "itf14",
                        "codabar",
                        "code128",
                        "upc_a",
                    ],
                }}
                onBarcodeScanned={onBarcodeScanned ?? handleCodeScan}
            >
                {
                    !!squareOverlay ?
                        <SquareOverlay />
                        :
                        null
                }
                <View style={testCameraStyles.shutterContainer}>
                    <Pressable onPress={pickImageAsync}>
                        <View
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: 50,
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 10,
                                marginTop: 10,
                            }}
                        >
                            <Badge // badge to show the number of images selected
                                action={!uri ? "success" : "error"}
                                variant="solid"
                                className="absolute bottom-0 right-0 rounded-full h-4 w-4 flex items-center justify-center"
                            >
                                <BadgeText
                                    className="text-xs text-white"
                                >
                                    {//render the number of images selected in the uri state
                                        !!uri ? !Array.isArray(uri) ? 1 : uri.length : 0}
                                </BadgeText>
                            </Badge>
                            {uri ?
                                (<Suspense fallback={<Spinner size={32} color="#25292e" />}>
                                    <RNImage
                                        source={!Array.isArray(uri) ? { uri } : { uri: uri[0] }}
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 50,
                                            aspectRatio: 1,
                                        }}
                                    />
                                </Suspense>)
                                :
                                <Images size={32} color="#25292e" />}
                        </View>
                        {/* <Text style={{
                                  fontSize: 16,
                                  color: '#25292e'
                              }}>{label}</Text> */}
                    </Pressable>

                    <Pressable onPress={mode === "picture" ? takePicture : recordVideo}>
                        {({ pressed }) => (
                            <View
                                style={[
                                    testCameraStyles.shutterBtn,
                                    { //set the color of the shutter button based on the lock ref state 
                                        opacity: pressed ? 0.5 : cameraLockRef.current ? 0.2 : 1,

                                    },
                                ]}
                            >
                                {!!!loading ? <View
                                    style={[
                                        testCameraStyles.shutterBtnInner,
                                        {
                                            backgroundColor: cameraLockRef.current ? "black" : mode === "picture" ? "white" : "red",
                                        },
                                    ]}
                                /> : <Spinner
                                    style={[
                                        testCameraStyles.shutterBtnInner,
                                        {
                                            backgroundColor: cameraLockRef.current ? "black" : mode === "picture" ? "white" : "red",
                                        },
                                    ]}
                                />}
                            </View>
                        )}
                    </Pressable>
                    <View className="justify-between items-center flex-direction-column gap-1">
                        <Pressable onPress={toggleSquareOverlay}
                        >
                            <View
                                style={{
                                    backgroundColor: !squareOverlay ? "black" : "white", //"rgba(0, 0, 0, 0.5)",
                                    borderRadius: 50,
                                    padding: 10,
                                    marginTop: 10,
                                }}
                            >
                                <SquareDashed
                                    size={32}
                                    color={!squareOverlay ? "white" : "black"} />
                                <Badge
                                    action={squareOverlay ? "success" : "muted"}
                                    variant="solid"
                                    className="absolute bottom-0 right-0 rounded-full h-4 w-4 flex items-center justify-center"
                                >
                                    {/* <BadgeIcon color="white" size={16} /> */}
                                    {/* <BadgeText className="text-xs text-white">1</BadgeText> */}
                                </Badge>
                            </View>
                        </Pressable>

                        <Pressable onPress={toggleFacing}>
                            <View className="rounded-full p-2"
                                style={{
                                    backgroundColor: facing !== 'front' ? "black" : "white",
                                    padding: 10,
                                    borderRadius: 50,
                                }}
                            >
                                <SwitchCameraIcon size={32} color={facing === 'front' ? "black" : "white"} />
                            </View>
                        </Pressable>
                        <Pressable onPress={toggleMode}>
                            <View className="rounded-full bg-white p-2"
                                style={{
                                    backgroundColor: mode !== 'picture' ? "red" : "black",
                                    padding: 10,
                                    borderRadius: 50,
                                }}
                            >
                                {mode === "picture" ? (
                                    // photo icon
                                    <Camera size={32} color="white" />
                                ) : (
                                    // video icon
                                    <Feather name="video" size={32} color="white" />
                                )}
                            </View>
                        </Pressable>
                    </View>
                </View >
            </CameraView >


        );
    };
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
            cameraRef.current?.resumePreview();
        };
        return (
            <Actionsheet
                isOpen={showActionSheet}
                defaultIsOpen={false}
                closeOnOverlayClick={true}
                isKeyboardDismissable={true}
                trapFocus={false}
                // snapPoints={[0, 100, 200]}
                onOpen={() => {
                    cameraRef.current?.pausePreview();
                    // setShowActionSheet(true);
                    console.log("Actionsheet opened", { showActionSheet });
                }}
                onClose={() => {
                    cameraRef.current?.resumePreview();
                }}
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
                                                barcodeData: scannedData?.data ?? null,
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
                                icon={cameraLockRef.current ? CameraOff : Camera}
                                onBack={navigateBack}
                                onMenu={() => {
                                    // cameraLockRef.current = !cameraLockRef.current;
                                    setShowActionSheet(true);
                                    console.log("Actionsheet opened", { showActionSheet });
                                    // cameraRef.current?.pausePreview();
                                    // setSquareOverlay(false);
                                    // setLoading(false);
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
                {!cameraReady ? <LoadingOverlay visible noRedirect={true} /> : renderCamera()}

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