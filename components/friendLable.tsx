import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { auth } from "@services/firebaseConfig";
import { useRouter } from "expo-router";
import { Friend } from "../types";
import { useChat } from "../hooks/useChat";
import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@services/firebaseConfig";
import { generateChatId } from "@utils/index";
import { Menu, Button, Dialog, Portal } from "react-native-paper";
import { deleteChat, deleteFriend } from "@services/friendService";
import Entypo from "@expo/vector-icons/Entypo";

const FriendLabel = ({ item }: { item: Friend }) => {
  const user = auth.currentUser;
  const { data: lastMessage } = useChat(user.uid, item.id);
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false); // State to toggle menu visibility
  const [dialogVisible, setDialogVisible] = useState(false); // State to toggle dialog visibility

  // Generate chat ID
  const chatId = generateChatId(user.uid, item.id);

  // Listen for unread messages
  useEffect(() => {
    const chatDocRef = doc(db, "chats", chatId);
    const unsubscribe = onSnapshot(chatDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const currentUserUnreadCount = data.unreadCount?.[user.uid] || 0;
        setUnreadCount(currentUserUnreadCount);
      }
    });

    return () => unsubscribe();
  }, [chatId]);

  // Handle menu toggle
  const toggleMenu = () => setMenuVisible(!menuVisible);

  // Handle opening chat
  const handleOpenChat = async () => {
    const chatDocRef = doc(db, "chats", chatId);
    try {
      router.push({
        pathname: "/chats/[chatId]",
        params: {
          chatId,
          displayName: item.displayName,
          photoURL: item.photoURL,
        },
      });

      // Reset the unread count when the chat is opened
      await updateDoc(chatDocRef, {
        [`unreadCount.${user.uid}`]: 0,
      });
      setUnreadCount(0);
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  };

  // Handle friend deletion
  const handleDeleteFriend = async () => {
    // const friendDocRef = doc(db, "friends", item.id); // Assuming friends are stored in a "friends" collection
    try {
      // Delete friend from both users' friend lists
      await deleteFriend(user.uid, item.id);

      // Delete the chat document between the two users
      await deleteChat(user.uid, item.id);
      setDialogVisible(false); // Close the dialog after deletion
      alert("Friend deleted successfully");
    } catch (error) {
      console.error("Error deleting friend:", error);
    }
  };

  return (
    <TouchableOpacity onPress={handleOpenChat}>
      <View className="flex-row gap-x-3 py-1">
        <Image
          source={{ uri: item.photoURL }}
          className="w-[52px] h-[52px] rounded-full"
        />
        <View className="flex-1 gap-y-2">
          <Text className="text-lg font-[Poppins] font-medium text-[#000E08]">
            {item.displayName}
          </Text>
          {lastMessage ? (
            <Text className="text-[#797C7B] text-xs opacity-60 text-left">
              {lastMessage.text}
            </Text>
          ) : (
            <Text style={styles.noMessages}>No messages yet</Text>
          )}
        </View>

        <View className="justify-between items-center">
          {lastMessage && (
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
          )}

          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {/* Menu for delete option */}
        <Menu
          visible={menuVisible}
          onDismiss={toggleMenu}
          anchor={
            <TouchableOpacity
              onPress={toggleMenu}
              style={{
                flex: 1,
                justifyContent: "flex-end",
              }}
            >
              <Entypo name="dots-three-vertical" size={18} color="gray" />
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => setDialogVisible(true)}
            title="Delete Friend"
          />
        </Menu>

        {/* Confirmation Dialog for Deletion */}
        <Portal>
          <Dialog
            visible={dialogVisible}
            onDismiss={() => setDialogVisible(false)}
            style={{ backgroundColor: "#fff" }}
          >
            <Dialog.Title style={{ color: "balck" }}>
              Confirm Deletion
            </Dialog.Title>
            <Dialog.Content>
              <Text>
                Are you sure you want to remove {item.displayName} as a friend?
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDialogVisible(false)}>
                <Text className="text-black">Cancel</Text>
              </Button>
              <Button onPress={handleDeleteFriend}>
                <Text className="text-red-500">Yes, Delete</Text>
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </TouchableOpacity>
  );
};

export default FriendLabel;

const styles = StyleSheet.create({
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
    backgroundColor: "#3d4a7a", // Badge color
    borderRadius: 999,
    paddingHorizontal: 2,
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
