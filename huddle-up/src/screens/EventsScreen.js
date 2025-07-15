import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  RefreshControl,
  StyleSheet,
  ScrollView,
  Alert,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SelectDate from "../components/selectDate";
import { Search, Sort } from "../components/topBar";
import Card from "../components/Card";
import { AnimatedFAB } from "react-native-paper";
import { getEvents } from "../firebase/firestoreUsage";
import { useAuth } from "../core/AuthContext";
import Button from "../components/Button";
export default function EventScreen({ navigation }) {
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to null for "no date filter"
  const [searchQuery, setSearchQuery] = useState("");
  const [isExtended, setIsExtended] = useState(true);
  const [events, setEvents] = useState(null);
  const [filteredEvents, setfilteredEvents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { loggedInUser } = useAuth();

  // Fetch events from Firestore
  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(
        data.filter(
          (val) =>
            val.uid !== loggedInUser &&
            !val.is_private &&
            val.event_date.seconds > Date.now() / 1000
        )
      );
    } catch (error) {
      Alert.alert("Error", "Failed to load events. Please try again.");
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents().then(() => setRefreshing(false));
  }, []);

  useMemo(() => {
    if (!events) return [];
    setfilteredEvents(
      events.filter((event) => {
        const eventDate = event.event_date?.seconds
          ? new Date(event.event_date.seconds * 1000).toDateString()
          : null;

        const matchesDate =
          !selectedDate || eventDate === selectedDate.toDateString();
        const matchesLocation =
          selectedLocation.length === 0 ||
          selectedLocation.includes(event.event_location || "");
        const matchesCategory =
          selectedCategory.length === 0 ||
          selectedCategory.includes(event.event_type || "");
        const matchesSearch =
          !searchQuery ||
          event.event_name?.toLowerCase().includes(searchQuery.toLowerCase());

        return (
          matchesDate && matchesLocation && matchesCategory && matchesSearch
        );
      })
    );
  }, [events, selectedDate, selectedLocation, selectedCategory, searchQuery]);

  const onScroll = ({ nativeEvent }) => {
    setIsExtended(nativeEvent.contentOffset.y <= 0);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedLocation([]);
    setSelectedCategory([]);
    setSearchQuery("");
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <Sort
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <SelectDate
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        {/* Clear Filters Button */}
        <View style={styles.clearButtonContainer}>
          <Button
            style={styles.clearButton}
            labelStyle={styles.clearButtonText}
            onPress={clearFilters}
          >
            Clear Filters
          </Button>
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          onScroll={onScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading ? (
            <Card events={[]} message="Loading events..." />
          ) : events.length > 0 ? (
            <Card events={filteredEvents} navigation={navigation} />
          ) : (
            <Card events={[]} message="No events found." />
          )}
        </ScrollView>
      </SafeAreaView>
      <AnimatedFAB
        icon={"plus"}
        label={"New Event"}
        extended={isExtended}
        onPress={() => navigation.navigate("CreateEvent")}
        visible={true}
        style={styles.fabStyle}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
  },
  fabStyle: {
    bottom: 16,
    right: 16,
    position: "absolute",
  },
  content: {
    flexGrow: 1,
    paddingTop: 0,
    paddingHorizontal: 16,
  },
  clearButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: "flex-start",
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
