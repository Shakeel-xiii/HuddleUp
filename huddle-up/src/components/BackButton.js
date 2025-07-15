import React from "react";
import { TouchableOpacity, Image, StyleSheet } from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";

export default function BackButton({ goBack, style }) {
  return (
    <TouchableOpacity onPress={goBack} style={[styles.container, style]}>
      <Image
        style={styles.image}
        source={require("../assets/arrow_back.png")}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    position: "absolute",
    top: 5 + getStatusBarHeight(),
    left: 8,
  },
  image: {
    width: 24,
    height: 24,
  },
});
