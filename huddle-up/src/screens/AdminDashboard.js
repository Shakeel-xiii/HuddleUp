import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ManageAccounts from './ManageAccounts';
import ManageEvents from './ManageEvents';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../core/AuthContext';

const Tab = createBottomTabNavigator();

const AdminDashboard = () => {
  return (
    <Tab.Navigator>
            <Tab.Screen
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
            />
    </Tab.Navigator>
  );
};

export default AdminDashboard;
