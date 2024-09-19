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
} from "firebase/firestore";

const sendFriendRequest = async (fromUserId: string, toUserId: string) => {
  try {
    const friendRequestsRef = collection(db, "friendRequests");
    await addDoc(friendRequestsRef, {
      fromUserId,
      toUserId,
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
  if (!auth.currentUser) throw new Error("User not authenticated");

  const userId = auth.currentUser.uid;

  // Query the friendRequests collection for requests where the current user is the recipient and the status is 'pending'
  const q = query(
    collection(db, "friendRequests"),
    where("recipientId", "==", userId),
    where("status", "==", "pending")
  );

  const querySnapshot = await getDocs(q);
  const friendRequests = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return friendRequests;
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

export {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getFriendRequests,
};
