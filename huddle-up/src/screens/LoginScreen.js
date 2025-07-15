import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import Background from "../components/Background";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import BackButton from "../components/BackButton";
import { theme } from "../core/theme";
import { passwordValidator } from "../helpers/passwordValidator";
import { signIn } from "../firebase/firebaseAuth";
import { useAuth } from "../core/AuthContext";
import { getUserRole } from "../firebase/firestoreUsage";

function emailValidator(email) {
  const re = /\S+@\S+\.\S+/;
  if (!email) return "Email can't be empty.";
  if (!re.test(email)) return "Ooops! We need a valid email address.";
  return "";
}
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loggedInUser, setLoggedInUser, setUserRole } = useAuth();

  useEffect(() => {
    if (loggedInUser) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      });

      const fetchRole = async () => {
        try {
          const role = await getUserRole(loggedInUser);
          setUserRole(role);
          console.log("Role: " + role);
        } catch (error) {
          console.error("Failed to get user role:", error);
        }
      };
      fetchRole();
    }
  }, [loggedInUser]);
  // const [user, setUser] = useState(null);
  const onLoginPressed = async () => {
    setIsSubmitting(true);
    try {
      const emailError = emailValidator(email.value);
      const passwordError = passwordValidator(password.value);
      if (emailError || passwordError) {
        setEmail({ ...email, error: emailError });
        setPassword({ ...password, error: passwordError });
        return;
      }
      const user = await signIn(email.value, password.value);
      if (user === null) {
        setEmail({ ...email, error: "Invalid email or password" });
        setPassword({ ...password, error: "Invalid email or password" });
        return;
      }
      setLoggedInUser(user);
      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: "Dashboard" }],
      // });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Background style={{ width: "120%" }}>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Welcome back.</Header>
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: "" })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: "" })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <View style={styles.forgotPassword}>
        <TouchableOpacity
          onPress={() => navigation.navigate("ResetPasswordScreen")}
        >
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>
      {isSubmitting ? (
        <View
          style={{
            width: "100%",
            marginTop: 18,
            backgroundColor: theme.colors.primary,
            borderRadius: 25,
            paddingVertical: 6,
          }}
        >
          <ActivityIndicator size="large" color={"white"} />
        </View>
      ) : (
        <Button
          mode="contained"
          onPress={onLoginPressed}
          style={{ marginVertical: 0, marginTop: 18 }}
        >
          Login
        </Button>
      )}
      <View style={styles.row}>
        <Text>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace("RegisterScreen")}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
});
