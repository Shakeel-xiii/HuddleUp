import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ImageBackground,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome5";
import { LinearGradient } from "expo-linear-gradient";

const getGenderIcon = (gender) => {
  switch (gender) {
    case "Male":
      return { name: "male", color: "#007BFF" };
    case "Female":
      return { name: "female", color: "#EA266D" };
    case "Any":
      return { name: "venus-mars", color: "#6C757D" };
    default:
      return { name: "venus-mars", color: "#6C757D" };
  }
};
export default function CardItem({
  id,
  img,
  location,
  dates,
  description,
  price,
  currentParticipants,
  totalParticipants,
  name,
  type,
  ageRange,
  gender,
  whatsappLink,
  navigation,
  participants,
}) {
  console.log(totalParticipants);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <ImageBackground
          alt="Event Image"
          resizeMode="cover"
          imageStyle={styles.cardImg}
          source={{
            uri:
              img ?? "https://assets.almasood.org/huddle-up/events/default.jpg",
          }}
        >
          <LinearGradient
            colors={[
              "transparent",
              "transparent",
              "rgba(0,0,0,0.7)",
              "#000000",
            ]}
            style={styles.cardImg}
          >
            <View style={styles.cardLocationWrapper}>
              <Text style={[styles.cardTitle, { color: "white" }]}>
                {location || "Location not available"}
              </Text>
            </View>
            <View style={styles.cardTypeWrapper}>
              <Text style={[styles.cardTitle, { color: "white" }]}>
                {type || "Type not specified"}
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      {/* Event Details */}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{name || "Event Name"}</Text>
          {gender && (
            <FontAwesome
              color={getGenderIcon(gender).color}
              name={getGenderIcon(gender).name}
              solid={true}
              size={20}
              style={{ marginBottom: 2, margin: 5 }}
            />
          )}
          <Text style={styles.cardStars}>
            {currentParticipants === totalParticipants
              ? "Full"
              : currentParticipants || 0}
          </Text>
          <Text style={{ color: "#595a63" }}>
            {currentParticipants === totalParticipants
              ? null
              : `(${totalParticipants || 0} Total)`}
          </Text>
        </View>

        <Text style={styles.cardDates}>{dates || "Date not available"}</Text>

        <Text style={styles.cardPrice}>
          <Text style={{ fontWeight: "600" }}>
            {price == null ? "Free" : `BD ${price}`}{" "}
          </Text>
          per person
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /** Card Styles */
  card: {
    position: "relative",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 16,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  cardTypeWrapper: {
    position: "absolute",
    zIndex: 1,
    bottom: 12,
    right: 12,
    paddingHorizontal: 20,
    paddingVertical: 7,
  },
  cardLocationWrapper: {
    position: "absolute",
    zIndex: 1,
    bottom: 12,
    left: 12,
    paddingHorizontal: 20,
    paddingVertical: 7,
  },
  cardTop: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardImg: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardBody: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#232425",
    marginRight: "auto",
  },
  cardStars: {
    marginLeft: 2,
    marginRight: 4,
    fontSize: 15,
    fontWeight: "500",
    color: "#232425",
  },
  cardDates: {
    marginTop: 4,
    fontSize: 16,
    color: "#595a63",
  },
  cardPrice: {
    marginTop: 6,
    fontSize: 16,
    color: "#232425",
  },
});
