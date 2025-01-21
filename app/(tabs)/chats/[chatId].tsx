import React, { useEffect, useRef, useState } from "react";
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
import { Message } from "../../../types";

import Animated, {
  useAnimatedRef,
  useSharedValue,
  useAnimatedScrollHandler,
  scrollTo,
  useDerivedValue,
} from "react-native-reanimated";

const ChatScreen = () => {
  const { chatId } = useLocalSearchParams();
  // console.log(chatId);
  // const { chatId } = route.params; // Assuming chatId is passed as route param
  const user = auth.currentUser; // Get the current user
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const animatedRef = useAnimatedRef();
  const scrollY = useSharedValue(0);
  const contentHeight = useSharedValue(0);

  useEffect(() => {
    // Set up real-time listener for messages in the chat
    const chatRef = collection(db, `chats/${chatId}/messages`);
    const messagesQuery = query(chatRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesList as Message[]);
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

    setNewMessage(""); // Clear the input field

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

        // queryClient.invalidateQueries({
        //   queryKey: ["chat", user.uid],
        // });
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    } else {
      console.error("chatId is not a string:", chatId);
    }
  };

  // Smooth scrolling to the bottom
  // Smooth scrolling to the bottom
  const scrollToBottom = () => {
    console.log("Scrolling to bottom...");
    if (contentHeight.value > 0) {
      scrollTo(animatedRef, 0, contentHeight.value, true); // Scroll to the bottom
      // contentHeight.value += 900;
    }
  };

  // Track content height changes
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      contentHeight.value = event.contentSize.height;
    },
  });

  // Automatically scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useDerivedValue(() => {
    scrollTo(animatedRef, 100, contentHeight.value, true);
  });

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={animatedRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.senderName}>{item.displayName}</Text>
            <Text>{item.text}</Text>
            <Text style={styles.timestamp}>
              {(item.timestamp instanceof Date
                ? item.timestamp
                : item.timestamp.toDate()
              ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        )}
        onScroll={scrollHandler} // Track scroll events
        scrollEventThrottle={16} // Ensure smooth scrolling
        onContentSizeChange={(width, height) => {
          console.log("Content height:", height);

          contentHeight.value = height; // Update content height
          scrollToBottom(); // Scroll to the bottom when content size changes
        }}
        contentContainerStyle={{ paddingBottom: 80 }} // Add padding for the input container
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
