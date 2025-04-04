import React from "react";
import {
  View,
  StyleSheet,
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
    position: "fixed",
    top: "50%",
    left: "50%",
    width: 200,
    height: 200,
    borderWidth: 15,
    borderColor: "red",
    borderStyle: "dashed",
    backgroundColor: "transparent",
    transform: [
      { translateX: -100 },
      { translateY: -100 },
    ], // Center the square
  },
});

export default SquareOverlay;
