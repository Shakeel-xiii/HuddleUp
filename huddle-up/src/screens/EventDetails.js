import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Linking,
} from "react-native";
import {
  IconButton,
  Divider,
  RadioButton,
  AnimatedFAB,
  Portal,
  Dialog,
  TextInput as PaperInput,
} from "react-native-paper";
import TextInput  from "../components/TextInput";
import { useNavigation } from "@react-navigation/native";
import {
  addParticipant,
  getParticipantsWithUserData,
  getUser,
  deleteEvent,
  updateEvent,
} from "../firebase/firestoreUsage";
import { useAuth } from "../core/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Chatbot from "../components/chatbot";
import { createChatSession } from "../ai/system";
import * as Clipboard from "expo-clipboard";
import BackButton from "../components/BackButton";
import Button from "../components/Button";
import DateTimePicker from "@react-native-community/datetimepicker";
export default function EventDetails({ route }) {
  const navigation = useNavigation();
  const { event, user } = route.params;
  const { loggedInUser, userRole } = useAuth();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isEligible, setIsEligible] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [isExtended, setIsExtended] = useState(true);
  const [participantsData, setParticipantsData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
 const [show, setShow] = useState(false);
 const [date, setDate] = useState(new Date(event.event_date.seconds * 1000));
 const [mode, setMode] = useState("date");
  //for admin purposes
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedEvent, setEditedEvent] = useState({
    event_name: event.event_name,
    event_description: event.event_description,
    event_date: event.event_date,
    event_location: event.event_location,
    event_type: event.event_type,
    price: event.price,
    age_range: event.age_range,
    gender: event.gender,
  });

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const enrichedParticipants = await getParticipantsWithUserData(
          event.id
        );
        setParticipantsData(enrichedParticipants);
        const registered = enrichedParticipants.some(
          (p) => p.user_id === loggedInUser
        );
        setIsRegistered(registered);
      } catch (error) {
        console.error("Error fetching participants:", error);
      }
    };

    const checkEligibility = async () => {
      try {
        const userData = await getUser(loggedInUser);
        console.log("Fetched user data:", userData);

        // Must have gender to proceed
        if (!userData || !userData.gender) {
          console.log("Missing gender, user is not eligible.");
          setIsEligible(false);
          return;
        }

        // 1) GENDER CHECK
        const genderMatch =
          event.gender === "Any" ||
          !event.gender ||
          event.gender.toLowerCase() === userData.gender.toLowerCase();
        console.log("User gender:", userData.gender);
        console.log("Event gender requirement:", event.gender);
        console.log("Gender match:", genderMatch);

        let ageEligible = true;
        if (event.age_range && event.age_range.trim().toLowerCase() !== "any") {
          if (!userData.birthdate?.seconds) {
            console.log(
              "Missing birthdate, cannot compute age → user is not eligible"
            );
            ageEligible = false;
          } else {
            // Calculate age from timestamp
            const birthdate = new Date(userData.birthdate.seconds * 1000);
            const today = new Date();
            let userAge = today.getFullYear() - birthdate.getFullYear();
            const m = today.getMonth() - birthdate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
              userAge--;
            }
            console.log("Calculated user age:", userAge);

            // Parse event.min–max
            const [minAge, maxAge] = event.age_range
              .split("-")
              .map((a) => parseInt(a.trim(), 10));
            console.log("Event age range:", minAge, "-", maxAge);

            ageEligible =
              !isNaN(userAge) && userAge >= minAge && userAge <= maxAge;
            console.log("Age eligibility:", ageEligible);
          }
        } else {
          console.log("Age range is 'Any' or missing → skipping age check");
        }

        // 3) FINAL ELIGIBILITY
        const eligible = genderMatch && ageEligible;
        console.log("Final eligibility:", eligible);
        setIsEligible(eligible);
      } catch (error) {
        console.error("Eligibility check failed:", error);
        setIsEligible(false);
      }
    };

    fetchParticipants();
    checkEligibility();
  }, [event.id, loggedInUser]);

  const handleRegister = async () => {
    setIsModalVisible(false);
    setLoading(true);
    try {
      await addParticipant(event.id, loggedInUser);
      alert(
        event.price
          ? `Payment successful with ${paymentMethod}. Registration complete!`
          : "Registration complete!"
      );
      setIsRegistered(true);
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      await deleteEvent(event.id);
      Alert.alert("Success", "Event deleted successfully");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to delete event.");
      console.error("Delete error:", error);
    }
  };
  const handleDateChange = (event, selectedDate) => {
    if (event.type === "dismissed") {
      console.log("dismissed");
      setShow(false);
      setMode("date");
      return;
    }
    // else {
    console.log(event);
    if (selectedDate && event.type === "set") {
      if (mode === "date") {
        setShow(false);
        setDate(selectedDate);
        setMode("time");
        setShow(true);
        return;
      } else {
        setShow(false);
        const newDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          selectedDate.getHours(),
          selectedDate.getMinutes()
        );
        setMode("date");

        setDate(newDate);
      }
    }

    return;
    // }
  };

  const handleSaveEdit = async () => {
    try {
      setEditedEvent( {...editedEvent,event_date: date})
      await updateEvent(event.id, editedEvent);
      Alert.alert("Updated", "Event updated successfully.");
      setShowEditDialog(false);
    } catch (e) {
      Alert.alert("Error", "Update failed.");
    }
  };


  const openUserDetails = (userData) => {
    setSelectedUser(userData);
    setIsUserModalVisible(true);
  };

  if (!event.picture_url) {
    event.picture_url =
      "https://assets.almasood.org/huddle-up/events/default.jpg";
  }

  return (
    <View style={styles.flexContainer}>
      <ScrollView>
        <SafeAreaView style={styles.container}>
          <BackButton goBack={() => navigation.goBack()} style={{ marginTop: 10, marginLeft: 10, zIndex: 1 }} />

          <Image source={{ uri: event.picture_url }} style={styles.image} />

          <View style={styles.header}>
            <Text style={styles.title}>{event.event_name}</Text>
            <Text style={styles.subtitle}>{event.event_type}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Details</Text>
            <Divider style={styles.divider} />
            <Text style={styles.detailText}>
              <Text style={styles.boldText}>Description: </Text>
              {event.event_description || "No Description"}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.boldText}>Date: </Text>
              {event.event_date
                ? new Date(event.event_date.seconds * 1000).toLocaleString()
                : "No date provided"}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.boldText}>Location: </Text>
              {event.event_location || "No location provided"}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.boldText}>Price: </Text>
              {event.price ? `${event.price} BHD` : "Free"}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.boldText}>Age Range: </Text>
              {event.age_range || "No age restriction"}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.boldText}>Gender: </Text>
              {event.gender || "No gender preference"}
            </Text>
          </View>

          <View style={styles.additionalCard}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <Divider style={styles.divider} />
            <Text style={styles.detailText}>
              <Text style={styles.boldText}>WhatsApp Link: </Text>
              {event.whatsapp_link ? (
                <Text
                  style={styles.linkText}
                  onPress={async () => {
                    const supported = await Linking.canOpenURL(
                      event.whatsapp_link
                    );
                    if (supported) Linking.openURL(event.whatsapp_link);
                    else Alert.alert("Error", "WhatsApp link not supported");
                  }}
                  onLongPress={() => {
                    Clipboard.setString(event.whatsapp_link);
                    Alert.alert("Copied", "Link copied to clipboard");
                  }}
                >
                  {event.whatsapp_link}
                </Text>
              ) : (
                "Not provided"
              )}
            </Text>

            {participantsData.length > 0 && (
              <>
                <Text style={styles.detailText}>
                  <Text style={styles.boldText}>Participants: </Text>
                  {participantsData.length} / {event.event_participates}
                </Text>
                <ScrollView horizontal style={styles.participantsContainer}>
                  {participantsData.map((p, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => openUserDetails(p)}
                    >
                      <View style={styles.participantAvatar}>
                        <Text style={styles.participantInitial}>
                          {p.name?.[0]?.toUpperCase() || "?"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </View>

          {event.price && (
            <Modal visible={isModalVisible} transparent animationType="slide">
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Confirm Payment</Text>
                  <Text style={styles.modalText}>
                    Pay {event.price} BHD to join.
                  </Text>
                  <Divider style={styles.divider} />
                  <Text style={styles.modalSubtitle}>Choose Method</Text>
                  <RadioButton.Group
                    onValueChange={setPaymentMethod}
                    value={paymentMethod}
                  >
                    <RadioButton.Item label="Cash" value="Cash" />
                    <RadioButton.Item label="Benefit Pay" value="Benefit" />
                    <RadioButton.Item label="Card" value="Card" />
                  </RadioButton.Group>
                  <Button
                    mode="contained"
                    onPress={handleRegister}
                    disabled={!paymentMethod}
                    style={styles.paymentButton}
                  >
                    Confirm Payment
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => setIsModalVisible(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                </View>
              </View>
            </Modal>
          )}


          {userRole === "admin" ? (
            <View style={{ flexDirection: "column", marginTop: 10, marginHorizontal: 16 }}>
              <Button
                mode="outlined"
                icon="pencil"
                onPress={() => setShowEditDialog(true)}
              >
                Edit
              </Button>
              <Button
                mode="contained"
                icon="delete"
                buttonColor="red"
                textColor="white"
                onPress={() => setShowDeleteConfirm(true)}
              >
                Delete
              </Button>
            </View>
          ) : (
            <>
              {!isEligible && (
                <Text
                  style={{ color: "red", textAlign: "center", marginVertical: 10 }}
                >
                  You are not eligible to register for this event.
                </Text>
              )}

              {!isRegistered && isEligible && (
                <Button
                  mode="contained"
                  onPress={
                    event.price ? () => setIsModalVisible(true) : handleRegister
                  }
                  disabled={loading}
                  style={styles.registerButton}
                >
                  {loading ? "Registering..." : event.price ? "Register & Pay" : "Register"}
                </Button>
              )}
              {isRegistered && (
                <Button
                  mode="contained"
                  onPress={() => alert("You are already registered.")}
                  style={styles.registerButton}
                >
                  View Details
                </Button>
              )}
            </>
          )}

        </SafeAreaView>

        {selectedUser && (
          <Modal
            visible={isUserModalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setIsUserModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.userModalContainer}
              activeOpacity={1}
              onPressOut={() => setIsUserModalVisible(false)}
            >
              <TouchableOpacity
                activeOpacity={1}
                style={styles.userModalContent}
              >
                <Image
                  source={{ uri: selectedUser.userPic }}
                  style={styles.userModalImage}
                />
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>
                    {selectedUser.name || "Unknown"}
                  </Text>
                  <Text style={styles.userInfo}>
                    Location: {selectedUser.location || "Not provided"}
                  </Text>
                  <Text style={styles.userInfo}>
                    Gender: {selectedUser.gender || "Not provided"}
                  </Text>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        )}

        <Modal
          visible={showDeleteConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteConfirm(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Event?</Text>
              <Text style={styles.modalText}>
                Are you sure you want to delete this event permanently?
              </Text>
              <Divider style={styles.divider} />
              <Button
                mode="contained"
                buttonColor="red"
                onPress={handleDeleteEvent}
                style={styles.deleteButton}>
                Confirm Delete
              </Button>
              <Button onPress={() => setShowDeleteConfirm(false)}>Cancel</Button>
            </View>
          </View>
        </Modal>



        {/* Edit event Dialog box big one */}
        <Portal>
          <Dialog
            visible={showEditDialog}
            onDismiss={() => setShowEditDialog(false)}
          >
            <Dialog.Title>Edit Event</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Name"
                value={editedEvent.event_name}
                onChangeText={text =>
                  setEditedEvent(prev => ({ ...prev, event_name: text }))
                }
              />
              <TextInput
                label="Description"
                value={editedEvent.event_description}
                onChangeText={text =>
                  setEditedEvent(prev => ({ ...prev, event_description: text }))
                }
                multiline
              />
              <TextInput
                label="Location"
                value={editedEvent.event_location}
                onChangeText={text =>
                  setEditedEvent(prev => ({ ...prev, event_location: text }))
                }
              />
              <TextInput
                label="Type"
                value={editedEvent.event_type}
                onChangeText={text =>
                  setEditedEvent(prev => ({ ...prev, event_type: text }))
                }
              />
                        <TouchableOpacity
                          onPress={() => setShow(true)}
                          style={{ 
                            padding: 12,
                            backgroundColor: "#f0f0f0",
                            borderRadius: 8,
                            marginBottom: 16,
                          }}
                        >
                          <Text>Select Date: {date.toLocaleString()}</Text>
                        </TouchableOpacity>
            {show && (
            <DateTimePicker
              value={date}
              mode={mode}
              onChange={handleDateChange}
              display="default"
            />
          )}
              <TextInput
                label="Price (BHD)"
                keyboardType="numeric"
                value={editedEvent.price?.toString() || ''}
                onChangeText={text =>
                  setEditedEvent(prev => ({ ...prev, price: parseFloat(text) || null }))
                }
              />
              <TextInput
                label="Age Range (e.g. 18-30 or Any)"
                value={editedEvent.age_range}
                onChangeText={text =>
                  setEditedEvent(prev => ({ ...prev, age_range: text }))
                }
              />
              <TextInput
                label="Gender (Male/Female/Any)"
                value={editedEvent.gender}
                onChangeText={text =>
                  setEditedEvent(prev => ({ ...prev, gender: text }))
                }
              />
            </Dialog.Content>
            <Dialog.Actions style={{ flexDirection: 'column' }}>
              <Button
                mode="contained"
                onPress={handleSaveEdit}
                style={styles.dialogButton}
              >
                Save
              </Button>
              <Button onPress={() => setShowEditDialog(false)} style={styles.dialogButton}>
                Cancel
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>


      </ScrollView>
      {showChat && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
          }}
        >
          <Chatbot
            onClose={() => setShowChat(false)}
            sportType={event.event_type}
          />
        </View>
      )}

      <AnimatedFAB
        icon="chat"
        label="Chat Bot"
        extended={isExtended}
        onPress={() => {
          createChatSession(event.event_type);
          setShowChat(true);
        }}
        visible={true}
        animateFrom="right"
        iconMode="left"
        style={styles.fab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    height: "100%",
    paddingBottom: 150,
  },
  backButton: {
    position: "absolute",
    top: 35,
    left: 10,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 50,
  },
  image: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#03045e",
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 3,
  },
  additionalCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#03045e",
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: "#ccc",
  },
  detailText: {
    fontSize: 16,
    color: "rgba(0, 0, 0, 0.8)",
    marginBottom: 6,
    marginTop: 6,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: "bold",
  },
  registerButton: {
    width: "auto",
    backgroundColor: "#526548",
    marginHorizontal: 16,
    marginTop: 16,
  },
  registerButtonText: {
    fontSize: 16,
    color: "#fff",
    paddingVertical: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#f4f4f4",
    borderRadius: 10,
    padding: 20,
    alignItems: "flex-start",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  paymentButton: {
    backgroundColor: "#4caf50",
    width: "100%",
  },
  paymentButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: "#f44336",
    width: "100%",
  },
  participantsContainer: {
    marginTop: 10,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#8C1D40",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  participantInitial: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  userModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  userModalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
  },
  userModalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: -50,
    borderColor: "black",
    borderWidth: 2,
    backgroundColor: "white",
  },
  userDetails: {
    width: "100%",
    marginTop: 20,
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 5,
  },
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },
});
