import { useMutation } from "@tanstack/react-query";
import { db, auth } from "@services/firebaseConfig";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { IMessage } from "react-native-gifted-chat";

const useSendMessage = (chatId: string) => {
  const user = auth.currentUser;

  return useMutation({
    mutationFn: async (message: IMessage) => {
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
    },
  });
};

export default useSendMessage;
