import React from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { Bubble, GiftedChat, IMessage } from "react-native-gifted-chat";
import { useLocalSearchParams } from "expo-router";
import useChatMessages from "@hooks/useChatMesseges";
import useSendMessage from "@hooks/useSendMessege";
import { auth } from "@services/firebaseConfig";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

const ChatScreen = () => {
  const { chatId } = useLocalSearchParams();
  const user = auth.currentUser;

  // Use custom hooks
  const { messages, isLoading, error } = useChatMessages(chatId as string);
  const { mutate: sendMessage } = useSendMessage(chatId as string);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3d4a7a" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Error loading messages. Please try again.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GiftedChat
        isStatusBarTranslucentAndroid
        messages={messages}
        onSend={(newMessages) => sendMessage(newMessages[0])}
        user={{
          _id: user?.uid || "",
          name: user?.displayName || "You",
        }}
        showUserAvatar
        alwaysShowSend
        renderAvatarOnTop
        scrollToBottom={true}
        renderBubble={(props) => {
          return (
            <Bubble
              {...props}
              textStyle={{ left: { color: "black" } }}
              wrapperStyle={{
                left: { backgroundColor: "#f2f7fb" },
                right: { backgroundColor: "#3d4a7a" },
              }}
            />
          );
        }}
        scrollToBottomComponent={() => (
          <FontAwesome5 name="angle-double-down" size={22} color="#3d4a7a" />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  scrollToBottomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3d4a7a",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 80, // Adjust this value based on your layout
    right: 20,
  },
});

export default ChatScreen;
