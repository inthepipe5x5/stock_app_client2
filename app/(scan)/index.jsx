import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Button,
  TouchableOpacity,
  SafeAreaView,
  AppState,
  Linking,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Stack, router } from "expo-router";

import SquareOverlay from "../../components/ui/SquareOverlay";
import { isCameraAvailable, getCameraTypes } from "../../lib/camera/utils";

export default function ScanScreen() {
  const [facing, setFacing] = useState(null);
  const cameraLockRef = useRef(false); // used to lock scanning after a success
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState(null);

  const appState = useRef(AppState.currentState);

  // Check camera availability and types, then update facing
  useEffect(() => {
    let mounted = true;
    (async () => {
      const available = await isCameraAvailable();
      if (!available || !mounted) return;

      const camTypes = await getCameraTypes();
      if (camTypes && camTypes.length > 0 && mounted) {
        setFacing(camTypes[0]); // e.g., "back" or "front"
      }

      // Request camera permission if not already granted
      if (!permission?.granted) {
        await requestPermission();
      }
    })();

    return () => {
      mounted = false;
    };
  }, [permission, requestPermission]);

  // Lock/unlock scanning if app goes to background/foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // from background to active => unlock camera
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        cameraLockRef.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [scannedData, cameraLockRef]);

  // If permission is still undefined or loading
  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  // If camera permission is denied
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  function handleBarCodeScanned({ data, type }) {
    if (!data) return;

    // lock scanning to prevent rapid multiple scans
    if (!cameraLockRef.current) {
      cameraLockRef.current = true;
      setScannedData(data);

      console.log("Scanned data:", data);
      setTimeout(async () => {
        // Example: open link if it's a QR code / URL
        const lowerType = type.toLowerCase();
        if (["qr", "url"].includes(lowerType)) {
          try {
            await Linking.openURL(data);
          } catch (err) {
            console.warn("Could not open URL:", data, err);
          }
        } else {
          // Handle other barcode types (fetch product info, etc.)
          console.log("Barcode type:", type);
        }
      }, 1500);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: "Product Scan",
          headerShown: false,
          statusBarTranslucent: true,
          statusBarHidden: true,
        }}
      />
      <View style={styles.cameraContainer}>
        {/* Camera View */}
        {facing && (
          <CameraView
            style={styles.camera}
            facing={facing}
            autoFocus="on"
            mode="picture"
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
            onBarCodeScanned={handleBarCodeScanned}
          >
            <SquareOverlay />
            {/* Overlay buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={toggleCameraFacing}
              >
                <Text style={styles.text}>Flip Camera</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
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
