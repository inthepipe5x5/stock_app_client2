import { Camera } from "expo-camera";
import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import type { Code, CodeType, Frame } from 'react-native-vision-camera'
import { useMemo } from "react";
import axios from "axios";
import { GeneralCache, mmkvCache } from "../storage/mmkv";
import { CalculateWithinOverlay } from "@/components/ui/camera/SquareOverlay";
import normalizeBarcode from "@/utils/barcode";

// /**
//  * Returns an array of camera types supported by the device (e.g. ["front", "back"]).
//  */
// async function getCameraTypes() {
//   const cameraTypes =
//     await Camera.getAvailableCameraTypesAsync();
//   console.log(
//     "Available camera types:",
//     cameraTypes
//   );
//   return cameraTypes; // e.g. ["front", "back"]
// }

// /**
//  * Returns a boolean indicating whether the camera is available on the device.
//  */
// async function isCameraAvailable() {
//   console.info(
//     "checking camera availability",
//     { OS: Platform.OS }
//   );

//   if (Platform.OS === "web") {
//     const available =
//       await Camera.isAvailableAsync();
//     console.log(
//       "Is camera available?",
//       {
//         CameraAvailable: available,
//       }
//     );
//     return available;
//   }
//   // For iOS and Android, check permissions
//   const permissions =
//     await Camera.requestCameraPermissionsAsync();

//   switch (permissions?.status) {
//     case "granted":
//       return true; // Camera is available and permission granted
//     case "denied":
//       console.warn(
//         "Camera permission denied"
//       );
//       return false; // Camera is not available or permission denied
//     case "undetermined":
//       console.warn(
//         "Camera permission undetermined"
//       );
//       return false; // Camera is not available or permission undetermined
//     default:
//       console.error(
//         "Unknown camera permission status:",
//         permissions?.status
//       );
//       return false; // Default to false for any other status
//   }
// }
/** Utility function to convert a URI to a Blob.
 *  Supabase requires files to be uploaded as Blob objects.
 *  This util function uses axios to convert the image URI into a Blob:
 * @param {@string} uri
 * @returns { uri: string; blob: Blob; fileExtension: string | undefined; }
 *  @example
 */
export const uriToBlob = async (
  uri: string
) => {
  const response = await axios.get(
    uri,
    {
      responseType: "blob",
    }
  );
  return {
    uri,
    blob: response.data,
    fileExtension: uri.split(".").pop(),
  };
};

export const defaultCodeTypes = useMemo(() => {
  const codes = ['code-128'
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
    codes.push('upc-a');
  }
  return codes as CodeType[]
}, [])

export const defaultCodeHandler = async (
  { codes,
    frame,
    overlaySize = 200,
  }: {
    codes: Code[],
    frame: Frame,
    overlaySize?: number | null,
  }) => {
  const kv = await new mmkvCache().init()
  const boundarySize = frame?.width ?? overlaySize
  const parsedCodes = (codes ?? []).filter((code: Code) => {
    CalculateWithinOverlay({ code, overlaySize: boundarySize }) && !!code.value
  }).map((code => {
    return code?.value ?? null
  })
  )
  console.log("Filtered codes: ", parsedCodes.length ?? 0, { parsedCodes });
  //store the codes in the cache
  // kv.setScannedBarcodesByUserId(parsedCodes)
  return parsedCodes;
}
// export {
//   // getCameraTypes,
//   isCameraAvailable,
// };
