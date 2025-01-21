import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Bubble, GiftedChat, IMessage } from "react-native-gifted-chat";
import { db, auth } from "@services/firebaseConfig"; // Import your Firestore configuration
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useLocalSearchParams } from "expo-router";

const ChatScreen = () => {
  const { chatId } = useLocalSearchParams();
  const user = auth.currentUser;
  const [messages, setMessages] = useState<IMessage[]>([]);

  // Load messages from Firestore
  useEffect(() => {
    const chatRef = collection(db, `chats/${chatId}/messages`);
    const messagesQuery = query(chatRef, orderBy("timestamp", "desc")); // Descending for GiftedChat

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          _id: doc.id,
          text: data.text,
          createdAt: data.timestamp ? data.timestamp.toDate() : new Date(),
          user: {
            _id: data.senderId,
            name: data.displayName || "Anonymous",
          },
        };
      });
      setMessages(messagesList);
    });

    return () => unsubscribe();
  }, [chatId]);

  // Send a new message
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    const message = newMessages[0];
    const messageData = {
      text: message.text,
      timestamp: Timestamp.now(),
      senderId: user?.uid,
      displayName: user?.displayName || "Anonymous",
    };

    if (typeof chatId === "string") {
      const otherUserId = chatId.split("_").find((id) => id !== user?.uid);
      const chatRef = doc(db, `chats/${chatId}`);

      try {
        const chatDoc = await getDoc(chatRef);
        if (!chatDoc.exists()) {
          await setDoc(
            chatRef,
            {
              participants: [user?.uid, otherUserId],
              lastMessage: null,
            },
            { merge: true }
          );
        }

        await addDoc(collection(chatRef, "messages"), messageData);

        await updateDoc(chatRef, {
          lastMessage: {
            text: message.text,
            timestamp: messageData.timestamp,
            senderId: user?.uid,
          },
        });
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    }
  }, []);

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{
          _id: user?.uid || "",
          name: user?.displayName || "You",
        }}
        showUserAvatar
        alwaysShowSend
        renderAvatarOnTop
        renderBubble={(props) => {
          return (
            <Bubble
              {...props}
              textStyle={{ left: { color: "black" } }}
              wrapperStyle={{
                left: { backgroundColor: "#f2f7fb" },
                right: { backgroundColor: "#3d4a7a" },
              }}
            />
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});

export default ChatScreen;
