// import React, { useState } from "react";
// import { CameraView, CameraType } from "expo-camera";
// import { Box } from "@/components/ui/box";
// import { Button } from "@/components/ui/button";
// import { ButtonGroup } from "@/components/ui/button-group";
// import { Icon } from "@/components/ui/icon";
// import { Spinner } from "@/components/ui/spinner";
// import { HStack } from "@/components/ui/hstack";
// import { Toast } from "@/components/ui/toast";
// import {
//   CameraIcon,
//   CameraOff,
//   Focus,
//   ScanBarcodeIcon,
// } from "lucide-react-native";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { router } from "expo-router";
// // import CameraScreen from "./CameraScreen";

// /**
// //  * CameraDirections Enum
// //  * Defines possible directions for the camera.
// //  */
// // const CameraDirections = {
// //   back: "back",
// //   front: "front",
// // };

// /**
//  * ScanView Component
//  * Handles scanning barcodes/QR codes, displaying scanned results, and triggering mutations.
//  *
//  * @param {Object} props - Component props.
//  * @param {Function} props.scanCallback - Callback function to query data using scanned data.
//  * @param {Function} props.mutateCallBack - Callback function to mutate data after confirmation.
//  * @param {Object} props.mutationOutcomes - Options for mutation outcomes (onSuccess, onError, etc.).
//  * @returns {React.ReactNode} - ScanView component.
//  */
// const ScanView = ({
//   scanCallback,
//   mutateCallBack,
//   mutationOutcomes,
//   ...props
// }) => {
//   const [scannedData, setScannedData] = useState(null);
//   const [cameraDirection, setCameraDirection] = useState(CameraDirections.back);

//   // Query for data based on scannedData
//   const {
//     data: result,
//     error,
//     isLoading,
//   } = useQuery(["scannedData", scannedData], () => scanCallback(scannedData), {
//     enabled: !!scannedData, // Only run query if scannedData exists
//   });

//   // Mutation for confirmed data
//   const { mutate } = useMutation(mutateCallBack, mutationOutcomes);

//   /**
//    * Handles confirmation of scanned data and triggers mutation.
//    *
//    * @param {any} confirmedData - Data to mutate (e.g., restocking product).
//    */
//   const handleConfirm = (confirmedData) => {
//     console.log("Restocking:", confirmedData);
//     mutate(confirmedData); // Execute mutation with confirmed data
//     setScannedData(null); // Reset scanned data after mutation
//   };

//   /**
//    * Toggles the camera direction between back and front.
//    */
//   const toggleCamera = () => {
//     setCameraDirection((prev) =>
//       prev === CameraDirections.back
//         ? CameraDirections.front
//         : CameraDirections.back
//     );
//   };

//   /**
//    * Handles resetting scanned data and navigating to the product search screen.
//    */
//   const handleSearchInstead = () => {
//     setScannedData(null);
//     router.push("/search"); // Navigate to search
//   };

//   /**
//    * Handles resetting the scan state after an error.
//    */
//   const handleRetry = () => {
//     setScannedData(null);
//   };

//   return (
//     <Box>
//       {/* Camera View */}
//       {/* <CameraView
//         type={CameraType[cameraDirection]}
//         onBarCodeScanned={({ data }) => {
//           if (data) {
//             setScannedData(data); // Store scanned data
//           }
//         }}
//         {...props}
//       /> */}
//       {/* <cameraScreen /> */}

//       {/* Scanned Result */}
//       {result && (
//         <Toast variant="outline" action="success">
//           <ToastTitle>
//             Scanned:{" "}
//             {result?.title ?? result?.name ?? result?.product ?? "Unknown Item"}
//           </ToastTitle>
//           <ToastDescription>Confirm Product</ToastDescription>
//           <HStack space={1}>
//             <Button
//               action="positive"
//               isFocused={true}
//               onPress={() => handleConfirm(result)} // Call handleConfirm
//             >
//               Restock
//             </Button>
//             <Button
//               onPress={
//                 () => router.push(`${result.route}`) // Navigate to item's route
//               }
//             >
//               Go to Item
//             </Button>
//           </HStack>
//         </Toast>
//       )}

//       {/* Loading State */}
//       {isLoading && scannedData ? (
//         <Toast variant="outline" action="info" duration={3000}>
//           <ToastTitle>
//             <Spinner size="xs" />
//             <ScanBarcodeIcon /> Finding Matching Product
//           </ToastTitle>
//           <Button onPress={handleSearchInstead}>
//             <Icon as={Focus} size="xs" /> Search Instead
//           </Button>
//         </Toast>
//       ) : null}

//       {/* Error State */}
//       {error ? (
//         <Toast>
//           <ToastTitle>
//             <CameraOff /> Error Scanning
//           </ToastTitle>
//           <ToastDescription>
//             {error.message ?? "Unknown error occurred."}
//           </ToastDescription>
//           <Button onPress={handleRetry}>Retry</Button>
//         </Toast>
//       ) : null}

//       {/* Camera Controls */}
//       <ButtonGroup>
//         <Button onPress={toggleCamera}>
//           <CameraIcon /> Toggle Camera
//         </Button>
//       </ButtonGroup>
//     </Box>
//   );
// };

// export default ScanView;
// export { CameraDirections };


import {
    useRef,
    useEffect,
} from "react";
import {
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
} from "react-native";
// import { Link } from "expo-router";
// import SquareOverlay from "@/components/ui/camera";
import {
    isCameraAvailable,
    getCameraTypes,
} from "@/lib/camera/utils";
// import * as session from "@/lib/supabase/session";

import {
    BarcodeScanningResult,
    CameraMode,
    CameraType,
    CameraView,
    useCameraPermissions,
} from "expo-camera";
import { View, Button as RNButton, AppState } from 'react-native';
import { useState } from "react";

import { Feather } from "@expo/vector-icons";
import SquareOverlay from "@/components/ui/camera/SquareOverlay";
import * as Linking from 'expo-linking';
import * as ImagePicker from 'expo-image-picker';
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { Camera, CameraOff, Images, SquareDashed, SwitchCameraIcon } from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import { Badge } from "@/components/ui/badge";
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
import { LocationPermissionResponse, PermissionResponse } from "expo-location";

export default function ScanView() {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [uri, setUri] = useState<string | null | undefined>(null);
    const [mode, setMode] = useState<CameraMode>("picture");
    const [facing, setFacing] = useState<CameraType>("back");
    const [recording, setRecording] = useState(false);
    const [squareOverlay, setSquareOverlay] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<{
        id: string;
        title: string;
        description?: string;
        variant: "solid" | "outline";
        action: "success" | "error" | "info" | "warning";
    } | null | undefined>(null);
    const appState = useRef(AppState.currentState);
    const cameraLockRef = useRef<boolean>(false); // used to lock the camera
    useCameraPermissions();
    const [scannedData, setScannedData] =
        useState<BarcodeScanningResult | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const permissionsRef = useRef<null>(null);
    const [showPermissionModal, setShowPermissionModal] = useState<{
        variant: "camera" | "gallery" | "default";
        permissionResponse: PermissionResponse | null;
    } | null>(permissionsRef?.current ?? null);
    // const toast = useToast();

    //useEffect to locks camera screen for 2 seconds when app is not focused
    useEffect(() => {
        abortControllerRef.current = abortControllerRef?.current ?? new AbortController();
        const subscription =
            AppState.addEventListener(
                "change",
                (nextAppState) => {
                    if ( //going from background to foreground
                        appState.current.match(
                            /inactive|background/
                        ) &&
                        nextAppState ===
                        "active"
                    ) {
                        //unlock camera after app is back in the foreground
                        cameraLockRef.current = false;
                    }// set appState.current to the next app state
                    //if app is not in focus, lock the camera
                    else if (
                        appState.current === "active" &&
                        nextAppState.match(/inactive|background/)
                    ) {
                        cameraLockRef.current = true;
                    }
                    appState.current =
                        nextAppState;
                }
            );

        //lock camera after 2 seconds
        setAbortableTimeout({
            callback: () => {
                cameraLockRef.current = true;
            },
            delay: 2000,
            signal: abortControllerRef.current?.signal,
        })

        //clean up by removing the subscription
        return () => {
            subscription.remove();
        };
    }, []);



    const RequestPermissionModal = ({ variant }: { variant: "camera" | "gallery" | "default" } = { variant: "default" }) => {
        variant = variant ?? "default";

        const logPermissionOutcome = (permissionResponse: PermissionResponse | ImagePicker.CameraPermissionResponse) => {
            const { status } = permissionResponse || {};
            console.log({ status, variant });
            if (status === "granted") {
                alert(`Permission granted for ${variant}`);
                setShowPermissionModal(null);
            } else {
                alert(`Permission denied for ${variant}`);
                setShowPermissionModal(null);
            }
        };

        const requestPermissions = async () => {
            try {
                if (variant === "camera") {
                    const cameraPermission = await requestPermission();
                    logPermissionOutcome(cameraPermission);
                } else if (variant === "gallery") {
                    const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    logPermissionOutcome(galleryPermission);
                } else {
                    const cameraPermission = await requestPermission();
                    const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    logPermissionOutcome(cameraPermission);
                    logPermissionOutcome(galleryPermission);
                }
            } catch (error) {
                console.error("Error requesting permissions:", error);
            }
        };

        useEffect(() => {
            requestPermissions();
        }, []);

        return (
            <Modal
                isOpen={true}
                onClose={() => {
                    requestPermission();
                }}
                size="md"
            >
                <Center className="flex-1 h-[500px] m-2 p-2">
                    <Heading size="lg" className="text-center">
                        {!!variant ? `${variant}` : "Camera"} Permission
                    </Heading>
                    <GSText className="text-center">
                        We need your permission to use the camera
                    </GSText>
                    <VStack space="md" className="mt-4">
                        <GSButton
                            action="primary"
                            onPress={() => {
                                requestPermission();
                            }}>
                            <GSButtonText>
                                Request Camera Permission
                            </GSButtonText>

                        </GSButton>
                        <GSButton
                            action="secondary"
                            onPress={navigateBack}
                            variant="outline"
                            className="border-2 border-gray-300"
                            size="sm">
                            <GSButtonText>
                                Cancel
                            </GSButtonText>
                        </GSButton>

                    </VStack>

                </Center>
            </Modal>
        )
    }

    if (!permission || !permission.granted) {
        return (
            <View style={testCameraStyles.container}>
                <Text style={{ textAlign: "center" }}>
                    We need your permission to use the camera
                </Text>
                <RNButton onPress={requestPermission} title="Camera Permission Request" />
            </View>
        );
    }

    //function to 
    const navigateBack = () => {
        abortControllerRef.current = abortControllerRef.current ?? new AbortController();
        //abort any pending requests
        abortControllerRef.current?.abort();
        //clear data
        setScannedData(null);
        setUri(null);
        //lock camera
        cameraLockRef.current = true;
        router.canGoBack() ? router.back() : router.replace("/(tabs)");
    }

    const takePicture = async () => {
        abortControllerRef.current = abortControllerRef.current ?? new AbortController();
        if (permission?.granted === false) {
            requestPermission();
        }
        cameraLockRef.current = true; //lock camera
        const photo = await cameraRef.current?.takePictureAsync();
        setUri(photo?.uri as string);
        console.log({ photo, uri });
        // setTimeout(() => {
        //     cameraLockRef.current = false; //unlock camera
        // }, 2000); //unlock camera after 2 seconds
        setAbortableTimeout({
            callback: () => {
                cameraLockRef.current = false; //unlock camera
            },
            delay: 2000,
            signal: abortControllerRef.current?.signal,
        })
    }
    const recordVideo = async () => {
        if (recording) {
            setRecording(false);
            cameraRef.current?.stopRecording();
            return;
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
            <View>
                <RNImage
                    source={{ uri }} //ts-ignore
                    contentFit="contain"
                    style={{ width: 300, aspectRatio: 1 }}
                />
                <RNButton onPress={() => setUri(null)} title="Take another picture" />
            </View>
        );
    };

    //set the image picker to open the image library
    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });

        //on succecss
        if (!!result?.assets && !!result?.assets[0]?.uri) {
            setUri(result.assets[0].uri);
        }
        else if (!result.canceled) {
            console.log(result);
        } else {
            alert('You did not select any image.');
        }

    };

    const toggleSquareOverlay = () => {
        setSquareOverlay((prev) => !prev);
    }

    const parseLink = async (link: string) => {
        console.log('parsing link =>', { link });
        const parsedLink = await Linking.canOpenURL(link) ? Linking.parse(link) : null;
        if (parsedLink === null) {
            alert(`Failed to parse link ${link}`);
            return;
        }
        console.log("Parsed Link", parsedLink);
        const { queryParams, scheme, path } = parsedLink
        // let params = queryParams ?? {};
        // const filteredParams = !!params ? Object.keys(params).filter(
        //     param => param.toLowerCase().includes('id') || param.toLowerCase().includes('_id')
        // ) : [];
        //     param =>
        //         param.toLowerCase().includes(
        //             'id') ||
        //         param.toLowerCase().includes(
        //             '_id'
        //         )
        // ) : []

        // router.push({
        //     pathname: path as RelativePathString,
        //     params: params
        // })

        return await Linking.openURL(link)
    }

    const handleCodeScan = ({
        bounds,
        data,
        type,
    }: BarcodeScanningResult) => {

        // Lock camera view if if data is scanned for better user experience
        abortControllerRef.current = abortControllerRef.current ?? new AbortController();
        if (
            !!data && !cameraLockRef.current
        ) {
            //lock camera
            cameraLockRef.current = true;
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
                //TODO: add API  query to get product info for other types of barcodes
                else if (["ean13", "ean8", "upc_e"].includes(
                    type.toLowerCase()
                )) {

                    const { data: productData, error } = await supabase
                        .from("products")
                        .select()
                        .eq("barcode", data)
                        .single();
                    if (!!error) {
                        setToastMessage({
                            id: Math.random().toString(),
                            title: "Error fetching product by barcode",
                            description: error.message,
                            variant: "solid",
                            action: "error",
                        });

                        throw error;
                    };
                    console.log({ productData });

                    // const { data: productData } = await fetchProductByBarcode(data, {
                    //     signal,
                    //     controller,
                    // });
                    // console.log({ productData });
                    setScannedData(productData);
                }

            },
            delay: 1000,
            signal: abortControllerRef.current?.signal
        }
        );



    }


    const renderCamera = () => {
        return (
            <CameraView
                style={testCameraStyles.camera}
                // ref={cameraRef}
                mode={mode}
                facing={facing}
                mute={true} //record no sound since it's not needed
                // onBarcodeScanned={ }
                active={!!cameraLockRef?.current ? false : true} //lock camera when app is not in focus
                // autoFocus="on"
                // CameraOrientation="portrait"
                animateShutter={true}
                onCameraReady={() => {
                    console.log("Camera ready");
                    // setSquareOverlay(false);
                }}
                poster={"/assets/images/splash-icon.png"}
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
                onBarcodeScanned={handleCodeScan}
            >
                {/* <RoundedHeader
                    title="Camera"
                    icon={cameraLockRef.current ? CameraOff : Camera}
                    onMenu={() => {
                        cameraLockRef.current = !cameraLockRef.current;
                    }}

                /> */}

                <View style={testCameraStyles.shutterContainer}>

                    <Pressable onPress={pickImageAsync}>
                        <View
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: 50,
                                // width: '100%',
                                // height: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 10,
                                marginTop: 10,
                            }}
                        >

                            <Images size={32} color="#25292e" />
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
                                <View
                                    style={[
                                        testCameraStyles.shutterBtnInner,
                                        {
                                            backgroundColor: cameraLockRef.current ? "black" : mode === "picture" ? "white" : "red",
                                        },
                                    ]}
                                />
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
                                    cameraLockRef.current = !cameraLockRef.current;
                                }}
                            />
                        )
                    }
                }} />
            <View style={testCameraStyles.container}>

                {/* {squareOverlay && <SquareOverlay />} */}
                {!!showPermissionModal ? <RequestPermissionModal variant="default" /> : null}
                {uri ? renderPicture() : renderCamera()}
                {/* {renderCamera()} */}
            </View>
        </SafeAreaView>
    );
}

const testCameraStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
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