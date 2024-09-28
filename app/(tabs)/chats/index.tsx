import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Button,
} from "react-native";
import React, { useEffect, useState } from "react";
import { logout } from "@services/auth";
import { collection, getDoc, onSnapshot, doc } from "firebase/firestore";
import { auth, db } from "@services/firebaseConfig";
import { useRouter } from "expo-router";

const MainTabScreen: React.FC = () => {
  const user = auth.currentUser;

  const [friends, setFriends] = useState([]);

  const router = useRouter();

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

          setFriends(friendsList);
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
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => {
        const chatId =
          user.uid < item.id
            ? `${user.uid}_${item.id}`
            : `${item.id}_${user.uid}`;
        router.push({
          pathname: "/chats/[chatId]",
          params: { chatId }, // Pass friend's ID to chat screen
        });
      }}
    >
      <View style={styles.friendDetails}>
        <Text style={styles.friendName}>{item.displayName}</Text>
        {item.lastMessage ? (
          <View>
            <Text style={styles.lastMessage}>{item.lastMessage.text}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.lastMessage.timestamp.toDate()).toLocaleString()}
            </Text>
          </View>
        ) : (
          <Text style={styles.noMessages}>No messages yet</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  console.log("Friends:", friends);

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
  friendItem: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
  },
  friendDetails: {
    marginLeft: 10,
  },
  friendName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  lastMessage: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  noMessages: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
});
