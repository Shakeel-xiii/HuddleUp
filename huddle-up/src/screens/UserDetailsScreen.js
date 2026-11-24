import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Alert,
    ActivityIndicator,
    ImageBackground,
    Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getUser, updateUser } from '../firebase/firestoreUsage';
import { Portal, Dialog, Paragraph } from 'react-native-paper';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import { getPrivateImageDataUrl } from '../storage/usage';
const { width } = Dimensions.get('window');

const UserDetailsScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { uid } = route.params ?? {};

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [cprImage, setCprImage] = useState(null);

    useEffect(() => {
        if (!uid) {
            console.error("No UID provided");
            return;
        }
        fetchUserDetails();
    }, [uid]);

    useEffect(() => {
        let isCurrent = true;
        setCprImage(null);
        if (user?.cprPic) {
            getPrivateImageDataUrl(user.cprPic)
                .then((image) => {
                    if (isCurrent) setCprImage(image);
                })
                .catch((error) => {
                    console.error("Failed to load private CPR image:", error);
                });
        }
        return () => {
            isCurrent = false;
        };
    }, [user?.cprPic]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const userData = await getUser(uid);
            setUser(userData);
        } catch (error) {
            Alert.alert('Error', 'Failed to load user details.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = () => {
        const newStatus = user.Status === 'inactive' ? 'active' : 'inactive';
        Alert.alert(
            `${newStatus === 'active' ? 'Activate' : 'Deactivate'} Account`,
            `Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this account?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: newStatus === 'active' ? 'Activate' : 'Deactivate',
                    style: newStatus === 'active' ? 'default' : 'destructive',
                    onPress: async () => {
                        try {
                            await updateUser(uid, { Status: newStatus });
                            Alert.alert('Success', `Account ${newStatus === 'active' ? 'activated' : 'deactivated'}.`);
                            fetchUserDetails();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to update status.');
                        }
                    },
                },
            ]
        );
    };

    const handleEditRole = () => {
        setShowRoleDialog(true);
    };

    const confirmRoleChange = async () => {
        const currentRole = user?.Role?.toLowerCase();
        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        Alert.alert(
            `Confirm Role Change`,
            `Are you sure you want to change the role from "${currentRole}" to "${newRole}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Change Role',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await updateUser(uid, { Role: newRole });
                            Alert.alert('Success', `Role changed to ${newRole}.`);
                            fetchUserDetails();
                            setShowRoleDialog(false);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to update role.');
                        }
                    },
                },
            ]
        );
    };




    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.centered}>
                <Text>User not found.</Text>
            </View>
        );
    }

    return (
        <View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <BackButton goBack={() => navigation.goBack()} style={{ marginTop: 10, marginLeft: 10, zIndex: 1 }} />
                <ImageBackground
                    source={{ uri: user.background_url || '' }}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                >
                    <View style={styles.overlay}>

                        <Image
                            source={{ uri: user.userPic }}
                            style={styles.profileImage}
                            resizeMode="cover"
                        />

                    </View>
                </ImageBackground>

                <View style={styles.detailsContainer}>
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.email}>{user.email}</Text>
                    <Text style={styles.info}>CPR : {user.cpr}</Text>
                    <Text style={styles.info}>
                        Birthdate:{' '}
                        {user.birthdate
                            ? new Date(user.birthdate.seconds * 1000).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })
                            : 'N/A'}
                    </Text>
                    <Text style={styles.info}>User ID: {user.uid}</Text>
                    <Text style={styles.info}>Role: {user.Role}</Text>
                    <Text style={styles.info}>Status: {user.Status}</Text>
                    <Text style={styles.info}>Phone: {user.phone || 'N/A'}</Text>
                    <Text style={styles.info}>Gender: {user.gender || 'N/A'}</Text>
                    <Text style={styles.info}>Location: {user.location || 'N/A'}</Text>


                    {cprImage && (
                        <View style={styles.cprContainer}>
                            <Text style={styles.cprTitle}>CPR Image (for Admin verification):</Text>
                            <Image source={{ uri: cprImage }} style={styles.cprImage} resizeMode="contain" />
                        </View>
                    )}

                    <View style={styles.buttonContainer}>
                        <Button
                            style={[
                                { borderColor: user.Status === 'inactive' ? 'green' : 'red', borderWidth: 1 },
                            ]}
                            labelStyle={{ color: user.Status === 'inactive' ? 'green' : 'red' }}
                            mode="outlined"
                            onPress={handleToggleStatus}
                        >
                            {user.Status === 'inactive' ? 'Activate Account' : 'Deactivate Account'}
                        </Button>
                        <Button style={[{ borderColor: 'rgb(80, 32, 0)', borderWidth: 1 },]}
                            onPress={handleEditRole}>
                            Edit Role
                        </Button>
                        <Button style={[{ borderColor: 'rgb(80, 32, 0)', borderWidth: 1 },]}
                            onPress={() => navigation.goBack()}>
                            Back
                        </Button>
                    </View>

                </View>
            </ScrollView>
            <Portal>
                <Dialog visible={showRoleDialog} onDismiss={() => setShowRoleDialog(false)}>
                    <Dialog.Title>Edit Role</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>
                            The current role of this user is: <Text style={{ fontWeight: 'bold' }}>{user?.Role}</Text>
                        </Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions style={{ flexDirection: 'column' , justifyContent: 'flex-end' }}>
                        <Button
                            onPress={confirmRoleChange}
                            mode="contained"
                            style={{ marginRight: 10 }} // purple
                            labelStyle={{ color: 'white' }}
                        >
                            Change Role
                        </Button>
                        <Button
                            onPress={() => setShowRoleDialog(false)}
                            mode="outlined"
                            style={{ borderColor: '#aaa' }}
                        >
                            Cancel
                        </Button>
                    </Dialog.Actions>

                </Dialog>
            </Portal>

        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

    },
    scrollContainer: {
        backgroundColor: '#f0f4f7',
    },
    backgroundImage: {
        width: '100%',
        height: 300,
        justifyContent: 'flex-end',
    },
    overlay: {
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        height: '100%',
        paddingBottom: 20,
    },
    profileImage: {
        width: 200,
        height: 200,
        borderRadius: 85,
        borderWidth: 2,
        borderColor: '#fff',
        marginBottom: 10,
        marginTop: 150,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: "rgba(106, 0, 206, 0.9)",
    },
    email: {
        fontSize: 15,
        color: "rgba(66, 0, 128, 0.73)",
        paddingBottom: 10,

    },
    detailsContainer: {
        padding: 20,
        alignItems: 'center',
        marginTop: 40,
    },
    info: {
        fontSize: 16,
        color: '#333',
        marginBottom: 6,
    },
    buttonContainer: {
        marginTop: 20,
        width: '100%',
    },

    cprContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    cprTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#444',
    },
    cprImage: {
        width: width * 0.8,
        height: 200,
        borderRadius: 10,
        backgroundColor: '#e0e0e0',
    },
});

export default UserDetailsScreen;
