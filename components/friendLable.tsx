import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { auth } from "@services/firebaseConfig";
import { useRouter } from "expo-router";
import { Friend } from "../types";
import { useChat } from "../hooks/useChat";

const FriendLable = ({ item }: { item: Friend }) => {
  const user = auth.currentUser;
  const { data: lastMessage } = useChat(user.uid, item.id);
  const router = useRouter();

  return (
    <TouchableOpacity
      // style={styles.friendItem}
      className="bg-white"
      onPress={() => {
        const chatId =
          user.uid < item.id
            ? `${user.uid}_${item.id}`
            : `${item.id}_${user.uid}`;
        router.push({
          pathname: "/chats/[chatId]",
          params: {
            chatId,
            displayName: item.displayName,
            photoURL: item.photoURL,
          }, // Pass friend's ID to chat screen
        });
      }}
    >
      <View
        // style={styles.friendDetails}
        className="flex-row gap-x-3"
      >
        <Image
          source={{ uri: item.photoURL }}
          className="w-12 h-12 rounded-full"
        />

        <View className="flex-1 gap-y-2">
          <Text
            // style={styles.friendName}
            className="text-lg font-medium text-[#000E08] "
          >
            {item.displayName}
          </Text>

          {lastMessage ? (
            <View>
              <Text
                // style={styles.lastMessage}
                className="text-[#797C7B] text-xs opacity-50 text-left"
              >
                {lastMessage.text}
              </Text>
            </View>
          ) : (
            <Text style={styles.noMessages}>No messages yet</Text>
          )}
        </View>
        {lastMessage && (
          <View>
            <Text style={styles.timestamp}>
              {(() => {
                const messageDate = lastMessage.timestamp.toDate();
                const now = new Date();
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);

                if (messageDate.toDateString() === now.toDateString()) {
                  return messageDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                } else if (
                  messageDate.toDateString() === yesterday.toDateString()
                ) {
                  return "Yesterday";
                } else {
                  return messageDate.toLocaleDateString([], {
                    month: "numeric",
                    day: "2-digit",
                    year: "2-digit",
                  });
                }
              })()}
            </Text>
          </View>
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
