// import React, { useState } from "react";
// import { CameraView, CameraType } from "expo-camera";
// import { Box } from "@/components/ui/box";
// import { Button } from "@/components/ui/button";
// import { ButtonGroup } from "@/components/ui/button-group";
// import { Icon } from "@/components/ui/icon";
// import { Spinner } from "@/components/ui/spinner";
// import { HStack } from "@/components/ui/hstack";
// import { Toast } from "@/components/ui/toast";
// import { ToastTitle } from "@/components/ui/toast-title";
// import { ToastDescription } from "@/components/ui/toast-description";
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
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import { useState, useRef, useEffect } from "react";
import { router, Stack } from "expo-router";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Linking,
  AppState,
  StatusBar,
  Platform,
} from "react-native";
// import { Link } from "expo-router";
import SquareOverlay from "../../components/ui/camera/SquareOverlay";
// import { isCameraAvailable, getCameraTypes } from "../../lib/camera/utils";
// import * as session from "@/lib/supabase/session";

export default function ScanView() {
  const [facing, setFacing] = useState(null);
  const [availableCameras, setAvailableCameras] = useState(
    Camera.isAvailableAsync() ? [] : null
  );
  const cameraLockRef = useRef(false); // used to lock scanning after a success
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState(null);

  const appState = useRef(AppState.currentState);
  //TODO: fix this useEffect
  // // Check camera availability and types, then update facing
  useEffect(() => {
    let mounted = true;
    (async () => {
      const available = await isCameraAvailable();
      if (!available || !mounted) return;

      const camTypes = await getCameraTypes();
      if (camTypes && camTypes.length > 0 && mounted) {
        setAvailableCameras(camTypes);
        setFacing(camTypes[0]); // e.g., "back" or "front"
      }

      // Request camera permission if not already granted
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, [availableCameras, permission]);

  //useEffect to locks camera screen for 3 seconds when app is not focused
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        appState.nextAppState === "active"
      ) {
        //unlock camera after app is back in the foreground
        cameraLockRef.current = false;
      }
      appState.current = nextAppState;
    });

    setTimeout(() => {
      cameraLockRef(true);
    }, 2000);

    //clean up by removing the subscription
    return () => {
      subscription.remove();
    };
  }, [scannedData, cameraLockRef]);

  if (!permission) {
    // Camera permissions are still loading.
    // requestPermission(); // This will trigger a re-render.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    if (!isTruthy(availableCameras) || !availableCameras.length) return;
    setFacing((current) => availableCameras.find((c) => c !== current));
  }

  return availableCameras !== null ? (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <View style={styles.cameraContainer}>
        <Stack.Screen
          options={{
            title: "Product Scan",
            headerShown: false,
            statusBarTranslucent: true,
            statusBarHidden: true,
          }}
        />
        {/* {Platform.OS === "android" ? <StatusBar hidden /> : null} */}
        <CameraView
          style={styles.camera}
          facing={facing}
          active={cameraLockRef}
          autoFocus="on"
          mode="picture"
          CameraOrientation="portrait"
          animateShutter={true}
          // {Platform.OS === "ios" ? (<ScanningOptions isGuidanceEnabled={true} isHighlightingEnabled={true} isPinchToZoomEnabled={true}/>) : null}
          barcodeScannerSettings={{
            barcodeTypes: [
              "aztec",
              "ean13",
              "ean8",
              "qr",
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
          onBarCodeScanned={({ bounds, data, cornerPoints, type }) => {
            // Set delay for better user experience when scanning data
            if (data && !cameraLockRef.current) {
              //lock camera
              cameraLockRef.current = true;
            }
            setTimeout(async () => {
              console.log(`scanned the following data type ${type}: `, data);
              //if data is scanned and camera is not locked

              ["qr", "url"].includes(type.toLowerCase())
                ? await Linking.openURL(data)
                : null; //TODO: add API  query to get product info for other types of barcodes
            }, 1500);
            setScannedData(data);
          }}
        >
          {/* Overlay on top of the camera */}
          <SquareOverlay />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={toggleCameraFacing}
              disabled={
                cameraLockRef.current ||
                !isTruthy(availableCameras) ||
                availableCameras.length < 2
              }
            >
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    </SafeAreaView>
  ) : (
    <View style={styles.container}>
      <Text style={styles.message}>Camera is not available on this device</Text>
      <Button
        style={styles.button}
        onPress={() => router.back()}
        title="Go back"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
