import React from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from "react-native";

const SquareOverlay = () => {
  return (
    <View
      style={styles.overlayContainer}
    >
      {/* Centered square with absolute positioning */}
      <View
        style={styles.centeredSquare}
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
    width: 200,
    height: 200,
    borderWidth: 15,
    borderColor: "grey",
    borderStyle: "dashed",
    backgroundColor: "transparent",
    transform: [
      { translateX: -100 },
      { translateY: -100 },
    ], // Center the square
  },
});

export const SquareOverlayArea = (
  SQUARE_SIZE = 200
) => {
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

export default SquareOverlay;
