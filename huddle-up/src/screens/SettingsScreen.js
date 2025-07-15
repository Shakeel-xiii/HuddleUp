import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { List, Divider, Avatar } from "react-native-paper";
import { formatName } from "../helpers/formatName";
import { useAuth } from "../core/AuthContext";
import { Modal, Pressable } from "react-native";



const fontFamily = Platform.OS === "ios" ? "Avenir" : "sans-serif";

export default function SettingsScreen({ userData, navigation }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const { loggedInUser, setLoggedInUser, setUserRole } = useAuth();

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    console.log(loggedInUser);
    if (userData) {
      setLoading(false);
    }
  }, [userData]);
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <ScrollView>
      <View style={styles.Header}>
        <Avatar.Image
          size={80}
          source={{
            uri:
              userData?.userPic + `?t=${new Date().getTime()}` ??
              "https://picsum.photos/200",
          }}
        />
        <View style={{ marginLeft: 16 }}>
          <Text style={styles.heroTitle}>{formatName(userData?.name)}</Text>
          <Text style={styles.heroSubtitle}>{userData?.email}</Text>
        </View>
      </View>
      <View style={styles.container}>
        <List.Section>
          <List.Subheader>Account Settings</List.Subheader>
          <List.Item
            title="Edit Profile"
            left={() => <List.Icon icon="account" />}
            onPress={() => {
              console.log(userData);
              navigation.navigate("EditProfile", {
                userData: userData,
              });
            }}
          />
          <List.Item
            title="Notifications"
            left={() => <List.Icon icon="bell" />}
            right={() => <Text style={styles.accessoryText}>Off</Text>}

            onPress={() => { }}
          />

          <List.Item
            title="Language"
            left={() => <List.Icon icon="translate" />}
            right={() => <Text style={styles.accessoryText}>English</Text>}
            onPress={() => { }}
          />
          <List.Item
            title="Logout"
            left={() => <List.Icon icon="logout" color="red" />}
            titleStyle={{ color: "red" }}
            onPress={() => {
              setLoggedInUser(null);
              setUserRole(null);
              print(loggedInUser);
            }}
          />
        </List.Section>
        <Divider />
        <List.Section>
          <List.Subheader>Preferences</List.Subheader>
          <List.Item
            title="Dark Mode"
            left={() => <List.Icon icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={() => setIsDarkMode(!isDarkMode)}
              />
            )}
          />
          <List.Item
            title="Location Services"
            left={() => <List.Icon icon="map-marker" />}
            right={() => (
              <Switch
                value={isLocationEnabled}
                onValueChange={() => setIsLocationEnabled(!isLocationEnabled)}
              />
            )}
          />
        </List.Section>
        <Divider />
        <List.Section>
          <List.Subheader>About</List.Subheader>
          <List.Item
            title="Terms of Service"
            left={() => <List.Icon icon="file-document" />}
            onPress={() => setShowTerms(true)}
          />
          <List.Item
            title="Privacy Policy"
            left={() => <List.Icon icon="shield" />}
            onPress={() => setShowPrivacy(true)}
          />
          <List.Item
            title="App Version"
            left={() => <List.Icon icon="information" />}
            right={() => <Text style={styles.accessoryText}>v1.0.0</Text>}
          />
        </List.Section>
      </View>
      <Modal
        visible={showPrivacy}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrivacy(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <ScrollView>
              <Text style={styles.modalText}>
                Your privacy is important to us. HuddleUp collects limited user data for account management and event functionality. We do not sell or share personal data with third parties.
              </Text>
            </ScrollView>
            <Pressable onPress={() => setShowPrivacy(false)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTerms}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTerms(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Terms of Service</Text>
            <ScrollView>
              <Text style={styles.modalText}>
                By using HuddleUp, you agree to follow community guidelines and not engage in harmful activities. Event creators are responsible for managing their events.
              </Text>
            </ScrollView>
            <Pressable onPress={() => setShowTerms(false)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </ScrollView>


  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(240, 238, 232, 0.25)",
    paddingLeft: 20,
    paddingRight: 20,
  },
  Header: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  heroTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: "bold",
  },
  heroSubtitle: {
    fontFamily,
    fontSize: 14,
    color: "#666",
  },
  accessoryText: {
    color: "#999",
    marginRight: 16,
    fontSize: 16,
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
},
modalContainer: {
  width: "90%",
  backgroundColor: "white",
  borderRadius: 12,
  padding: 20,
  maxHeight: "80%",
},
modalTitle: {
  fontSize: 20,
  fontWeight: "bold",
  marginBottom: 10,
},
modalText: {
  fontSize: 16,
  lineHeight: 22,
},
closeText: {
  color: "blue",
  marginTop: 15,
  textAlign: "right",
  fontWeight: "bold",
}
});
