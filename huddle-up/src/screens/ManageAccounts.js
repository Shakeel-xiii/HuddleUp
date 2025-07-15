import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../core/AuthContext';
import { getUsers } from '../firebase/firestoreUsage';
import { Search } from '../components/topBar';
import { SafeAreaView } from 'react-native-safe-area-context';

const ManageAccounts = () => {
  const { userRole } = useAuth();
  const navigation = useNavigation();

  const [users, setUsers] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userRole !== 'admin') {
      navigation.navigate('Dashboard');
    } else {
      fetchUsers();
    }
  }, [userRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers().then(() => setRefreshing(false));
  }, []);

  useMemo(() => {
    if (!users) return;
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(lowerQuery)
    );
    setFilteredUsers(searchQuery ? filtered : users);
  }, [searchQuery, users]);

  const goToDetails = (user) => {
    navigation.navigate('UserDetailsScreen', { uid: user.uid });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.uid}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.userCard} onPress={() => goToDetails(item)}>
                <Image source={{ uri: item.userPic }} style={styles.userImage} />
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  <Text style={styles.userRole}>Role: {item.Role}</Text>
                  <Text style={styles.userStatus}>Status: {item.Status ?? 'active'}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.noUsersText}>No users found.</Text>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    marginBottom: 5,
    height: '100%',
  },
  topBar: {
    paddingHorizontal: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userRole: {
    fontSize: 14,
    color: '#666',
  },
  userStatus: {
    fontSize: 14,
    color: '#666',
  },
  noUsersText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 32,
  },
});

export default ManageAccounts;
