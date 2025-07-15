import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import calculateAge from "../helpers/calculateAge";
import { useAuth } from "../core/AuthContext";
import { removeFriendReq, sendFriendReq } from "../firebase/firestoreUsage";

function ReqCard({ userData, friendsend = false }) {
  const [isFriend, setIsFriend] = useState(friendsend);
  const [modalVisible, setModalVisible] = useState(false);
  const { loggedInUser } = useAuth();
  return (
    <>
      <Modal
        key={userData.uid}
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
                <Text>Interest In: </Text>
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
                  Age: {calculateAge(userData?.birthdate.seconds * 1000)} Years
                  Old
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

        {isFriend ? (
          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={async () => {
                try {
                  await removeFriendReq(loggedInUser, userData.uid);
                  setIsFriend(!isFriend);
                } catch (error) {
                  console.log(error);
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
              <MaterialIcons name="person-remove" size={24} color="red" />
              <Text
                style={{
                  marginLeft: 5,
                  color: "red",
                }}
              >
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={async () => {
                try {
                  await sendFriendReq(loggedInUser, userData.uid);
                  setIsFriend(!isFriend);
                } catch (error) {
                  console.log(error);
                }

                console.log("Friend clicked!");
              }}
              style={{
                marginRight: 0,
                padding: 5,
                width: 125,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: "green",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="person-add" size={24} color="green" />
              <Text
                style={{
                  marginLeft: 5,
                  color: "green",
                }}
              >
                Add Friend
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* <TouchableOpacity
          onPress={() => console.log("Unfriend clicked!")}
          style={{
            padding: 5,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: "red",
          }}
        >
          <MaterialIcons name="close" size={24} color="red" />
        </TouchableOpacity> */}
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
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

export default ReqCard;
