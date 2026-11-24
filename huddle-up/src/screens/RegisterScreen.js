import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Text } from "react-native-paper";
import Background from "../components/Background";
import Header from "../components/Header";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import { Asset } from "expo-asset";
import BackButton from "../components/BackButton";
import DateTimePicker from "@react-native-community/datetimepicker";
import { theme } from "../core/theme";
import { emailValidator } from "../helpers/emailValidator";
import { passwordValidator } from "../helpers/passwordValidator";
import { nameValidator } from "../helpers/nameValidator";
import { cprValidator } from "../helpers/cprValidator";
import { phoneValidator } from "../helpers/phoneValidator";
import { MultiSelect } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import Menu from "../components/DropDown";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../core/AuthContext";
import { Locations, Category } from "../helpers/constData";
import {
  uploadFile,
  uploadFileFromUrl,
  uploadPrivateFile,
} from "../storage/usage";
import { createUser } from "../firebase/firebaseAuth";
import { addUser, getUserRole } from "../firebase/firestoreUsage";
const requestPermissions = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    alert("Permission to access media library is required!");
  }
};
// Random number from 1 to 3
const defaultManImage = require("../assets/man/ManPFP.jpg");
const defaultWomanImage = require("../assets/woman/WomanPFP.jpg");

const newCategory = Category.map((value, index) => {
  return { label: value, value: value };
});
// [
//   { label: "Football", value: "1" },
//   { label: "Padel", value: "2" },
//   { label: "BasketBall", value: "3" },
//   { label: "Tennis", value: "4" },
//   { label: "Cricket", value: "5" },
//   { label: "VolleyBall", value: "6" },
//   { label: "Hockey", value: "7" },
//   { label: "Racing", value: "8" },
// ];
// const Locations = [
//   "Muharraq",
//   "Madinat Hamad",
//   "Madinat Isa",
//   "Sanad",
//   "Manama",
//   "A'ali",
//   "Madinat Zayed",
//   "Manama",
// ];
const Favourite = ({ setSelected, selected, data, placeholder }) => {
  const renderItem = (item) => {
    return (
      <View style={styles.item}>
        <Text style={styles.selectedTextStyle}>{item.label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.favContainer}>
      <MultiSelect
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={selected}
        activeColor="#99b3ff"
        search
        searchPlaceholder="Search..."
        onChange={(item) => {
          setSelected(item);
        }}
        renderItem={renderItem}
        renderSelectedItem={(item, unSelect) => (
          <TouchableOpacity
            style={{
              width: "45%",
              marginHorizontal: 1,
            }}
            onPress={() => unSelect && unSelect(item)}
          >
            <View style={styles.selectedStyle}>
              <Text style={styles.textSelectedStyle}>{item.label}</Text>
              <AntDesign color="black" name="delete" size={14} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
const datepast18 = new Date();
datepast18.setFullYear(datepast18.getFullYear() - 17);
export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState({ value: "", error: "" });
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [date, setDate] = useState(datepast18);
  const [cpr, setCpr] = useState({ value: "", error: "" });
  const [phone, setPhone] = useState({ value: "", error: "" });
  const [favourite, setFavourite] = useState([]);
  const [location, setLocation] = useState("Select Location");
  const [locationError, setLocationError] = useState(false);
  const [CPRimageUri, CPRsetImageUri] = useState({ data: null, error: null });
  const [CPRtext, setCPRtext] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show, setShow] = useState(false);
  const [userImage, setUserImage] = useState(null);
  const { loggedInUser, setLoggedInUser, setUserRole } = useAuth();
  const [verifying, setVerifying] = useState(false);
  // setUserImage("../assets/profile.webp");
  const [getGender, setGender] = useState(2);
  const random = Math.floor(Math.random() * 3) + 1;
  const handleDateChange = (event, selectedDate) => {
    setShow(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  const updatedSwitchData = (val) => {
    setGender(val);
    if (!userImage?.uri) {
      setUserImage(val == 1 ? defaultWomanImage : defaultManImage);
      console.log(Asset.fromModule(userImage).uri);
    }
  };
  useEffect(() => {
    requestPermissions();
    setUserImage(getGender == 1 ? defaultWomanImage : defaultManImage);
  }, []);
  useEffect(() => {
    if (loggedInUser) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      });
    }
  }, [loggedInUser]);
  const onSignUpPressed = async () => {
    setIsSubmitting(true);
    try {
      const nameError = nameValidator(name.value);
      const emailError = await emailValidator(email.value);
      const passwordError = passwordValidator(password.value);
      const cprError = await cprValidator(cpr.value, date);
      const phoneError = await phoneValidator(phone.value);
      const errorLocation =
        location == "Select Location" || !location ? true : false;
      const cprImageError = CPRimageUri.data ? "" : "red";
      if (
        emailError ||
        passwordError ||
        nameError ||
        cprError ||
        phoneError ||
        errorLocation ||
        cprImageError
      ) {
        setName({ ...name, error: nameError });
        setEmail({ ...email, error: emailError });
        setPassword({ ...password, error: passwordError });
        setCpr({ ...cpr, error: cprError });
        setPhone({ ...phone, error: phoneError });
        setLocationError(errorLocation);
        CPRsetImageUri({ ...CPRimageUri, error: cprImageError });
        return;
      }
      const CPRverification =
        CPRtext.includes(name.value.split(" ")[0].toUpperCase()) &&
        CPRtext.includes(cpr.value || cpr.value.slice(1, 9));
      if (!CPRverification) {
        CPRsetImageUri({
          data: null,
          error: "red",
        });
        return;
      }
      const uid = await createUser(email.value, password.value);
      if (uid == "emailexist") {
        setEmail({ ...email, error: "Email already exists" });
        return;
      }
      const cprUrl = await uploadPrivateFile(CPRimageUri.data, "cpr", uid);
      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: "LoginScreen" }],
      // });
      let imageUrl;
      if (!userImage?.uri)
        imageUrl = await uploadFileFromUrl(
          Asset.fromModule(userImage).uri,
          "profile",
          uid
        );
      else imageUrl = await uploadFile(userImage, "profile", uid);
      const background_url = await uploadFileFromUrl(
        "https://assets.almasood.org/huddle-up/default.jpg",
        "background",
        uid
      );
      const data = {
        name: name.value,
        email: email.value,
        cpr: cpr.value,
        phone: phone.value,
        location: location,
        favourite: favourite,
        gender: getGender == 1 ? "Female" : "Male",
        birthdate: date,
        uid: uid,
        userPic: imageUrl,
        cprPic: cprUrl,
        friends: [],
        friendreq: [],
        friendsen: [],
        background_url: background_url,
      };
      console.log(data);
      await addUser(uid, data);
      setLoggedInUser(uid);

      await getUserRole(uid).then((role) => {
        console.log("Role: " + role);
        setUserRole(role);
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const CPRpickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: false,
        mediaTypes: ImagePicker.MediaType,
        quality: 0.5,
        base64: true,
        legacy: true,
      });

      if (result.canceled) return;
      setVerifying(true);
      setCPRtext(null);
      const response = await fetch("https://assets.almasood.org/v3/verification/cpr", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64: result.assets[0].base64,
        }),
      });
      if (!response.ok) {
        throw new Error(`CPR verification failed (HTTP ${response.status}).`);
      }

      const { text } = await response.json();
      const isVerified =
        typeof text === "string" &&
        text.includes(name.value.split(" ")[0].toUpperCase()) &&
        text.includes(cpr.value);

      if (isVerified) {
        setCPRtext(text);
        CPRsetImageUri({ data: result.assets[0], error: "green" });
      } else {
        CPRsetImageUri({ data: null, error: "red" });
      }
    } catch (error) {
      console.error("CPR verification request failed:", error);
      CPRsetImageUri({ data: null, error: "red" });
      Alert.alert("Verification failed", "Please try again with a clear image.");
    } finally {
      setVerifying(false);
    }
  };
  const UserpickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType,
      allowsEditing: true,

      aspect: [3, 3],
      quality: 1,
      base64: true,
      legacy: true,
    });
    console.log(result);

    if (!result.canceled) {
      console.log(result.assets[0]);

      setUserImage(result.assets[0]);
    }
  };
  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Header>Create Account</Header>
      <ScrollView style={styles.container}>
        <Image
          source={userImage?.uri ? { uri: userImage.uri } : userImage}
          resizeMode="fill"
          style={{
            height: 100,
            width: 100,
            borderColor: "black",
            borderRadius: 999,
            borderWidth: 2,
            // marginTop: -90,
            marginHorizontal: "auto",
          }}
        />
        <TouchableOpacity onPress={UserpickImage} style={styles.imagePicker}>
          <Text style={{ color: theme.colors.primary }}>
            {userImage?.uri
              ? "Change Profile Picture"
              : "Upload Profile Picture"}
          </Text>
        </TouchableOpacity>
        <TextInput
          label="Name"
          returnKeyType="next"
          value={name.value}
          onChangeText={(text) => setName({ value: text, error: "" })}
          error={!!name.error}
          errorText={name.error}
        />
        <TouchableOpacity
          onPress={() => setShow(true)}
          style={styles.imagePicker}
        >
          <Text style={{ color: theme.colors.primary }}>
            Select Birth Date: {date.toLocaleString().split(",")[0]}
          </Text>
        </TouchableOpacity>
        {show && (
          <DateTimePicker
            maximumDate={datepast18}
            value={date}
            mode="date"
            onChange={handleDateChange}
            display="default"
          />
        )}
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
              TouchableOpacity
              activeOpacity={1}
              onPress={() => updatedSwitchData(2)}
              style={{
                flex: 1,

                backgroundColor: getGender == 2 ? "#1a75ff" : "white",
                borderRadius: 25,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: getGender == 2 ? "white" : theme.colors.primary,
                }}
              >
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => updatedSwitchData(1)}
              style={{
                flex: 1,

                backgroundColor: getGender == 1 ? "#e0b3ff" : "white",
                borderRadius: 25,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: theme.colors.primary,
                }}
              >
                Female
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Menu
          data={Locations}
          value={location}
          setValue={setLocation}
          placeHolder={"Select Location"}
          error={locationError}
        />
        <TextInput
          label="Enter CPR Number"
          returnKeyType="next"
          value={cpr.value}
          onChangeText={(text) => {
            if (text.length > 9) return;
            // Allow only numbers (optional: add conditions for decimals or negative numbers)
            const numericValue = text.replace(/[^0-9.]/g, "");
            setCpr({ value: numericValue, error: "" });
          }}
          error={!!cpr.error}
          errorText={cpr.error}
          autoCapitalize="none"
          keyboardType="numeric"
        />
        <TouchableOpacity
          disabled={name.value && cpr.value && !verifying ? false : true}
          onPress={CPRpickImage}
          style={[
            styles.imagePicker,
            {
              borderColor: CPRimageUri.error ?? "",
              borderWidth: CPRimageUri.error ? 1 : 0,
            },
          ]}
        >
          {verifying ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={{ color: CPRimageUri.error ?? theme.colors.primary }}>
              {CPRimageUri.data ? "Change CPR Picture" : "Upload CPR Picture"}
            </Text>
          )}
        </TouchableOpacity>
        {CPRimageUri.error && (
          <Text style={{ fontSize: 13, color: CPRimageUri.error }}>
            {CPRimageUri.error === "red"
              ? "Could not verify CPR, please upload clear image"
              : "Verified ✅"}
          </Text>
        )}
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
          label="Phone Number"
          returnKeyType="next"
          value={phone.value}
          onChangeText={(text) => {
            // Allow only numbers (optional: add conditions for decimals or negative numbers)
            const numericValue = text.replace(/[^0-9.]/g, "");
            setPhone({ value: numericValue, error: "" });
          }}
          error={!!phone.error}
          errorText={phone.error}
          autoCapitalize="none"
          textContentType="age"
          keyboardType="numeric"
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
        <Favourite
          selected={favourite}
          setSelected={setFavourite}
          data={newCategory}
          placeholder={"Select Favourite Activities"}
        />
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
            onPress={onSignUpPressed}
            style={{ marginVertical: 0, marginTop: 18 }}
          >
            Sign Up
          </Button>
        )}
        <View style={[styles.row, { marginBottom: 170 }]}>
          <Text>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace("LoginScreen")}>
            <Text style={styles.link}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    width: "100%",
    marginTop: 10,
  },
  favContainer: {
    flexGrow: 1,
    width: "100%",
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    marginTop: 4,
    marginBottom: 20,
  },
  link: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  dropdown: {
    height: 40,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedStyle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    borderRadius: 14,
    backgroundColor: "white",
    shadowColor: "#000",
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 6,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  textSelectedStyle: {
    marginRight: 5,
    fontSize: 14,
  },
  imagePicker: {
    padding: 12,
    backgroundColor: "white",
    borderRadius: 25,
    alignItems: "center",
    marginVertical: 6,
  },
  datePicker: {
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    marginBottom: 16,
  },
});
