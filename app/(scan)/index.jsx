import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import { useState, useRef, useEffect } from "react";
import { Stack } from "expo-router";
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

export default function ScanScreen() {
  const [facing, setFacing] = useState(null);
  const cameraLockRef = useRef(false); // used to lock scanning after a success
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState(null);

  const appState = useRef(AppState.currentState);
  //TODO: fix this useEffect
  // // Check camera availability and types, then update facing
  // useEffect(() => {
  //   let mounted = true;
  //   (async () => {
  //     const available = await isCameraAvailable();
  //     if (!available || !mounted) return;

  //     const camTypes = await getCameraTypes();
  //     if (camTypes && camTypes.length > 0 && mounted) {
  //       setFacing(camTypes[0]); // e.g., "back" or "front"
  //     }

  //     // Request camera permission if not already granted
  //     if (!permission?.granted) {
  //       await requestPermission();
  //     }
  //   })();
  // }, []);

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

    // setTimeout(() => {
    //   setcameraLockRef(true);
    // }, 2000);

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
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
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
          // {Platform.OS === "ios" ? (<ScanningOptions isGuidanceEnabled={true} isHighlightingEnabled={true} barcodeTypes: [
          //   "aztec",
          //   "ean13", //accepted by open food facts API
          //   "ean8", //accepted by open food facts API
          //   "qr",
          //   "pdf417",
          //   "upc_e", //not sure if accepted by open food facts API
          //   "datamatrix",
          //   "code39",
          //   "code93",
          //   "itf14",
          //   "codabar",
          //   "code128",
          //   "upc_a", //not sure if accepted by open food facts API
          // ], isPinchToZoomEnabled={true}/>) : null}
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
              console.log("scanned the following data: ", data);
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
            >
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    </SafeAreaView>
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
