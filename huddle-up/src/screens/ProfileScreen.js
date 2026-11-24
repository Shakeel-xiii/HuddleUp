import {
  Text,
  StyleSheet,
  Image,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import Card from "../components/friendCard";
import { formatName } from "../helpers/formatName";
import calculateAge from "../helpers/calculateAge";
import AntDesign from "@expo/vector-icons/AntDesign";
import Background from "../components/Background";
import * as ImagePicker from "expo-image-picker";
import { uploadFile } from "../storage/usage";
import {
  acceptFriendReq,
  getUser,
  rejectFriendReq,
} from "../firebase/firestoreUsage";
const requestPermissions = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    alert("Permission to access media library is required!");
  }
};
const Profile = ({ userData, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [friendsreq, setFriendsreq] = useState([]);
  useEffect(() => {
    if (userData) {
      requestPermissions();
      setLoading(false);
      getFriendreq().then((friends) => {
        setFriendsreq(friends);
      });
      console.log("Completed");
    }
  }, [userData]);
  // Create a function to get the data of friends from the database
  const getFriendreq = async () => {
    let friend = [];
    for (let i = 0; i < userData.friendreq.length; i++) {
      let friendreq = await getUser(userData.friendreq[i]);
      friend.push(friendreq);
    }
    return friend;
  };
  const removeFriend = async (friend) => {
    userData.friendreq = userData.friendreq.filter((f) => f !== friend);
    console.log(userData);
    await rejectFriendReq(userData.uid, friend);
    setFriendsreq(userData.friendreq);
  };
  const addFriend = async (friend) => {
    userData.friends.push(friend);
    userData.friendreq = userData.friendreq.filter((f) => f !== friend);
    console.log(userData);
    await acceptFriendReq(userData.uid, friend);
    setFriendsreq(userData.friendreq);
  };
  if (loading) {
    return (
      <Background>
        <ActivityIndicator size="large" />
      </Background>
    );
  }
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <View style={{ width: "100%" }}>
        <TouchableOpacity
          onPress={async () => {
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaType,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
              base64: true,
              legacy: true,
            });
            // console.log(result);

            if (!result.canceled) {
              let background_url = await uploadFile(
                result.assets[0],
                "background",
                userData.uid
              );
              if (!background_url) {
                return Alert.alert("Error", "Failed to upload image");
              }
              alert("Image Updated Successfully");
            }
          }}
          style={{
            position: "absolute",
            right: 10,
            top: 10,
            padding: 10,
            backgroundColor: "white",
            borderRadius: 999,
            zIndex: 999,
          }}
        >
          <AntDesign name="edit" size={24} color="black" />
        </TouchableOpacity>
        <Image
          source={{
            uri: `${userData?.background_url}?t=${new Date().getTime()}`,
            cache: "reload",
            headers: {
              "Cache-Control": "no-cache",
            },
          }}
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
          <Text style={styles.text}>{userData?.location}</Text>
          <Text style={styles.text}>
            {calculateAge(userData?.birthdate?.seconds * 1000)} years Old
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
          source={{
            uri: `${userData?.userPic}?t=${new Date().getTime()}`,
            cache: "reload",
          }}
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
          {formatName(userData?.name)}
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
            {userData?.favourite.map((value, index) => {
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
              navigation.navigate("FriendListScreen");
              // console.log("Pressed");
            }}
          >
            Friend List
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
                navigation.navigate("HistoryScreen");
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
                navigation.navigate("MyEventsScreen");
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
              onPress={() => navigation.navigate("SearchUsers")}
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
          {friendsreq.map((friend) => {
            return (
              <Card
                key={friend.uid}
                userData={friend}
                removeFriend={removeFriend}
                addFriend={addFriend}
              />
            );
          })}
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
