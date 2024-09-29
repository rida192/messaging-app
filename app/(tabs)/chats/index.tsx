import { View, Text, FlatList, StyleSheet, Button } from "react-native";
import React, { useEffect, useState } from "react";
import { logout } from "@services/auth";
import { collection, getDoc, onSnapshot, doc } from "firebase/firestore";
import { auth, db } from "@services/firebaseConfig";
import { Friend } from "../../../types";
import FriendLable from "@components/friendLable";

const MainTabScreen: React.FC = () => {
  const user = auth.currentUser;

  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const fetchFriendsData = async () => {
      try {
        const friendsRef = collection(db, `users/${user.uid}/friends`);

        // Listener for changes in the friends collection
        const unsubscribeFriends = onSnapshot(friendsRef, async (snapshot) => {
          const friendsList = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              const friendData = docSnap.data();
              let friendDocData = friendData;

              // Check if `displayName` exists; if not, fetch additional data from Firestore
              if (!friendData.displayName) {
                const friendDoc = await getDoc(doc(db, `users/${docSnap.id}`));
                if (friendDoc.exists()) {
                  friendDocData = friendDoc.data();
                }
              }

              // Get chat document for this friend to fetch last message
              const chatId =
                user.uid < docSnap.id
                  ? `${user.uid}_${docSnap.id}`
                  : `${docSnap.id}_${user.uid}`;

              const chatDocRef = doc(db, `chats/${chatId}`);
              const chatDocSnap = await getDoc(chatDocRef);

              // If chat exists, get the last message
              let lastMessage = null;
              if (chatDocSnap.exists()) {
                lastMessage = chatDocSnap.data()?.lastMessage || null;
              }

              onSnapshot(doc(db, `chats/${chatId}`), (chatDocSnap) => {
                if (chatDocSnap.exists()) {
                  lastMessage = chatDocSnap.data()?.lastMessage || null;
                  // Update the specific friend’s last message
                  setFriends((prevFriends) =>
                    prevFriends.map((friend) =>
                      friend.id === docSnap.id
                        ? { ...friend, lastMessage }
                        : friend
                    )
                  );
                }
              });

              return {
                id: docSnap.id,
                ...friendDocData,
                lastMessage,
              };
            })
          );
          console.log("Friends:", friends);
          setFriends(friendsList as Friend[]);
        });

        return () => {
          unsubscribeFriends(); // Cleanup listener on unmount
        };
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriendsData();
  }, [user.uid]);

  // Display last message in friends list
  const renderItem = ({ item }: { item: Friend }) => (
    <FriendLable item={item} />
  );

  // console.log("Friends:", friends);

  return (
    <View className="flex-1">
      <Text className="mt-72">MainTabScreen</Text>
      <Button
        title="logout"
        onPress={async () => {
          await logout();
        }}
      />

      <View style={styles.container}>
        <Text style={styles.header}>Friends</Text>
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </View>
    </View>
  );
};

export default MainTabScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
});
