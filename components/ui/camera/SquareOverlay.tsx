import { BarcodeScanningResult } from "expo-camera";
import React from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Code } from "react-native-vision-camera";

type SquareOverlayProps = {
  size?: number, // Optional size prop for the square
  color?: string, // Optional color prop for the square
  borderWidth?: number, // Optional border width prop for the square
  borderColor?: string, // Optional border color prop for the square
  borderStyle?: "solid" | "dotted" | "dashed", // Optional border style prop for the square
  backgroundColor?: string, // Optional background color prop for the square
};

//#region Calculate Overlay Area
export const SquareOverlayArea = (
  SQUARE_SIZE = 200
): {
  x: number //difference between the screen width and the square width
  y: number //difference between the screen height and the square height
  width: number //width of the square
  height: number //height of the square
} => {
  const {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  } = useWindowDimensions();
  // Calculate the square overlay area based on the screen dimensions
  return Platform.OS === "android"
    ? {
      x: 0, // Full width for Android because the barcode scanning area is the full screen
      y:
        (SCREEN_HEIGHT -
          SQUARE_SIZE) /
        2,
      width: SCREEN_WIDTH,
      height: SQUARE_SIZE,
    }
    : {
      x:
        (SCREEN_WIDTH - SQUARE_SIZE) /
        2,
      y:
        (SCREEN_HEIGHT -
          SQUARE_SIZE) /
        2,
      width: SQUARE_SIZE,
      height: SQUARE_SIZE,
    };
};

// utility function to check if the scanned code is within the overlay area
export const CalculateWithinOverlay = ({ code, overlaySize }:
  { code: Code | BarcodeScanningResult, overlaySize?: number | null }): Boolean => {

  const emptyBounds = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  // Check if the code is a valid object and has the required properties
  if (!code || typeof code !== 'object') {
    console.error("Invalid code object:", code);
    return false; // Invalid code object, return false
  }
  // Calculate the position of the code within the overlay area
  const boundaryKeys = ['frame', 'corners', 'bounds', 'cornerPoints'];
  // Check if the code has any of the boundary keys
  const hasBoundaries = boundaryKeys.find((key) => {
    return (key in code) && (code as any)[key] !== undefined;
  });

  if (!hasBoundaries && Object.keys(code).length !== Object.keys(emptyBounds).length) {
    console.error("Code does not have the required boundaries:", code);
    return false; // No boundaries found, return false
  }

  const { x, y, width, height } = hasBoundaries && hasBoundaries in code
    ? (code as any)[hasBoundaries]
    : emptyBounds

  // Assuming a square size of 200 for the overlay  
  const area = SquareOverlayArea(overlaySize ?? 200);
  // Check full barcode bounds
  const isWithinX = x >= area.x && (x + width) <= (area.x + area.width);
  const isWithinY = y >= area.y && (y + height) <= (area.y + area.height);
  return isWithinX && isWithinY;
}

//#region SquareOverlay 
const SquareOverlay = (props: SquareOverlayProps = {
  size: 200,
  backgroundColor: 'transparent'
}) => {
  const { size, backgroundColor, borderColor, borderStyle, borderWidth } = props;
  const area = SquareOverlayArea(size ?? 200); // 200 is the default size of the square

  return (
    <View
      style={styles.overlayContainer}
    >
      {/* Centered square with absolute positioning */}
      <View
        style={[
          styles.centeredSquare,
          {
            zIndex: 1,
            transform: [
              { translateX: Math.abs(Number(area.x)) },
              { translateY: Math.abs(Number(area.y)) },
            ]
          },
          {
            minHeight: area.height, minWidth: area.width,
            maxHeight: area.height, maxWidth: area.width,
            backgroundColor: backgroundColor ?? "transparent",
            borderWidth: borderWidth ?? 5,
            borderColor: borderColor ?? "#FF0000", // Default red color
            borderStyle: borderStyle ?? "dashed",
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  /**
   * The full-screen container, slightly darkened.
   * Uses absolute fill to cover the entire camera view.
   */
  overlayContainer: {
    // ...StyleSheet.absoluteFillObject,
    backgroundColor:
      "rgba(0, 0, 0, 0.8)", // Semi-transparent black tint
  },
  /**
   * The dashed square in the center.
   */
  centeredSquare: {
    position: "absolute",
    top: "50%",
    left: "50%",
    borderWidth: 5,
    backgroundColor: "transparent",
  },
});


export default SquareOverlay;
