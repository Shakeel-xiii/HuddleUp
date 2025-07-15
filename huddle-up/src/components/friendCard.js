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

const Card = ({ userData, removeFriend, addFriend }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      {/* ---------- MODAL FOR USER PROFILE ---------- */}
      <Modal
        key={userData.uid}
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
          activeOpacity={1}
        >
          <Image
            source={{ uri: userData?.background_url }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Image
                source={{ uri: userData?.userPic }}
                style={styles.modalAvatar}
              />
              <View style={styles.modalTextSection}>
                <Text style={styles.nameText}>{userData?.name}</Text>
                <Text style={styles.sectionLabel}>Interests:</Text>
                <View style={styles.tagContainer}>
                  {userData?.favourite?.map((tag, index) => (
                    <Text key={index} style={styles.tag}>
                      {tag}
                    </Text>
                  ))}
                </View>
                <Text style={styles.infoText}>
                  Age: {calculateAge(userData?.birthdate.seconds * 1000)} years
                </Text>
                <Text style={styles.infoText}>Location: {userData?.location}</Text>
                <Text style={styles.infoText}>Gender: {userData?.gender}</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* ---------- MAIN CARD ---------- */}
      <TouchableOpacity
        style={styles.card}
        onPress={(event) => {
          const { locationX, locationY } = event.nativeEvent;
          if (locationX >= 300 && locationY >= 5) return;
          setModalVisible(true);
        }}
      >
        <Image source={{ uri: userData?.userPic }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.title}>{userData?.name}</Text>
          <Text style={styles.subtitle}>{userData?.location}</Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity
            onPress={async () => {
              try {
                await addFriend(userData.uid);
              } catch (err) {
                console.error(err);
              }
            }}
            style={styles.acceptBtn}
          >
            <MaterialIcons name="check" size={24} color="green" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              try {
                await removeFriend(userData.uid);
              } catch (err) {
                console.error(err);
              }
            }}
            style={styles.declineBtn}
          >
            <MaterialIcons name="close" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  // Modal styling
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  backgroundImage: {
    width: "90%",
    height: 160,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 5,
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: "absolute",
    top: -50,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#f9f9f9",
  },
  modalTextSection: {
    width: "100%",
    marginTop: 60,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  sectionLabel: {
    fontWeight: "600",
    marginBottom: 5,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
  },
  tag: {
    margin: 4,
    fontSize: 13,
    borderRadius: 12,
    backgroundColor: "#e6f7ff",
    color: "#007acc",
    paddingHorizontal: 12,
    paddingVertical: 4,
    overflow: "hidden",
  },
  infoText: {
    fontSize: 14,
    color: "#444",
    marginTop: 4,
  },

  // Card styling
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginHorizontal: 6,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
  },
  acceptBtn: {
    padding: 5,
    marginRight: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "green",
  },
  declineBtn: {
    padding: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "red",
  },
});

export default Card;
