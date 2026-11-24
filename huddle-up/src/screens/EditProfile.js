import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
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
import { uploadFileFromUrl } from "../storage/usage";
import { updateUser } from "../firebase/firestoreUsage";
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
export default function EditProfile({ route, navigation }) {
  const userData = route.params?.userData;
  const [name, setName] = useState({ value: userData?.name, error: "" });
  //   Delete this line
  const [email, setEmail] = useState({ value: "", error: "" });
  //   Delete this line
  const [password, setPassword] = useState({ value: "", error: "" });
  //   Delete this line
  const [date, setDate] = useState(datepast18);
  //   Delete this line
  const [cpr, setCpr] = useState({ value: "", error: "" });
  //   Delete this line
  const [phone, setPhone] = useState({ value: "", error: "" });
  const [favourite, setFavourite] = useState(userData?.favourite);
  const [location, setLocation] = useState(userData?.location);
  const [locationError, setLocationError] = useState(false);
  //   Delete this line
  const [CPRimageUri, CPRsetImageUri] = useState({ data: null, error: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show, setShow] = useState(false);
  const [userImage, setUserImage] = useState(null);

  const { _, setLoggedInUser } = useAuth();
  // setUserImage("../assets/profile.webp");
  const [getGender, setGender] = useState(userData?.gender == "Male" ? 2 : 1);
  const random = Math.floor(Math.random() * 3) + 1;
  const updatedSwitchData = (val) => {
    setGender(val);
    if (!userImage?.uri) {
      setUserImage(val == 1 ? defaultWomanImage : defaultManImage);
      console.log(Asset.fromModule(userImage).uri);
    }
  };
  useEffect(() => {
    console.log(userData?.userPic);
    requestPermissions();
    setUserImage(getGender == 1 ? defaultWomanImage : defaultManImage);
  }, []);
  // useEffect(() => {
  //   if (loggedInUser) {
  //     navigation.reset({
  //       index: 0,
  //       routes: [{ name: "Dashboard" }],
  //     });
  //   }
  // }, [loggedInUser]);
  const onUpdate = async () => {
    setIsSubmitting(true);
    try {
      const nameError = nameValidator(name.value);
      const errorLocation =
        location == "Select Location" || !location ? true : false;
      if (nameError || errorLocation) {
        setName({ ...name, error: nameError });
        setLocationError(errorLocation);
        return;
      }
      //   const cprUrl = await uploadFile(CPRimageUri.data, "cpr", uid);
      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: "LoginScreen" }],
      // });
      if (userImage?.uri)
        userData.userPic = await uploadFileFromUrl(
          userImage.uri,
          "profile",
          userData.uid
        );
      userData.name = name.value;
      userData.favourite = favourite;
      userData.location = location;
      userData.gender = getGender == 1 ? "Female" : "Male";
      console.log(userData);
      await updateUser(userData.uid, userData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
      navigation.pop();
    }
  };
  const CPRpickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType,
      allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
      base64: true,
      legacy: true,
    });
    // console.log(result);

    if (!result.canceled) {
      CPRsetImageUri({ data: result.assets[0], error: null });
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

    if (!result.canceled) {
      console.log(result.assets[0]);

      setUserImage(result.assets[0]);
    }
  };
  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Header>Edit Profile</Header>
      <ScrollView style={styles.container}>
        <Image
          source={
            userImage?.uri
              ? { uri: userImage.uri }
              : { uri: userData?.userPic + `?t=${new Date().getTime()}` }
          }
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
            Change Profile Picture
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
          </View>
        </View>
        <Menu
          data={Locations}
          value={location}
          setValue={setLocation}
          placeHolder={"Select Location"}
          error={locationError}
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
            }}
          >
            <ActivityIndicator size="large" color={"white"} />
          </View>
        ) : (
          <Button
            mode="contained"
            onPress={onUpdate}
            style={{ marginVertical: 0, marginTop: 18 }}
          >
            Update Info
          </Button>
        )}
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
