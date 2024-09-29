import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { auth } from "@services/firebaseConfig";
import { useRouter } from "expo-router";
import { Friend } from "../types";

const FriendLable = ({ item }: { item: Friend }) => {
  const user = auth.currentUser;
  const router = useRouter();
  return (
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
};

export default FriendLable;

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
