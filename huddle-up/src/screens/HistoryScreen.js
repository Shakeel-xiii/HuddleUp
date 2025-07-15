import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import Background from "../components/Background";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import Card from "../components/CardnoDetails";
import { getEvents, getParticipants } from "../firebase/firestoreUsage";
import { useAuth } from "../core/AuthContext";

export default function HistoryScreen({ navigation }) {
  const [eventsHis, setEventsHis] = useState([]);
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
      let participants = await getParticipants(events[i].id);

      participants.forEach((participant) => {
        if (participant.id === loggedInUser && events[i].uid !== loggedInUser) {
          console.log(participant);
          setEventsHis((prev) => [...prev, events[i]]);
        }
      });
      //   if (events[i].participants.includes(loggedInUser)) {
      //     eventsHis.push(events[i]);
    }

    // setSignedUser(events.find((event) => event.uid === loggedInUser));
    console.log("Signed User:" + loggedInUser);
  }
  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Header>Events History</Header>
      <View style={styles.container}>
        <ScrollView>
          <Card events={eventsHis} />
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
