import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Icon } from "react-native-paper";
import { Search, Sort } from "../components/topBar";
import Card from "../components/Card";
import { AnimatedFAB } from "react-native-paper";
import {
  getEvents,
  getParticipants,
  getCurrentAndTotalParticipants,
} from "../firebase/firestoreUsage";
import debounce from "lodash.debounce";
import { useAuth } from "../core/AuthContext";
import { useIsFocused } from "@react-navigation/native";
import Button from "../components/Button";
const ExpandableSection = ({ title, show, setShow, events, navigation }) => (
  <View style={styles.heading}>
    <TouchableOpacity
      onPress={() => setShow(!show)}
      style={styles.sectionHeader}
    >
      <Text variant="headlineSmall">{title}</Text>
      <Icon source={show ? "menu-up" : "menu-down"} size={30} />
    </TouchableOpacity>
    {show ? (
      events.length > 0 ? (
        <Card events={events} navigation={navigation} />
      ) : (
        <Text style={styles.noEventsText}>No events available</Text>
      )
    ) : null}
  </View>
);

export default function HomeScreen({ navigation, userData }) {
  // const [selectedLocation, setSelectedLocation] = useState([]);
  // const [selectedCategory, setSelectedCategory] = useState([]);
  // const [searchQuery, setSearchQuery] = useState("");
  const [isExtended, setIsExtended] = useState(true);
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [showMyEvents, setShowMyEvents] = useState(false);
  const [showFriendsEvent, setShowFriendsEvent] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState({
    upcoming: [],
    myEvents: [],
    friendsEvent: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { loggedInUser } = useAuth();
  const isFocused = useIsFocused();

  const onScroll = useCallback(
    debounce((e) => {
      e.persist();
      const currentScrollPosition =
        Math.floor(e.nativeEvent?.contentOffset?.y) ?? 0;
      setIsExtended(currentScrollPosition <= 0);
    }, 100),
    []
  );
  // useMemo(() => {
  //   if (!selectedEvents) return [];
  //   let upcoming = [],
  //     myEvents = [],
  //     friendsEvent = [];
  //   if (selectedEvents.upcoming)
  //     upcoming = selectedEvents.upcoming?.filter((event) => {
  //       const matchesLocation =
  //         selectedLocation.length === 0 ||
  //         selectedLocation.includes(event.event_location || "");
  //       const matchesCategory =
  //         selectedCategory.length === 0 ||
  //         selectedCategory.includes(event.event_type || "");
  //       const matchesSearch =
  //         !searchQuery ||
  //         event.event_name?.toLowerCase().includes(searchQuery.toLowerCase());

  //       return matchesLocation && matchesCategory && matchesSearch;
  //     });
  //   if (selectedEvents.myEvents)
  //     myEvents = selectedEvents.myEvents?.filter((event) => {
  //       const matchesLocation =
  //         selectedLocation.length === 0 ||
  //         selectedLocation.includes(event.event_location || "");
  //       const matchesCategory =
  //         selectedCategory.length === 0 ||
  //         selectedCategory.includes(event.event_type || "");
  //       const matchesSearch =
  //         !searchQuery ||
  //         event.event_name?.toLowerCase().includes(searchQuery.toLowerCase());

  //       return matchesLocation && matchesCategory && matchesSearch;
  //     });
  //   if (selectedEvents.friendsEvent)
  //     friendsEvent = selectedEvents.friendsEvent?.filter((event) => {
  //       const matchesLocation =
  //         selectedLocation.length === 0 ||
  //         selectedLocation.includes(event.event_location || "");
  //       const matchesCategory =
  //         selectedCategory.length === 0 ||
  //         selectedCategory.includes(event.event_type || "");
  //       const matchesSearch =
  //         !searchQuery ||
  //         event.event_name?.toLowerCase().includes(searchQuery.toLowerCase());

  //       return matchesLocation && matchesCategory && matchesSearch;
  //     });
  //   setSelectedEvents({
  //     upcoming: upcoming,
  //     myEvents: myEvents,
  //     friendsEvent: friendsEvent,
  //   });
  // }, [selectedLocation, selectedCategory, searchQuery]);
  const formatEventDate = (date) => {
    if (!date || !date.seconds) return null;
    return new Date(date.seconds * 1000);
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      const now = new Date().getTime();

      const formattedData = await Promise.all(
        data.map(async (event) => {
          const participants = await getParticipants(event.id);
          const current = event.current_event_participates;
          const total = event.event_participates;
          return {
            ...event,
            eventDate: formatEventDate(event.event_date),
            participants,
            currentParticipants: current,
            totalParticipants: total,
          };
        })
      );

      const filteredEvents = formattedData.filter(
        (event) => event.eventDate && event.eventDate.getTime() >= now
      );

      setSelectedEvents({
        upcoming: filteredEvents.filter((event) =>
          event.participants.some((p) => p.user_id === loggedInUser)
        ),
        friendsEvent: filteredEvents.filter(
          (event) => userData?.friends.includes(event.uid) && event.is_private
        ),
        myEvents: filteredEvents.filter((event) => event.uid === loggedInUser),
      });
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchEvents();
    }
  }, [isFocused, userData]);
  // const clearFilters = () => {
  //   setSelectedLocation([]);
  //   setSelectedCategory([]);
  //   setSearchQuery("");
  // };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents().then(() => setRefreshing(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Sort
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <View style={styles.clearButtonContainer}>
        <Button
          style={styles.clearButton}
          labelStyle={styles.clearButtonText}
          onPress={clearFilters}
        >
          Clear Filters
        </Button>
      </View> */}
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          onScroll={(e) => {
            e.persist();
            onScroll(e);
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <ExpandableSection
            title="Upcoming Event"
            show={showUpcoming}
            setShow={setShowUpcoming}
            events={selectedEvents.upcoming}
            navigation={navigation}
          />
          <ExpandableSection
            title="My Events"
            show={showMyEvents}
            setShow={setShowMyEvents}
            events={selectedEvents.myEvents}
            navigation={navigation}
          />
          <ExpandableSection
            title="Friend's Event"
            show={showFriendsEvent}
            setShow={setShowFriendsEvent}
            events={selectedEvents.friendsEvent}
            navigation={navigation}
          />
        </ScrollView>
      )}
      <AnimatedFAB
        icon={"plus"}
        label={"New Event"}
        extended={isExtended}
        onPress={() => navigation.navigate("CreateEvent")}
        visible={true}
        animateFrom={"right"}
        iconMode={"left"}
        style={{ bottom: 16, right: 16, position: "absolute" }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, height: "100%" },
  fabStyle: { bottom: 16, right: 16, position: "absolute" },
  heading: {
    minHeight: 50,
    backgroundColor: "rgba(230, 230, 230, 0.5)",
    marginBottom: 16,
    borderRadius: 8,
    padding: 8,
  },
  content: { flexGrow: 1, paddingTop: 0, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 7,
    marginVertical: 7,
  },
  noEventsText: { textAlign: "center", color: "#9d3232", padding: 16 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
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
