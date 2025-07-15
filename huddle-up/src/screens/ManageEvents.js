import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    RefreshControl,
    StyleSheet,
    ScrollView,
    Alert,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../components/Card";
import { getEvents } from "../firebase/firestoreUsage";
import { useAuth } from "../core/AuthContext";
import { Search } from "../components/topBar";

export default function ManageEvents({ navigation }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [events, setEvents] = useState(null);
    const [filteredEvents, setFilteredEvents] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isExtended, setIsExtended] = useState(true);
    const { userRole } = useAuth();

    useEffect(() => {
        if (userRole !== 'admin') {
            navigation.navigate('Dashboard');
        } else {
            fetchEvents();
        }
    }, [userRole]);

    const fetchEvents = async () => {
        try {
            const data = await getEvents();
            setEvents(data);
            setFilteredEvents(data);
        } catch (error) {
            Alert.alert("Error", "Failed to load events. Please try again.");
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchEvents().then(() => setRefreshing(false));
    }, []);

    useMemo(() => {
        if (!events) return;
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = events.filter(event =>
            event.event_name?.toLowerCase().includes(lowerQuery)
        );
        setFilteredEvents(searchQuery ? filtered : events);
    }, [searchQuery, events]);

    const onScroll = ({ nativeEvent }) => {
        setIsExtended(nativeEvent.contentOffset.y <= 0);
    };

    return (
        <>
            <View style={styles.container}>
                <View style={styles.topBar}>
                    <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                </View>
                <SafeAreaView style={{ flex: 1 }} />
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
                    ) : filteredEvents?.length > 0 ? (
                        <Card events={filteredEvents} navigation={navigation} />
                    ) : (
                        <Card events={[]} message="No events found." />
                    )}
                </ScrollView>
            </View>

        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: "100%",
        paddingTop: 10,
        marginBottom: 5,
    },
    topBar: {
        paddingHorizontal: 8,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingBottom: 80,
    },

});
