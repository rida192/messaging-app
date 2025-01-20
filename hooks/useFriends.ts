import { useQuery } from "@tanstack/react-query";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@services/firebaseConfig";
import { Friend } from "../types";

export const useFriends = (userId: string) => {
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

        return {
          id: docSnap.id,
          ...friendDocData,
        };
      })
    );

    return friendsList as Friend[];
  };

  return useQuery<Friend[], Error>({
    queryKey: ["friends", userId],
    queryFn: fetchFriends,
  });
};
