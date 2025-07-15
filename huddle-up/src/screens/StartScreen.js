import React from "react";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Button from "../components/Button";
import Paragraph from "../components/Paragraph";
import {
  ImageBackground,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import { theme } from "../core/theme";

export default function StartScreen({ navigation }) {
  return (
    <ImageBackground
      source={require("../assets/Background123.jpg")}
      style={styles.background}
    >
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <Logo />
        <Header>Lets Start</Header>
        <Paragraph>Join a team or create your own sport event!</Paragraph>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("LoginScreen")}
        >
          Login
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate("RegisterScreen")}
        >
          Sign Up
        </Button>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    backgroundColor: theme.colors.surface,
  },
  container: {
    flex: 1,
    padding: 35,
    position: "absolute",
    bottom: 100,
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    minHeight: 350,
    blurRadius: 10,
    borderRadius: 20,
  },
});
