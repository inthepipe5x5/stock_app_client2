import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import { CameraOff, ScanBarcodeIcon } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import { Camera, useCameraPermissions } from "expo-camera";
// import ScanView from "./ScanView";

/** ScanViewLayout
 * General layout for the scan view to scan barcodes and QR codes.
 * @param {*ReactElement} children
 * @param {*props} props
 */
const ScanViewLayout = (children, { props }) => {
  // const [cameraStatus, setCameraStatus] = useState(false); //if truthy, render camera layout view
  // const [cameraPermissions, requestCameraPermissions] = useCameraPermissions();
  // const router = useRouter();

  //handle camera permissions not granted
  if (!cameraPermissions) {
    return (
      <Toast placement={Platform.OS === "web" ? "top" : "bottom"}>
        <ToastTitle>
          <CameraOff /> Camera Permissions Required
        </ToastTitle>
        <ToastDescription>
          Please enable camera permissions to use the scanner.
        </ToastDescription>
        <Button onPress={requestCameraPermissions}>Enable Permissions</Button>
      </Toast>
    );
  }

  return cameraStatus ? (
    <ScanView {...props} />
  ) : (
    <Center>
      <Button onPress={() => setCameraStatus(true)} action="primary">
        <ScanBarcodeIcon />
        Start Scanning
      </Button>
      {children}
    </Center>
  );
};

export default ScanViewLayout;
