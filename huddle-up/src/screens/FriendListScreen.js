import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import Background from "../components/Background";
import Header from "../components/Header";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import { Search, Sort } from "../components/topBar";
import { getUsers, removeFriend } from "../firebase/firestoreUsage";
import { useAuth } from "../core/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import calculateAge from "../helpers/calculateAge";

export default function SearchUsers({ navigation }) {
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { loggedInUser } = useAuth();
  useEffect(() => {
    if (!loggedInUser) {
      navigation.reset({
        index: 0,
        routes: [{ name: "StartScreen" }],
      });
    }
    getusers();
  }, []);
  useMemo(() => {
    if (!users) return [];
    setFilteredUsers(
      users.filter((user) => {
        const matchesLocation =
          selectedLocation.length === 0 ||
          selectedLocation.includes(user.location || "");
        const matchesCategory =
          selectedCategory.length === 0 ||
          selectedCategory.includes(user.favourite || "");
        const matchesSearch =
          !searchQuery ||
          user.name?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesLocation && matchesCategory && matchesSearch;
      })
    );
  }, [users, selectedLocation, selectedCategory, searchQuery]);
  async function getusers() {
    try {
      let users = await getUsers();
      users = users.filter((user) => user?.friends.includes(loggedInUser));
      setUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }
  const clearFilters = () => {
    setSelectedLocation([]);
    setSelectedCategory([]);
    setSearchQuery("");
  };
  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Header>Friends List</Header>
      <View style={styles.container}>
        <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <Sort
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <Button
          style={styles.clearButton}
          labelStyle={styles.clearButtonText}
          onPress={clearFilters}
        >
          Clear Filters
        </Button>
        <ScrollView>
          {filteredUsers &&
            filteredUsers?.map((userData) => (
              <View key={userData?.uid}>
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={modalVisible}
                  onRequestClose={() => {
                    setModalVisible(!modalVisible);
                  }}
                >
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                    }}
                    onPressIn={() => setModalVisible(!modalVisible)}
                    activeOpacity={1}
                  >
                    <Image
                      source={{ uri: userData?.background_url }}
                      style={{
                        width: "90%",
                        height: 150,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                      }}
                      resizeMode="cover"
                    />
                    <TouchableWithoutFeedback>
                      <View
                        style={{
                          width: "90%",
                          height: "35%",
                          backgroundColor: "white",
                          borderBottomEndRadius: 20,
                          borderBottomLeftRadius: 20,
                          padding: 35,
                          alignItems: "center",
                          shadowColor: "#000",
                          shadowOffset: {
                            width: 0,
                            height: 2,
                          },
                          shadowOpacity: 0.25,
                          shadowRadius: 4,
                          elevation: 5,
                        }}
                      >
                        <Image
                          source={{
                            uri: userData?.userPic,
                          }}
                          style={{
                            width: 100,
                            height: 100,
                            borderRadius: 50,
                            position: "absolute",
                            top: -50,
                            borderColor: "black",
                            borderWidth: 2,
                            backgroundColor: "white",
                          }}
                        />
                        <View
                          style={{
                            width: "100%",
                            marginTop: 20,
                          }}
                        >
                          <Text>Name: {userData?.name}</Text>
                          <Text>Interests: </Text>
                          <View
                            style={{
                              flexDirection: "row",
                              flexWrap: "wrap",
                              alignItems: "flex-start",
                              justifyContent: "center",
                              marginHorizontal: "auto",
                              marginVertical: 5,
                            }}
                          >
                            {userData?.favourite.map((tag, index) => (
                              <Text key={index} style={styles.tagStyle}>
                                {tag}
                              </Text>
                            ))}
                          </View>
                          <Text>
                            Age:{" "}
                            {calculateAge(userData?.birthdate?.seconds * 1000)}{" "}
                            Years Old
                          </Text>
                          <Text>Location: {userData?.location}</Text>
                          <Text>Gender: {userData?.gender}</Text>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  </TouchableOpacity>
                </Modal>
                <TouchableOpacity
                  style={styles.card}
                  onPress={(event) => {
                    const { locationX, locationY } = event.nativeEvent;

                    // Define areas for the buttons
                    const buttonAreaX = 300; // X-coordinate where buttons start
                    const buttonAreaY = 5; // Y-coordinate where buttons start
                    // Check if the touch was within the button area
                    if (locationX >= buttonAreaX && locationY >= buttonAreaY) {
                      return; // Do nothing if the touch is within the buttons' area
                    }
                    setModalVisible(true);
                  }}
                >
                  <Image
                    source={{
                      uri: userData?.userPic,
                    }}
                    style={styles.image}
                  />
                  <View style={styles.content}>
                    <Text style={styles.title}>{userData?.name}</Text>
                    <Text style={styles.description}>{userData?.location}</Text>
                  </View>
                  <View style={styles.buttons}>
                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          await removeFriend(loggedInUser, userData?.uid);
                          setUsers(
                            users.filter((user) => user.uid !== userData?.uid)
                          );
                        } catch (error) {
                          console.error("Error fetching users:", error);
                        }
                        console.log("Remove clicked!");
                      }}
                      style={{
                        marginRight: 0,
                        padding: 5,
                        width: 125,
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: "red",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MaterialIcons
                        name="person-remove"
                        size={24}
                        color="red"
                      />
                      <Text
                        style={{
                          marginLeft: 5,
                          color: "red",
                        }}
                      >
                        UnFriend
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
        </ScrollView>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
  clearButton: {
    backgroundColor: "#528848",
    color: "#fff",
    padding: 2,
    borderRadius: 50,
  },
  clearButtonText: {
    color: "#fff",
  },
  card: {
    flexDirection: "row",
    padding: 10,
    margin: 4,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  content: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    color: "#666",
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagStyle: {
    marginRight: 5,
    fontSize: 14,
    alignItems: "flex-start",
    borderRadius: 14,
    backgroundColor: "white",
    shadowColor: "#000",
    margin: 3,
    paddingHorizontal: 16,
    paddingVertical: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 5,
  },
});
