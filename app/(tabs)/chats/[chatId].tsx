import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
} from "react-native";
import { db, auth } from "@services/firebaseConfig"; // Import your Firestore configuration
import {
  doc,
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { useLocalSearchParams } from "expo-router";

const ChatScreen = () => {
  const { chatId } = useLocalSearchParams();
  // console.log(chatId);
  // const { chatId } = route.params; // Assuming chatId is passed as route param
  const user = auth.currentUser; // Get the current user
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Set up real-time listener for messages in the chat
    const chatRef = collection(db, `chats/${chatId}/messages`);
    const messagesQuery = query(chatRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // console.log("Messages:", messagesList);
      setMessages(messagesList);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, [chatId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      text: newMessage,
      timestamp: Timestamp.now(), // Use Firestore Timestamp for accurate querying
      senderId: user.uid,
      displayName: user.displayName || "Anonymous", // Use a default name if not available
    };

    // Ensure chatId is a string before using split
    if (typeof chatId === "string") {
      const otherUserId = chatId.split("_").find((id) => id !== user.uid); // Get the other user's ID
      const chatRef = doc(db, `chats/${chatId}`);

      try {
        // Check if chat document exists, if not create it
        const chatDoc = await getDoc(chatRef);
        if (!chatDoc.exists()) {
          await setDoc(
            chatRef,
            {
              participants: [user.uid, otherUserId], // Initialize with participant IDs
              lastMessage: null, // Set to null or an initial structure
            },
            { merge: true }
          );
        }

        // Add new message to messages subcollection
        await addDoc(collection(chatRef, "messages"), messageData);

        // Update lastMessage field in the chat document
        await updateDoc(chatRef, {
          lastMessage: {
            text: newMessage,
            timestamp: messageData.timestamp, // Use the same timestamp as the message
            senderId: user.uid,
          },
        });

        setNewMessage(""); // Clear the input field
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    } else {
      console.error("chatId is not a string:", chatId);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.senderName}>{item.displayName}</Text>
            <Text>{item.text}</Text>
            <Text style={styles.timestamp}>
              {item.timestamp.toDate().toLocaleTimeString()}
            </Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  messageContainer: { marginVertical: 5 },
  senderName: { fontWeight: "bold" },
  timestamp: { fontSize: 10, color: "gray" },
  inputContainer: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    marginRight: 10,
  },
});

export default ChatScreen;
