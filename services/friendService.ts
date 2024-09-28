import { auth, db } from "../services/firebaseConfig";
import {
  collection,
  addDoc,
  Timestamp,
  updateDoc,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  getDoc,
} from "firebase/firestore";

const sendFriendRequest = async (
  fromUserId: string,
  toUserId: string,
  displayName: string
) => {
  try {
    const friendRequestsRef = collection(db, "friendRequests");
    await addDoc(friendRequestsRef, {
      fromUserId,
      toUserId,
      displayName,
      status: "pending", // The status can be 'pending', 'accepted', or 'rejected'
      createdAt: Timestamp.now(),
    });
    console.log("Friend request sent");
  } catch (error) {
    console.error("Error sending friend request:", error);
  }
};

const acceptFriendRequest = async (
  requestId: string,
  fromUserId: string,
  toUserId: string
) => {
  try {
    // Update the friend request status to 'accepted'
    const requestRef = doc(db, "friendRequests", requestId);
    await updateDoc(requestRef, { status: "accepted" });

    // Add each user to the other's friends subcollection
    const fromUserFriendsRef = doc(
      db,
      "users",
      fromUserId,
      "friends",
      toUserId
    );
    const toUserFriendsRef = doc(db, "users", toUserId, "friends", fromUserId);
    await setDoc(fromUserFriendsRef, { friendId: toUserId });
    await setDoc(toUserFriendsRef, { friendId: fromUserId });

    console.log("Friend request accepted");
  } catch (error) {
    console.error("Error accepting friend request:", error);
  }
};

const rejectFriendRequest = async (requestId: string) => {
  try {
    const requestRef = doc(db, "friendRequests", requestId);
    await updateDoc(requestRef, { status: "rejected" });
    console.log("Friend request rejected");
  } catch (error) {
    console.error("Error rejecting friend request:", error);
  }
};

// Function to get incoming friend requests for the current user
const getFriendRequests = async () => {
  const currentUser = auth.currentUser;

  if (!currentUser) return [];

  const friendRequestsQuery = query(
    collection(db, "friendRequests"),
    where("toUserId", "==", currentUser.uid),
    where("status", "==", "pending") // Only fetch pending requests
  );

  const querySnapshot = await getDocs(friendRequestsQuery);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Function to get the list of friends for the current user
const getFriends = async () => {
  if (!auth.currentUser) throw new Error("User not authenticated");

  const userId = auth.currentUser.uid;

  // Get all documents in the 'friends' subcollection of the current user
  const q = query(collection(db, "users", userId, "friends"));
  const querySnapshot = await getDocs(q);

  const friends = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return friends;
};

const searchUsers = async (searchTerm: string) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("username", ">=", searchTerm),
      where("username", "<=", searchTerm + "\uf8ff")
    );
    const querySnapshot = await getDocs(q);

    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    return users;
  } catch (error) {
    console.error("Error searching for users:", error);
    throw error;
  }
};

// Real-time function to get incoming friend requests
const listenToFriendRequests = (onUpdate) => {
  const currentUser = auth.currentUser;

  if (!currentUser) return;

  const friendRequestsQuery = query(
    collection(db, "friendRequests"),
    where("toUserId", "==", currentUser.uid)
  );

  // Listen for real-time updates
  return onSnapshot(friendRequestsQuery, (snapshot) => {
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    onUpdate(requests);
  });
};

// Real-time function to get the list of friends
const listenToFriends = (onUpdate) => {
  if (!auth.currentUser) return;

  const userId = auth.currentUser.uid;
  const friendsQuery = collection(db, "users", userId, "friends");

  // Listen for real-time updates
  return onSnapshot(friendsQuery, async (snapshot) => {
    const friends = [];

    for (const docSnapshot of snapshot.docs) {
      const friendId = docSnapshot.data().friendId;
      const userRef = doc(db, "users", friendId);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        friends.push({ id: friendId, ...userSnapshot.data() });
      }
    }

    // Call the onUpdate function with the user data
    onUpdate(friends);
  });
};

// Fetching chats for a user
const fetchFriendsWithLastMessages = async (userId: string) => {
  try {
    // Query to get chats where the user is a participant
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participants", "array-contains", userId));

    const querySnapshot = await getDocs(q);
    const friends = [];

    for (const docSnap of querySnapshot.docs) {
      const chatData = docSnap.data();
      const friendId = chatData.participants.find((id) => id !== userId); // Get the other participant

      // Fetch friend's user data
      const friendDoc = await getDoc(doc(db, `users/${friendId}`));
      const friendData = friendDoc.data();

      if (friendData) {
        friends.push({
          chatId: docSnap.id,
          displayName: friendData.displayName,
          photoURL: friendData.photoURL,
          lastMessage: chatData.lastMessage,
        });
      }
    }

    return friends;
  } catch (error) {
    console.error("Error fetching friends with last messages:", error);
    return [];
  }
};

export {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getFriendRequests,
  searchUsers,
  listenToFriendRequests, // Export real-time functions
  listenToFriends, // Export real-time functions
  fetchFriendsWithLastMessages,
};
