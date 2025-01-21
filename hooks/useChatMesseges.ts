import { useQuery } from "@tanstack/react-query";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@services/firebaseConfig";
import { IMessage } from "react-native-gifted-chat";

const useChatMessages = (chatId: string) => {
  const fetchMessages = () =>
    new Promise<IMessage[]>((resolve, reject) => {
      const chatRef = collection(db, `chats/${chatId}/messages`);
      const messagesQuery = query(chatRef, orderBy("timestamp", "desc"));

      const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const messages = snapshot.docs.map((doc) => {
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
          resolve(messages);
        },
        reject
      );

      return unsubscribe;
    });

  const {
    data: messages,
    isLoading,
    error,
  } = useQuery<IMessage[], Error>({
    queryKey: ["messages", chatId],
    queryFn: fetchMessages,
  });

  return { messages: messages || [], isLoading, error };
};

export default useChatMessages;
