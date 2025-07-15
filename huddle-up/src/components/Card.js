import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import CardItem from "./CardItem";
import dateFormat from "dateformat";
import { View, Text } from "react-native";

export default function Card({ events, navigation, message }) {
  const animatedOpacity = new Animated.Value(0);
  // Animate opacity for subtle entrance
  React.useEffect(() => {
    console.log("====================================");
    console.log(events);
    console.log("====================================");
    Animated.timing(animatedOpacity, {
      toValue: 1,
      duration: 500, // Adjust duration for animation
      useNativeDriver: true,
    }).start();
  }, [events]);

  // If events are loading
  if (events == null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size={"large"} color={"#03045e"} />
      </View>
    );
  }

  // If no events available
  if (events?.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No Events!</Text>
      </View>
    );
  }

  // Render events
  return (
    <Animated.View style={[styles.container, { opacity: animatedOpacity }]}>
      {events.map(
        ({
          id, // Firestore ID
          event_name,
          event_description,
          picture_url,
          event_location,
          event_date,
          price,
          current_event_participates,
          event_participates,
          age_range,
          gender,
          event_type,
          whatsapp_link,
          participants,
        }) => {
          // Ensure the date is valid and not undefined/null
          let formattedDate = "Date not available";
          if (event_date && event_date.seconds) {
            const eventDate = new Date(event_date.seconds * 1000);
            if (!isNaN(eventDate.getTime())) {
              formattedDate = dateFormat(eventDate, "dddd, mmm d");
            }
          }

          return (
            <TouchableOpacity
              key={id} // Firestore ID for unique key
              onPress={() =>
                navigation.navigate("EventDetails", {
                  event: {
                    id,
                    event_name,
                    picture_url,
                    event_description,
                    event_location,
                    event_date,
                    price,
                    current_event_participates,
                    event_participates,
                    age_range,
                    gender,
                    event_type,
                    whatsapp_link,
                    participants,
                  },
                })
              }
            >
              <CardItem
                currentParticipants={current_event_participates}
                dates={formattedDate}
                id={id}
                description={event_description}
                img={picture_url}
                location={event_location}
                price={price}
                totalParticipants={event_participates}
                name={event_name}
                type={event_type}
                ageRange={age_range}
                gender={gender}
                whatsappLink={whatsapp_link}
                navigation={navigation}
                participants={participants}
              />
            </TouchableOpacity>
          );
        }
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
});
