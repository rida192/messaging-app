import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { auth } from "@services/firebaseConfig";
import { useRouter } from "expo-router";
import { Friend } from "../types";
import { useChat } from "../hooks/useChat";
import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@services/firebaseConfig";

const FriendLable = ({ item }: { item: Friend }) => {
  const user = auth.currentUser;
  const { data: lastMessage } = useChat(user.uid, item.id);
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0); // State for unread message count

  // Generate chat ID
  const chatId =
    user.uid < item.id ? `${user.uid}_${item.id}` : `${item.id}_${user.uid}`;

  // Listen for unread messages
  useEffect(() => {
    const chatDocRef = doc(db, "chats", chatId);
    const unsubscribe = onSnapshot(chatDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // Extract the current user's unread count from the unreadCount object
        const currentUserUnreadCount = data.unreadCount?.[user.uid] || 0;
        setUnreadCount(currentUserUnreadCount); // Update unread count
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [chatId]);

  // Clear unread count when the chat is opened
  const handleOpenChat = async () => {
    console.log("Opening chat with ID:", chatId);

    const chatDocRef = doc(db, "chats", chatId);
    try {
      // Reset the unreadCount for the current user only
      await updateDoc(chatDocRef, {
        [`unreadCount.${user.uid}`]: 0, // Reset only the current user's unread count
      });
      setUnreadCount(0); // Update local state

      // Navigate to the chat screen
      router.push({
        pathname: "/chats/[chatId]",
        params: {
          chatId,
          displayName: item.displayName,
          photoURL: item.photoURL,
        },
      });
      console.log("Navigation to chat screen triggered.");
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  };

  return (
    <TouchableOpacity
      className="bg-white"
      onPress={handleOpenChat} // Use the new handler
    >
      <View className="flex-row gap-x-3 py-1">
        <Image
          source={{ uri: item.photoURL }}
          className="w-[52px] h-[52px] rounded-full"
        />

        <View className="flex-1 gap-y-2">
          <Text className="text-xl font-[Poppins] font-medium text-[#000E08]">
            {item.displayName}
          </Text>

          {lastMessage ? (
            <View>
              <Text className="text-[#797C7B] text-xs opacity-60 text-left">
                {lastMessage.text}
              </Text>
            </View>
          ) : (
            <Text style={styles.noMessages}>No messages yet</Text>
          )}
        </View>

        {/* Display Unread Message Counter */}

        <View className=" justify-between items-center ">
          {lastMessage && (
            <View>
              <Text style={styles.timestamp}>
                {(() => {
                  const messageDate = lastMessage.timestamp.toDate();
                  const now = new Date();
                  const yesterday = new Date(now);
                  yesterday.setDate(yesterday.getDate() - 1);

                  if (messageDate.toDateString() === now.toDateString()) {
                    return messageDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  } else if (
                    messageDate.toDateString() === yesterday.toDateString()
                  ) {
                    return "Yesterday";
                  } else {
                    return messageDate.toLocaleDateString([], {
                      month: "numeric",
                      day: "2-digit",
                      year: "2-digit",
                    });
                  }
                })()}
              </Text>
            </View>
          )}

          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FriendLable;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  friendItem: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
  },
  friendDetails: {
    marginLeft: 10,
  },
  friendName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  lastMessage: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  noMessages: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  unreadBadge: {
    width: 25,
    height: 25,
    backgroundColor: "#3d4a7a", // Red badge
    borderRadius: 999,
    paddingHorizontal: 2,
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
    // position: "absolute", // Position the badge absolutely
    // right: 0, // Align to the right
    // top: 0, // Align to the top
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
