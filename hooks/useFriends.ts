import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@services/firebaseConfig";
import { Friend } from "../types";
import { useEffect } from "react";

export const useFriends = (userId: string) => {
  const queryClient = useQueryClient();

  const fetchFriends = async (): Promise<Friend[]> => {
    const friendsRef = collection(db, `users/${userId}/friends`);
    const snapshot = await new Promise<any[]>((resolve, reject) =>
      onSnapshot(
        friendsRef,
        (snap) => resolve(snap.docs.map((docSnap) => docSnap)),
        reject
      )
    );

    const friendsList = await Promise.all(
      snapshot.map(async (docSnap) => {
        const friendData = docSnap.data();
        let friendDocData = friendData;

        if (!friendData.displayName) {
          const friendDoc = await getDoc(doc(db, `users/${docSnap.id}`));
          if (friendDoc.exists()) {
            friendDocData = friendDoc.data();
          }
        }

        // Generate chat ID
        const chatId =
          userId < docSnap.id
            ? `${userId}_${docSnap.id}`
            : `${docSnap.id}_${userId}`;

        // Fetch the last message timestamp from the chat document
        const chatDoc = await getDoc(doc(db, `chats/${chatId}`));
        const lastMessageTimestamp = chatDoc.exists()
          ? chatDoc.data().lastMessage?.timestamp
          : null;

        return {
          id: docSnap.id,
          ...friendDocData,
          lastMessageTimestamp, // Add lastMessageTimestamp to the friend object
        };
      })
    );

    return friendsList as Friend[];
  };

  useEffect(() => {
    const friendsRef = collection(db, `users/${userId}/friends`);
    const unsubscribeFriends = onSnapshot(friendsRef, async () => {
      // Invalidate the query to trigger a re-fetch
      await queryClient.invalidateQueries({ queryKey: ["friends", userId] });
    });

    // Listen for changes in the chats collection
    const chatsRef = collection(db, "chats");
    const unsubscribeChats = onSnapshot(chatsRef, async () => {
      // Invalidate the query to trigger a re-fetch
      await queryClient.invalidateQueries({ queryKey: ["friends", userId] });
    });

    return () => {
      unsubscribeFriends();
      unsubscribeChats();
    };
  }, [userId, queryClient]);

  return useQuery<Friend[], Error>({
    queryKey: ["friends", userId],
    queryFn: fetchFriends,
  });
};
