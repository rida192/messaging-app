import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@services/firebaseConfig";

export const useChat = (userId: string, friendId: string) => {
  const [lastMessage, setLastMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !friendId) return;

    const chatId =
      userId < friendId ? `${userId}_${friendId}` : `${friendId}_${userId}`;
    const chatDocRef = doc(db, `chats/${chatId}`);

    const unsubscribe = onSnapshot(
      chatDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setLastMessage(snapshot.data()?.lastMessage || null);
        } else {
          setLastMessage(null);
        }
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, friendId]);

  return { data: lastMessage, isLoading, error };
};
