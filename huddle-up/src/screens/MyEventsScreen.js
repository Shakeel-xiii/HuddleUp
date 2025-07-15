import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import Background from "../components/Background";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import Card from "../components/CardnoDetails";
import { getEvents, getParticipants } from "../firebase/firestoreUsage";
import { useAuth } from "../core/AuthContext";

export default function MyEventsScreen({ navigation }) {
  const [myEvents, setMyEvents] = useState([]);
  const { loggedInUser } = useAuth();
  useEffect(() => {
    if (!loggedInUser) {
      navigation.reset({
        index: 0,
        routes: [{ name: "StartScreen" }],
      });
    }
    getlocEvents();
  }, []);
  async function getlocEvents() {
    let events = await getEvents();
    for (let i = 0; i < events.length; i++) {
      if (events[i].uid == loggedInUser) {
        setMyEvents((prev) => [...prev, events[i]]);
      }
      //   if (events[i].participants.includes(loggedInUser)) {
      //     eventsHis.push(events[i]);
    }

    // setSignedUser(events.find((event) => event.uid === loggedInUser));
    console.log("Signed User:" + loggedInUser);
  }
  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Header>My Events</Header>
      <View style={styles.container}>
        <ScrollView>
          <Card events={myEvents} />
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
    marginTop: 10,
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
