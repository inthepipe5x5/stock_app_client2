import { Camera } from "expo-camera";
import { Platform } from "react-native";

/**
 * Returns an array of camera types supported by the device (e.g. ["front", "back"]).
 */
async function getCameraTypes() {
  const cameraTypes =
    await Camera.getAvailableCameraTypesAsync();
  console.log(
    "Available camera types:",
    cameraTypes
  );
  return cameraTypes; // e.g. ["front", "back"]
}

/**
 * Returns a boolean indicating whether the camera is available on the device.
 */
async function isCameraAvailable() {
  console.info(
    "checking camera availability",
    { OS: Platform.OS }
  );

  if (Platform.OS === "web") {
    const available =
      await Camera.isAvailableAsync();
    console.log(
      "Is camera available?",
      {
        CameraAvailable: available,
      }
    );
    return available;
  }
  // For iOS and Android, check permissions
  const permissions =
    await Camera.requestCameraPermissionsAsync();

  switch (permissions?.status) {
    case "granted":
      return true; // Camera is available and permission granted
    case "denied":
      console.warn(
        "Camera permission denied"
      );
      return false; // Camera is not available or permission denied
    case "undetermined":
      console.warn(
        "Camera permission undetermined"
      );
      return false; // Camera is not available or permission undetermined
    default:
      console.error(
        "Unknown camera permission status:",
        permissions?.status
      );
      return false; // Default to false for any other status
  }
}

export {
  getCameraTypes,
  isCameraAvailable,
};
