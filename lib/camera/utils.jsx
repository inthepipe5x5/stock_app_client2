import { Camera } from "expo-camera";

/**
 * Returns an array of camera types supported by the device (e.g. ["front", "back"]).
 */
async function getCameraTypes() {
  const cameraTypes = await Camera.getAvailableCameraTypesAsync();
  console.log("Available camera types:", cameraTypes);
  return cameraTypes; // e.g. ["front", "back"]
}

/**
 * Returns a boolean indicating whether the camera is available on the device.
 */
async function isCameraAvailable() {
  const available = await Camera.isAvailableAsync();
  console.log("Is camera available?", available);
  return available;
}

export { getCameraTypes, isCameraAvailable };
