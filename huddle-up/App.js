import React from "react";
import { Provider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { theme } from "./src/core/theme";
import { AuthProvider, useAuth } from "./src/core/AuthContext";
import {
  StartScreen,
  LoginScreen,
  RegisterScreen,
  ResetPasswordScreen,
  Dashboard,
  CreateEvent,
  EventDetails,
  SearchUsers,
  FriendListScreen,
  EditProfile,
  HistoryScreen,
  MyEventsScreen,
} from "./src/screens";
import SettingsScreen from "./src/screens/SettingsScreen";
import AdminDashboard from "./src/screens/AdminDashboard";
import ManageAccounts from "./src/screens/ManageAccounts";
import ManageEvents from "./src/screens/ManageEvents";
import UserDetailsScreen from "./src/screens/UserDetailsScreen";

import { ActionSheetProvider } from "@expo/react-native-action-sheet";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { userRole } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName="StartScreen"
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        transitionSpec: {
          open: { animation: "timing", config: { duration: 300 } },
          close: { animation: "timing", config: { duration: 200 } },
        },
      }}
    >
      <Stack.Screen name="StartScreen" component={StartScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="EventDetails" component={EventDetails} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="SearchUsers" component={SearchUsers} />
      <Stack.Screen name="CreateEvent" component={CreateEvent} />
      <Stack.Screen name="FriendListScreen" component={FriendListScreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
      <Stack.Screen name="MyEventsScreen" component={MyEventsScreen} />
      <Stack.Screen name="UserDetailsScreen" component={UserDetailsScreen} />
      {userRole === "admin" && (
        <>
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen name="ManageAccounts" component={ManageAccounts} />
          <Stack.Screen name="ManageEvents" component={ManageEvents} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ActionSheetProvider>
        <Provider theme={theme}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </Provider>
      </ActionSheetProvider>
    </AuthProvider>
  );
}
