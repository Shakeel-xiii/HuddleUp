import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import Background from "../components/Background";
import Header from "../components/Header";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import ReqCard from "../components/friendReqCard";
import { Search, Sort } from "../components/topBar";
import { getUsers } from "../firebase/firestoreUsage";
import { useAuth } from "../core/AuthContext";

export default function SearchUsers({ navigation }) {
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [signedUser, setSignedUser] = useState(null);
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
    let users = await getUsers();
    console.log("Users:" + users.length);
    let userData;
    users.find((user) => {
      if (user.uid == loggedInUser) {
        setSignedUser(user);
        return (userData = user);
      }
    });
    // console.log("Signed User:" + loggedInUser);

    let friendreq = userData?.friendreq;

    users = users.filter((user) => {
      if (user.uid === loggedInUser || user?.Role === "admin") {
        return false;
      }
      if (user?.friends.includes(loggedInUser) || friendreq?.includes(user.uid))
        return false;

      return true;
    });
    setUsers(users);
  }
  const clearFilters = () => {
    setSelectedLocation([]);
    setSelectedCategory([]);
    setSearchQuery("");
  };
  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Header>Search Users</Header>
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
            filteredUsers?.map((user) => {
              // console.log(signedUser);

              if (signedUser?.friendsen?.includes(user.uid))
                return (
                  <ReqCard key={user?.uid} userData={user} friendsend={true} />
                );
              return <ReqCard key={user?.uid} userData={user} />;
            })}
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
});
