import React from "react";
import { View, StyleSheet } from "react-native";

const SquareOverlay = () => {
  return (
    <View style={styles.overlayContainer}>
      <View style={styles.overlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: "white",
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
});

export default SquareOverlay;
