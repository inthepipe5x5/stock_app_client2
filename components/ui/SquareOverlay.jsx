import React from "react";
import { View, StyleSheet } from "react-native";

const SquareOverlay = () => {
  return (
    <View style={styles.overlayContainer}>
      <View style={styles.centeredSquare} />
    </View>
  );
};

const styles = StyleSheet.create({
  /**
   * The full-screen container, slightly darkened.
   * Uses absolute fill to cover the entire camera view.
   */
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent black tint
    justifyContent: "center",
    alignItems: "center",
  },
  /**
   * The dashed square in the center.
   */
  centeredSquare: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: "white",
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
});

export default SquareOverlay;
