// filepath: /c:/Users/haoli/Documents/dev/stock_app_client2/app/(scan)/index.jsx
import { Camera, CameraType, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Linking,
} from "react-native";
import { Link } from "expo-router";
import SquareOverlay from "../../components/ui/SquareOverlay";

export default function ScanScreen() {
  const [facing, setFacing] = useState(CameraType.back);
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState(null);

  if (!permission) {
    // Camera permissions are still loading.
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
    setFacing((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          type={facing}
          onBarCodeScanned={(data) => {
            // Set delay for better user experience when scanning data
            setTimeout(async () => {
              console.log("scanned the following data: ", data);
              await Linking.openURL(data);
            }, 1500);
            setScannedData(data);
          }}
        >
          <SquareOverlay />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
            <Link replace href="/(tabs)/auth">
              <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Go Home</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Camera>
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
