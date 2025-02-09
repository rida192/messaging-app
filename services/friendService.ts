import { FriendRequest } from "../types";
import { auth, db } from "../services/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { generateChatId } from "@utils/index";

const sendFriendRequest = async (
  fromUserId: string,
  toUserId: string,
  fromUserDisplayName: string,
  fromUserPhotoURL: string
) => {
  try {
    const friendRequestsRef = collection(db, "friendRequests");
    await addDoc(friendRequestsRef, {
      fromUserId,
      toUserId,
      fromUserDisplayName,
      fromUserPhotoURL, // Include the photoURL
      status: "pending",
      timestamp: new Date(),
    });
  } catch (error) {
    throw new Error("Failed to send friend request: " + error.message);
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

    // Create a new chat document for the two users
    console.log("Creating new chat...");
    await createNewChat(fromUserId, toUserId);
    console.log("Friend request accepted and chat created.");

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
const listenToFriendRequests = (
  onUpdate: (requests: FriendRequest[]) => void
) => {
  const currentUserId = auth.currentUser?.uid;
  if (!currentUserId) return;

  const friendRequestsRef = collection(db, "friendRequests");
  const q = query(friendRequestsRef, where("toUserId", "==", currentUserId));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      fromUserId: doc.data().fromUserId,
      toUserId: doc.data().toUserId,
      fromUserDisplayName: doc.data().fromUserDisplayName,
      fromUserPhotoURL: doc.data().fromUserPhotoURL, // Include the photoURL
      status: doc.data().status,
      timestamp: doc.data().timestamp,
    }));
    onUpdate(requests);
  });

  return unsubscribe;
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

const createNewChat = async (user1Id: string, user2Id: string) => {
  const chatId =
    user1Id < user2Id ? `${user1Id}_${user2Id}` : `${user2Id}_${user1Id}`;
  const chatRef = doc(db, "chats", chatId);

  try {
    // Check if the chat already exists
    const chatDoc = await getDoc(chatRef);
    if (!chatDoc.exists()) {
      // Create a new chat document with the required fields
      await setDoc(chatRef, {
        participants: [user1Id, user2Id],
        lastMessage: null,
        unreadCount: {
          [user1Id]: 0, // Initialize unread count for user1
          [user2Id]: 0, // Initialize unread count for user2
        },
      });
      console.log("New chat created successfully!");
    } else {
      console.log("Chat already exists.");
    }
  } catch (error) {
    console.error("Error creating new chat: ", error);
  }
};

const updateActiveChatId = async (userId: string, chatId: string | null) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { activeChatId: chatId });
};

/**
 * Fetches the active chat ID for a user.
 * @param userId - The ID of the user.
 * @returns The active chat ID or null if no chat is active.
 */
const getActiveChatId = async (userId: string) => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    return userDoc.data().activeChatId || null;
  }

  return null;
};

const handleAcceptFriendRequest = async (requestId, fromUserId, toUserId) => {
  try {
    await acceptFriendRequest(requestId, fromUserId, toUserId);
  } catch (error) {
    console.error("Error accepting friend request:", error);
  }
};

const handleRejectFriendRequest = async (requestId) => {
  try {
    await rejectFriendRequest(requestId);
  } catch (error) {
    console.error("Error rejecting friend request:", error);
  }
};

const deleteFriend = async (userId, friendId) => {
  try {
    // Delete friend from the current user's friend list
    const userFriendRef = doc(db, `users/${userId}/friends/${friendId}`);
    await deleteDoc(userFriendRef);

    // Delete the current user from the friend's friend list
    const friendFriendRef = doc(db, `users/${friendId}/friends/${userId}`);
    await deleteDoc(friendFriendRef);
  } catch (error) {
    throw new Error("Failed to delete friend: " + error.message);
  }
};

const deleteChat = async (userId, friendId) => {
  try {
    // Generate chat ID (ensure it matches how you create chat IDs)
    const chatId = generateChatId(userId, friendId);

    // Reference to the chat document
    const chatRef = doc(db, `chats/${chatId}`);

    // Reference to the messages subcollection
    const messagesRef = collection(db, `chats/${chatId}/messages`);

    // Fetch all documents in the messages subcollection
    const messagesSnapshot = await getDocs(messagesRef);

    // Delete each message document in the subcollection
    const deleteMessagesPromises = messagesSnapshot.docs.map((messageDoc) =>
      deleteDoc(messageDoc.ref)
    );

    // Wait for all messages to be deleted
    await Promise.all(deleteMessagesPromises);

    // Delete the chat document
    await deleteDoc(chatRef);
  } catch (error) {
    throw new Error("Failed to delete chat: " + error.message);
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
  updateActiveChatId,
  getActiveChatId,
  handleAcceptFriendRequest,
  handleRejectFriendRequest,
  deleteChat,
  deleteFriend,
};
