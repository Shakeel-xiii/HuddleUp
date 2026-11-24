import { uploadFileFromUrl } from "../storage/usage";
import { db } from "./firebaseConfig";
import {
  arrayRemove,
  arrayUnion,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  setDoc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

export const addEvent = async (eventData) => {
  try {
    const eventWithDefaults = {
      ...eventData,
      creation_date: new Date().toISOString(), // ISO 8601 format
      current_event_participates: 0, // Initialize to 0
    };
    const eventsCollectionRef = collection(db, "events");
    const eventRef = doc(eventsCollectionRef);
    eventWithDefaults.picture_url = await uploadFileFromUrl(
      eventData.picture_url ??
      "https://assets.almasood.org/huddle-up/default.jpg",
      eventRef.id,
      `events/${eventData.uid}`
    );

    await setDoc(eventRef, eventWithDefaults);
    console.log("Event added with ID:", eventRef.id);
    await addParticipant(eventRef.id, eventData.uid); // Add creator as participant
    return eventRef.id;
  } catch (error) {
    console.error("Error adding event:", error);
    throw new Error("Failed to add event. Please try again.");
  }
};

export const getEvents = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "events"));
    const events = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw new Error("Failed to fetch events. Please try again.");
  }
};

export const deleteEvent = async (eventId) => {
  try {
    await deleteDoc(doc(db, "events", eventId));
    console.log("Event deleted:", eventId);
  } catch (error) {
    console.error("Error deleting event:", error);
    throw new Error("Failed to delete event. Please try again.");
  }
};


export const updateEvent = async (eventId, editedEvent) => {
  try {
    const ref = doc(db, 'events', eventId);
    await updateDoc(ref, {
      event_name: editedEvent.event_name,
      event_description: editedEvent.event_description,
      event_location: editedEvent.event_location,
      event_type: editedEvent.event_type,
      event_date: editedEvent.event_date,
      price: editedEvent.price,
      age_range: editedEvent.age_range,
      gender: editedEvent.gender,
    });
  } catch (err) {
    console.error(err);
    throw new Error('Error', 'Could not save changes.');
  }
}


export const getEventById = async (eventId) => {
  try {
    const eventRef = doc(db, "events", eventId);
    const eventSnapshot = await getDoc(eventRef);
    if (!eventSnapshot.exists()) {
      throw new Error("Event not found.");
    }
    const eventData = eventSnapshot.data();
    return {
      id: eventSnapshot.id,
      ...eventData,
    };
  } catch (error) {
    console.error("Error fetching event:", error);
    throw new Error("Failed to fetch event. Please try again.");
  }
};

// export const deleteUser = async (uid) => {
//   try {
//     await deleteDoc(doc(db, "users", uid));
//   } catch (error) {
//     throw new Error("Error deleting user: " + error.message);
//   }
// };

export const setUserStatus = async (uid, status) => {
  try {
    await updateDoc(doc(db, "users", uid), {
      Status: status, // 'active' or 'inactive'
    });
    console.log(`User ${uid} status updated to ${status}`);
  } catch (error) {
    console.error("Error updating user status:", error);
    throw new Error("Failed to update user status. Please try again.");
  }
};


export const addParticipant = async (eventId, userId) => {
  try {
    // const participantRef = collection(db, "events", eventId, "participants");
    const eventRef = doc(db, "events", eventId);
    const eventSnapshot = await getDoc(eventRef);
    const eventData = eventSnapshot.data();

    if (!eventData) {
      throw new Error("Event data not found.");
    }

    if (eventData.current_event_participates >= eventData.event_participates) {
      throw new Error("Event is full. Cannot add more participants.");
    }

    // await addDoc(participantRef, {
    //   user_id: userId,
    //   joined_date: new Date().toISOString(), // ISO 8601 format
    // });
    await setDoc(doc(db, "events", eventId, "participants", userId), {
      user_id: userId,
      joined_date: new Date().toISOString(), // ISO 8601 format
    });
    await updateDoc(eventRef, {
      current_event_participates: increment(1),
    });

    console.log("Participant added to event:", eventId);
  } catch (error) {
    console.error("Error adding participant:", error);
    throw new Error("Failed to add participant. Please try again.");
  }
};

export const removeParticipant = async (eventId, participantId) => {
  try {
    await deleteDoc(doc(db, "events", eventId, "participants", participantId));
    await updateDoc(doc(db, "events", eventId), {
      current_event_participates: increment(-1),
    });
    console.log("Participant removed:", participantId);
  } catch (error) {
    console.error("Error removing participant:", error);
    throw new Error("Failed to remove participant. Please try again.");
  }
};

export const getParticipants = async (eventId) => {
  try {
    const participantRef = collection(db, "events", eventId, "participants");
    const querySnapshot = await getDocs(participantRef);
    const participants = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return participants;
  } catch (error) {
    console.error("Error fetching participants:", error);
    throw new Error("Failed to fetch participants. Please try again.");
  }
};

export const getCurrentAndTotalParticipants = async (eventId) => {
  try {
    const eventRef = doc(db, "events", eventId);
    const eventSnapshot = await getDoc(eventRef);
    const eventData = eventSnapshot.data();

    if (!eventData) {
      throw new Error("Event data not found.");
    }

    return {
      current: eventData.current_event_participates,
      total: eventData.total_event_participates,
    };
  } catch (error) {
    console.error("Error fetching participant counts:", error);
    throw new Error("Failed to fetch participant counts. Please try again.");
  }
};

export async function getParticipantsWithUserData(eventId) {
  try {
    const participantsRef = collection(db, "events", eventId, "participants");
    const snapshot = await getDocs(participantsRef);

    const enrichedParticipants = [];

    for (const participantDoc of snapshot.docs) {
      const participantData = participantDoc.data();
      const userId = participantData.user_id;

      const userRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        enrichedParticipants.push({
          ...participantData,
          ...userData, // Merges all user fields like name, location, etc.
          uid: userId, // optionally include userId if needed
        });
      } else {
        enrichedParticipants.push({
          ...participantData,
          name: "Unknown",
          uid: userId,
        });
      }
    }

    return enrichedParticipants;
  } catch (error) {
    console.error("Error fetching participants with user data:", error);
    return [];
  }
}

export const checkCPRexist = async (cpr) => {
  try {
    const CPRquery = query(collection(db, "users"), where("cpr", "==", cpr));
    const cprSnapshot = await getDocs(CPRquery);
    return !cprSnapshot.empty;
  } catch (error) {
    console.error("Error checking CPR existence:", error);
    throw new Error("Failed to check CPR existence. Please try again.");
  }
};

export const checkPhoneExist = async (phone) => {
  try {
    const phoneQuery = query(
      collection(db, "users"),
      where("phone", "==", phone)
    );
    const phoneSnapshot = await getDocs(phoneQuery);
    return !phoneSnapshot.empty;
  } catch (error) {
    console.error("Error checking phone existence:", error);
    throw new Error("Failed to check phone existence. Please try again.");
  }
};

export const checkEmailExist = async (email) => {
  try {
    const emailQuery = query(
      collection(db, "users"),
      where("email", "==", email)
    );
    const emailSnapshot = await getDocs(emailQuery);
    return !emailSnapshot.empty;
  } catch (error) {
    console.error("Error checking email existence:", error);
    throw new Error("Failed to check email existence. Please try again.");
  }
};

export const addUser = async (uid, data) => {
  try {
    const userWithDefaults = {
      ...data, // spread operator to include all user data passed in Registration screen
      Role: "user",
      Status: "active" // default role as 'user'
    };
    await setDoc(doc(db, "users", uid), userWithDefaults);
    console.log("User added with ID:", uid);
    return uid;
  } catch (error) {
    console.error("Error adding user:", error);
    throw new Error("Failed to add user. Please try again.");
  }
};

export async function getUserRole(uid) {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    return userDoc.data().Role;
  } else {
    return null;
  }
}

export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const events = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
    }));
    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw new Error("Failed to fetch events. Please try again.");
  }
};

export const getUser = async (uid) => {
  try {
    if (!uid) throw new Error("No UID provided to getUser");
    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);
    return userSnapshot.data();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user. Please try again.");
  }
};

export const updateUser = async (uid, data) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, data);
    console.log("User updated:", uid);
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user. Please try again.");
  }
};

// Friend's functions
export const sendFriendReq = async (uid, friendId) => {
  try {
    const userRef = doc(db, "users", uid);
    const friendRef = doc(db, "users", friendId);

    await updateDoc(userRef, {
      friendsen: arrayUnion(friendId),
    });

    await updateDoc(friendRef, {
      friendreq: arrayUnion(uid),
    });

    console.log("Friend Req Sent:", friendId);
  } catch (error) {
    console.error("Error adding friend:", error);
    throw new Error("Failed to add friend. Please try again.");
  }
};
export const removeFriendReq = async (uid, friendId) => {
  try {
    const userRef = doc(db, "users", uid);
    const friendRef = doc(db, "users", friendId);

    await updateDoc(userRef, {
      friendsen: arrayRemove(friendId),
    });

    await updateDoc(friendRef, {
      friendreq: arrayRemove(uid),
    });

    console.log("Friend Req Removed:", friendId);
  } catch (error) {
    console.error("Error adding friend:", error);
    throw new Error("Failed to add friend. Please try again.");
  }
};
export const removeFriend = async (uid, friendId) => {
  try {
    const userRef = doc(db, "users", uid);
    const friendRef = doc(db, "users", friendId);

    await updateDoc(userRef, {
      friends: arrayRemove(friendId),
    });

    await updateDoc(friendRef, {
      friends: arrayRemove(uid),
    });

    console.log("Friend removed:", friendId);
  } catch (error) {
    console.error("Error removing friend:", error);
    throw new Error("Failed to remove friend. Please try again.");
  }
};
//  Accept friend request from Profile Screen
export const acceptFriendReq = async (uid, friendId) => {
  try {
    const userRef = doc(db, "users", uid);
    const friendRef = doc(db, "users", friendId);

    await updateDoc(userRef, {
      friendreq: arrayRemove(friendId),
      friends: arrayUnion(friendId),
    });

    await updateDoc(friendRef, {
      friendsen: arrayRemove(uid),
      friends: arrayUnion(uid),
    });

    console.log("Friend accepted:", friendId);
  } catch (error) {
    console.error("Error accepting friend:", error);
    throw new Error("Failed to accept friend. Please try again.");
  }
};
//  Reject friend request from Profile Screen
export const rejectFriendReq = async (uid, friendId) => {
  try {
    const userRef = doc(db, "users", uid);
    const friendRef = doc(db, "users", friendId);

    await updateDoc(userRef, {
      friendreq: arrayRemove(friendId),
    });

    await updateDoc(friendRef, {
      friendsen: arrayRemove(uid),
    });

    console.log("Friend Rejected:", friendId);
  } catch (error) {
    console.error("Error accepting friend:", error);
    throw new Error("Failed to accept friend. Please try again.");
  }
};
