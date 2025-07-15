import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Platform, StatusBar, Pressable } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, BottomNavigation, List } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import User from "react-native-vector-icons/FontAwesome";
import Event from "react-native-vector-icons/MaterialIcons";
import HomeScreen from "./HomeScreen";
import ProfileScreen from "./ProfileScreen";
import EventsScreen from "./EventsScreen";
import SettingsScreen from "./SettingsScreen";
import AdminDashboard from "./AdminDashboard";
import { getUser } from "../firebase/firestoreUsage";
import { useAuth } from "../core/AuthContext";
import { theme } from "../core/theme";
const Tab = createBottomTabNavigator();

export default function Dashboard({ navigation }) {
  theme.colors.notification = "green";
  const { loggedInUser, userRole } = useAuth();
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    console.log(loggedInUser);

    if (!loggedInUser) {
      navigation.reset({
        index: 0,
        routes: [{ name: "StartScreen" }],
      });
    }
    if (!userData) {
      getUser(loggedInUser).then((user) => {
        setUserData(user);
      });
    }
  }, [loggedInUser]);

  useEffect(() => {
    console.log(userData);
  }, [userData]);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          activeColor="#03045e"
          theme={theme}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          }}
          getBadge={({ route }) => {
            if (route.name === "Profile" && userData?.friendreq.length > 0) {
              return (
                <Text style={styles.badgeText}>
                  {userData?.friendreq.length}
                </Text>
              ); // Custom number badge
            }
            return null;
          }}
          renderIcon={({ route, focused, color }) => {
            const { options } = descriptors[route.key];
            if (options.tabBarIcon) {
              return options.tabBarIcon({ focused, color, size: 24 });
            }

            return null;
          }}
          getLabelText={({ route }) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                  ? options.title
                  : route.title;

            return label;
          }}
        />
      )}
    >
      <Tab.Screen
        name="Home"
        children={(props) => <HomeScreen {...props} userData={userData} />}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => {
            return <Icon name="home" size={size} color={color} />;
            },
          }}
          />

          {userRole === 'admin' && (
          <>
            <Tab.Screen
            name="Admin Dashboard"
            component={AdminDashboard}
            options={{
              tabBarLabel: 'Admin Dashboard',
              tabBarIcon: ({ color, size }) => (
              <Icon name="shield-account" size={size} color={color} />
              ),
            }}
            />
            {/* <Tab.Screen                  // Moved to AdminDashboard
            name="Manage Accounts"
            component={ManageAccounts}
            options={{
              tabBarLabel: 'Accounts Management',
              tabBarIcon: ({ color, size }) => (
              <Icon name="account-group" size={size} color={color} />
              ),
            }}
            />
            <Tab.Screen
            name="Event Management"
            component={ManageEvents}
            options={{
              tabBarLabel: 'Event Management',
              tabBarIcon: ({ color, size }) => (
              <Icon name="calendar-edit" size={size} color={color} />
              ),
            }}
            /> */}

          </>
          )}

          <Tab.Screen
          name="Events"
          component={EventsScreen}
          options={{
            tabBarLabel: "Events",
            tabBarIcon: ({ color, size }) => {
            return <Event name="event" size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        children={(props) => (
          <ProfileScreen
            {...props}
            userData={userData}
            setUserData={setUserData}
          />
        )}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => {
            return <User name="user-circle-o" size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Settings"
        // component={SettingsScreen}
        // initialParams={{ userData: userData }}
        children={(props) => <SettingsScreen {...props} userData={userData} />}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => {
            return <Icon name="cog" size={size} color={color} />;
          },
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  badge: {
    backgroundColor: "green",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
  },
});
