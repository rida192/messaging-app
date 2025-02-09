import { sendFriendRequest } from "@services/friendService";
import { auth } from "../services/firebaseConfig";

export const useSendFriendRequest = () => {
  const handleSendFriendRequest = async (
    toUserId: string,
    toUserPhotoURL: string
  ) => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    try {
      await sendFriendRequest(
        currentUserId,
        toUserId,
        auth.currentUser?.displayName || "Unknown User",
        auth.currentUser?.photoURL || toUserPhotoURL
      );
      alert("Friend request sent!");
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  return handleSendFriendRequest;
};
