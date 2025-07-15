import {
  Text,
  StyleSheet,
  Image,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import { Avatar, IconButton } from "react-native-paper";
import Card from "../components/friendCard";
import { formatName } from "../helpers/formatName";
import calculateAge from "../helpers/calculateAge";
import AntDesign from "@expo/vector-icons/AntDesign";
import reqCard from "../components/friendReqCard";
import Background from "../components/Background";
let tags = ["cricket", "football", "volleyball"];
const Profile = ({ userData, setUserData, navigation }) => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <View style={{ width: "100%" }}>
        <Image
          source={require("../assets/cover.jpg")}
          style={{
            width: "100%",
            height: 228,
          }}
          resizeMode="cover"
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.text}>{userData.location}</Text>
          <Text style={styles.text}>
            {calculateAge(userData.birthdate?.seconds * 1000)} years Old
          </Text>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          minHeight: 180,
        }}
      >
        <Image
          source={{ uri: userData.userPic }}
          resizeMode="contain"
          style={{
            height: 155,
            width: 155,
            borderColor: "black",
            borderRadius: 999,
            borderWidth: 2,
            marginTop: -90,
          }}
        />
        <Text
          style={{
            marginVertical: 8,
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          {formatName(userData.name)}
        </Text>
        <ScrollView style={{ width: "100%" }}>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              width: "70%",
              alignItems: "flex-start",
              justifyContent: "center",
              marginHorizontal: "auto",
              marginVertical: 3,
            }}
            // onPress={() => unSelect && unSelect(item)}
          >
            {userData.favourite.map((value, index) => {
              return (
                <Text key={index} style={styles.tagStyle}>
                  {value}
                </Text>
              );
            })}
          </View>

          <Button
            mode={"contained"}
            style={{
              width: "90%",
              marginVertical: 3,
              marginHorizontal: "auto",
            }}
            onPress={() => {
              // console.log("Pressed");
            }}
          >
            Edit Profile
          </Button>
          <View
            style={{
              flexDirection: "row",
              width: "90%",
              marginHorizontal: "auto",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              mode={"outlined"}
              style={{ marginVertical: 3, marginHorizontal: 2, flex: 2 }}
              onPress={() => {
                // console.log("Pressed");
              }}
            >
              Events History
            </Button>
            <Button
              mode={"outlined"}
              style={{ marginVertical: 3, marginHorizontal: 2, flex: 2 }}
              onPress={() => {
                // console.log("Pressed");
              }}
            >
              My Events
            </Button>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.text}>Friend Requests</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("CreateEvent")}
            >
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingLeft: 120,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AntDesign color="black" name="search1" size={22} />
                <Text>Search Users</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Card />
          <Card />
          <Card />
          <reqCard />
          {/* <Card.Title
              title="Card Title"
              subtitle="Card Subtitle"
              left={(props) => <Avatar.Icon {...props} icon="folder" />}
              right={(props) => (
                <IconButton {...props} icon="dots-vertical" onPress={() => {}} />
              )}
            />
            <Card.Title
              title="Card Title"
              subtitle="Card Subtitle"
              left={(props) => (
                <Image
                  source={{ uri: userData.userPic }}
                  style={props}
                  resizeMode="contain"
                />
              )}
              right={(props) => (
                <IconButton {...props} icon="dots-vertical" onPress={() => {}} />
              )}
            />
            <Card.Title
              title="Card Title"
              subtitle="Card Subtitle"
              left={(props) => <Avatar.Icon {...props} icon="folder" />}
              right={(props) => (
                <IconButton {...props} icon="dots-vertical" onPress={() => {}} />
              )}
            />
            <Card.Title
              title="Card Title"
              subtitle="Card Subtitle"
              left={(props) => <Avatar.Icon {...props} icon="folder" />}
              right={(props) => (
                <IconButton {...props} icon="dots-vertical" onPress={() => {}} />
              )}
            />
            <Card.Title
              title="Friend Name"
              subtitle="Card Subtitle"
              left={(props) => <Avatar.Icon {...props} icon="folder" />}
              right={(props) => (
                <IconButton {...props} icon="dots-vertical" onPress={() => {}} />
              )}
            />
            <Card.Title
              title="Friend Name"
              subtitle="Card Subtitle"
              left={(props) => <Avatar.Icon {...props} icon="folder" />}
              right={(props) => (
                <IconButton {...props} icon="dots-vertical" onPress={() => {}} />
              )}
            /> */}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
export default Profile;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    marginHorizontal: 5,
    textAlign: "left",
    alignItems: "flex-start",
    alignContent: "flex-start",
    alignSelf: "flex-start",
  },
  tagStyle: {
    marginRight: 5,
    fontSize: 14,
    alignItems: "center",
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
