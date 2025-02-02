import React, { useState } from "react";
import { CameraView, CameraType } from "expo-camera";
import {
  Box,
  Button,
  ButtonGroup,
  Icon,
  Spinner,
  HStack,
} from "@gluestack-ui/themed";
import { Toast, ToastTitle, ToastDescription } from "@gluestack-ui/themed";
import {
  CameraIcon,
  CameraOff,
  Focus,
  ScanBarcodeIcon,
} from "lucide-react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import cameraScreen from "./cameraScreen";

/**
 * CameraDirections Enum
 * Defines possible directions for the camera.
 */
const CameraDirections = {
  back: "back",
  front: "front",
};

/**
 * ScanView Component
 * Handles scanning barcodes/QR codes, displaying scanned results, and triggering mutations.
 *
 * @param {Object} props - Component props.
 * @param {Function} props.scanCallback - Callback function to query data using scanned data.
 * @param {Function} props.mutateCallBack - Callback function to mutate data after confirmation.
 * @param {Object} props.mutationOutcomes - Options for mutation outcomes (onSuccess, onError, etc.).
 * @returns {React.ReactNode} - ScanView component.
 */
const ScanView = ({
  scanCallback,
  mutateCallBack,
  mutationOutcomes,
  ...props
}) => {
  const [scannedData, setScannedData] = useState(null);
  const [cameraDirection, setCameraDirection] = useState(CameraDirections.back);

  // Query for data based on scannedData
  const {
    data: result,
    error,
    isLoading,
  } = useQuery(["scannedData", scannedData], () => scanCallback(scannedData), {
    enabled: !!scannedData, // Only run query if scannedData exists
  });

  // Mutation for confirmed data
  const { mutate } = useMutation(mutateCallBack, mutationOutcomes);

  /**
   * Handles confirmation of scanned data and triggers mutation.
   *
   * @param {any} confirmedData - Data to mutate (e.g., restocking product).
   */
  const handleConfirm = (confirmedData) => {
    console.log("Restocking:", confirmedData);
    mutate(confirmedData); // Execute mutation with confirmed data
    setScannedData(null); // Reset scanned data after mutation
  };

  /**
   * Toggles the camera direction between back and front.
   */
  const toggleCamera = () => {
    setCameraDirection((prev) =>
      prev === CameraDirections.back
        ? CameraDirections.front
        : CameraDirections.back
    );
  };

  /**
   * Handles resetting scanned data and navigating to the product search screen.
   */
  const handleSearchInstead = () => {
    setScannedData(null);
    router.push("/search"); // Navigate to search
  };

  /**
   * Handles resetting the scan state after an error.
   */
  const handleRetry = () => {
    setScannedData(null);
  };

  return (
    <Box>
      {/* Camera View */}
      {/* <CameraView
        type={CameraType[cameraDirection]}
        onBarCodeScanned={({ data }) => {
          if (data) {
            setScannedData(data); // Store scanned data
          }
        }}
        {...props}
      /> */}
      <cameraScreen />

      {/* Scanned Result */}
      {result && (
        <Toast variant="outline" action="success">
          <ToastTitle>
            Scanned:{" "}
            {result?.title ?? result?.name ?? result?.product ?? "Unknown Item"}
          </ToastTitle>
          <ToastDescription>Confirm Product</ToastDescription>
          <HStack space={1}>
            <Button
              action="positive"
              isFocused={true}
              onPress={() => handleConfirm(result)} // Call handleConfirm
            >
              Restock
            </Button>
            <Button
              onPress={
                () => router.push(`${result.route}`) // Navigate to item's route
              }
            >
              Go to Item
            </Button>
          </HStack>
        </Toast>
      )}

      {/* Loading State */}
      {isLoading && scannedData && (
        <Toast variant="outline" action="info" duration={3000}>
          <ToastTitle>
            <Spinner size="xs" />
            <ScanBarcodeIcon /> Finding Matching Product
          </ToastTitle>
          <Button onPress={handleSearchInstead}>
            <Icon as={Focus} size="xs" /> Search Instead
          </Button>
        </Toast>
      )}

      {/* Error State */}
      {error && (
        <Toast>
          <ToastTitle>
            <CameraOff /> Error Scanning
          </ToastTitle>
          <ToastDescription>
            {error.message ?? "Unknown error occurred."}
          </ToastDescription>
          <Button onPress={handleRetry}>Retry</Button>
        </Toast>
      )}

      {/* Camera Controls */}
      <ButtonGroup>
        <Button onPress={toggleCamera}>
          <CameraIcon /> Toggle Camera
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default ScanView;
export { CameraDirections };
