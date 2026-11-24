import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Text,
} from "react-native";
import { TextInput } from "react-native-paper";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import Menu from "../components/DropDown";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { addEvent } from "../firebase/firestoreUsage";
import * as ImagePicker from "expo-image-picker";
import { Category, Locations } from "../helpers/constData";
import Background from "../components/Background";
import { theme } from "../core/theme";
import { nameValidator } from "../helpers/nameValidator";
import { validateWhatsAppGroupLink } from "../helpers/waValidator";
import { useAuth } from "../core/AuthContext";
export default function CreateEvent({ navigation }) {
  const [name, setName] = useState({ value: "", error: "" });
  const [description, setDescription] = useState("");
  const [typeValue, setTypeValue] = useState("Select Type");
  const [locationValue, setLocationValue] = useState("Select Location");
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [duration, setDuration] = useState({ value: "", error: "" });
  const [ageRange, setAgeRange] = useState("Select Age");
  const [gender, setGender] = useState("Select Gender");
  const [price, setPrice] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show, setShow] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [maxParticipants, setMaxParticipants] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState({ value: "", error: "" });
  const [componentError, setComponentError] = useState({
    typeValue: null,
    locationValue: null,
    ageRange: null,
    gender: null,
  });

  const Genders = ["Any", "Male", "Female"];
  const AgeRanges = ["Any", "10-17", "18-22", "23-30", "31-40", "41-50", "51+"];
  const updatedSwitchData = () => {
    setIsPrivate(!isPrivate);
  };
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required!");
    }
  };
  const { loggedInUser } = useAuth();
  useEffect(() => {
    requestPermissions();
  }, []);
  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      const nameError = nameValidator(name.value);
      const durationError = duration.value ? null : "Duration cannot be empty";
      const walinkError = validateWhatsAppGroupLink(whatsappLink.value);
      const errorLocation =
        locationValue == "Select Location" || !locationValue ? true : false;
      const errorType = typeValue == "Select Type" || !typeValue ? true : false;
      const errorAgeRange =
        ageRange == "Select Age" || !ageRange ? true : false;

      const errorGender = gender == "Select Gender" || !gender ? true : false;
      if (
        nameError ||
        durationError ||
        walinkError ||
        errorLocation ||
        errorType ||
        errorAgeRange ||
        errorGender
      ) {
        setName({ ...name, error: nameError });
        setDuration({ ...duration, error: durationError });
        setWhatsappLink({ ...whatsappLink, error: walinkError });
        setComponentError({
          typeValue: errorType ? "red" : null,
          locationValue: errorLocation ? "red" : null,
          ageRange: errorAgeRange ? "red" : null,
          gender: errorGender ? "red" : null,
        });
        return;
      }
      // if (
      //   !name ||
      //   !description ||
      //   !typeValue ||
      //   !locationValue ||
      //   !duration ||
      //   !ageRange ||
      //   !maxParticipants ||
      //   !whatsappLink
      // ) {
      //   Alert.alert(
      //     "Validation Error",
      //     "Please fill in all the reqiured fields."
      //   );
      //   return;
      // }
      console.log(isNaN(parseInt(maxParticipants, 10)));

      const eventData = {
        event_name: name.value,
        event_description: description,
        event_type: typeValue,
        event_location: locationValue,
        event_date: date,
        picture_url: imageUri,
        event_participates: isNaN(parseInt(maxParticipants, 10))
          ? 10
          : parseInt(maxParticipants, 10),
        paid: isPaid,
        price: isPaid ? parseFloat(price) || null : null,
        duration: duration.value,
        age_range: ageRange || "Any",
        gender: gender || "Any",
        whatsapp_link: whatsappLink.value,
        uid: loggedInUser,
        is_private: isPrivate,
      };
      const eventID = await addEvent(eventData);

      Alert.alert("Success", "Event created successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to create the event. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Header
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginTop: 25,
          marginBottom: -40,
        }}
      >
        Create Event
      </Header>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Information</Text>
          <TextInput
            label="Event Name"
            value={name.value}
            onChangeText={(text) => setName({ value: text, error: "" })}
            style={styles.input}
            error={!!name.error}
          />
          {name.error ? <Text style={styles.error}>{name.error}</Text> : null}
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            style={[styles.input, styles.textArea]}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <Text>Access:</Text>
          <View>
            <View
              style={{
                height: 44,
                width: "100%",
                backgroundColor: "white",
                borderRadius: 25,
                borderWidth: 1,
                borderColor: theme.colors.primary,
                flexDirection: "row",
                justifyContent: "center",
                padding: 2,
                marginVertical: 8,
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => updatedSwitchData(1)}
                style={{
                  flex: 1,

                  backgroundColor: isPrivate ? theme.colors.primary : "white",
                  borderRadius: 25,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: isPrivate ? "white" : theme.colors.primary,
                  }}
                >
                  Only Friends
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => updatedSwitchData(2)}
                style={{
                  flex: 1,

                  backgroundColor: isPrivate ? "white" : theme.colors.primary,
                  borderRadius: 25,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: isPrivate ? theme.colors.primary : "white",
                  }}
                >
                  Public
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text>Type of Sport:</Text>
          <Menu
            data={Category}
            setValue={setTypeValue}
            value={typeValue}
            placeHolder={"Select Type"}
            error={componentError.typeValue}
          />
          <Text>Location:</Text>
          <Menu
            data={Locations}
            setValue={setLocationValue}
            value={locationValue}
            placeHolder={"Select Location"}
            error={componentError.locationValue}
          />
          <TouchableOpacity
            onPress={() => setShow(true)}
            style={styles.datePicker}
          >
            <Text>Select Date: {date.toLocaleString()}</Text>
          </TouchableOpacity>
          {show && (
            <DateTimePicker
              value={date}
              mode={mode}
              minimumDate={new Date()}
              onChange={handleDateChange}
              display="default"
            />
          )}
          <TextInput
            label="Duration (e.g., 2 hours)"
            value={duration.value}
            onChangeText={(text) => setDuration({ value: text, error: "" })}
            style={styles.input}
            error={!!duration.error}
          />
          {duration.error ? (
            <Text style={styles.error}>{duration.error}</Text>
          ) : null}
          <Text>Age Range:</Text>
          <Menu
            data={AgeRanges}
            setValue={setAgeRange}
            value={ageRange}
            placeHolder={"Select Age"}
            error={componentError.ageRange}
          />
          <Text>Gender:</Text>
          <Menu
            data={Genders}
            setValue={setGender}
            value={gender}
            placeHolder={"Select Gender"}
            error={componentError.gender}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment & Capacity</Text>
          <TouchableOpacity
            style={[styles.checkbox, !isPaid && { backgroundColor: "#d4edda" }]}
            onPress={() => setIsPaid(!isPaid)}
          >
            <Text>{isPaid ? "Paid Event" : "Free Event"}</Text>
          </TouchableOpacity>
          {isPaid && (
            <TextInput
              label="Price per Head"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={styles.input}
            />
          )}
          <TextInput
            label="Max Participants (Default: 10)"
            value={maxParticipants}
            onChangeText={setMaxParticipants}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media</Text>
          <TextInput
            label="WhatsApp Group Link"
            value={whatsappLink.value}
            onChangeText={(text) => setWhatsappLink({ value: text, error: "" })}
            style={styles.input}
            error={!!whatsappLink.error}
          />
          {whatsappLink.error ? (
            <Text style={styles.error}>{whatsappLink.error}</Text>
          ) : null}
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            <Text>{imageUri ? "Change Picture" : "Upload Event Picture"}</Text>
          </TouchableOpacity>
          {imageUri && <Text>Picture selected</Text>}
        </View>

        {isSubmitting ? (
          <TouchableOpacity style={[styles.submitButton, { padding: 8 }]}>
            <ActivityIndicator size="large" color={"white"} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
            <Text style={styles.buttonText}>Create Event</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    width: "100%",
    marginTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: -40,
  },
  input: { marginBottom: 16 },
  textArea: { height: 80, textAlignVertical: "top" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  datePicker: {
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 16,
  },
  checkbox: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  imagePicker: {
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  error: {
    fontSize: 13,
    color: theme.colors.error,
    marginTop: -15,
  },
});
