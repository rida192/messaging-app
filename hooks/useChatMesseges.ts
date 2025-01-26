import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@services/firebaseConfig";
import { IMessage } from "react-native-gifted-chat";

const useChatMessages = (chatId: string) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const chatRef = collection(db, `chats/${chatId}/messages`);
    const messagesQuery = query(chatRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messagesList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            _id: doc.id,
            text: data.text,
            createdAt: data.timestamp?.toDate() || new Date(),
            user: {
              _id: data.senderId,
              name: data.displayName || "Anonymous",
            },
          };
        });
        setMessages(messagesList); // Update local state
        setIsLoading(false); // Set loading to false
      },
      (error) => {
        setError(error); // Set error state
        setIsLoading(false); // Set loading to false
      }
    );

    return () => unsubscribe(); // Cleanup on unmount
  }, [chatId]);

  return { messages, isLoading, error };
};

export default useChatMessages;
