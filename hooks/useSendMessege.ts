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
import { getActiveChatId } from "@services/friendService"; // Import the function

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
                unreadCount: {
                  [user?.uid]: 0,
                  [otherUserId]: 0,
                },
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

          // Check if the recipient is currently viewing the chat
          if (otherUserId) {
            const isRecipientViewingChat =
              (await getActiveChatId(otherUserId)) === chatId;

            if (!isRecipientViewingChat) {
              const chatData = chatDoc.data();
              const currentUnreadCount =
                chatData?.unreadCount?.[otherUserId] || 0;

              await updateDoc(chatRef, {
                [`unreadCount.${otherUserId}`]: currentUnreadCount + 1,
              });
            }
          }
        } catch (error) {
          console.error("Error sending message: ", error);
        }
      }
    },
  });
};

export default useSendMessage;
