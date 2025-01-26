import React from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { Bubble, GiftedChat, IMessage } from "react-native-gifted-chat";
import { useLocalSearchParams } from "expo-router";
import useChatMessages from "@hooks/useChatMesseges";
import useSendMessage from "@hooks/useSendMessege";
import { auth } from "@services/firebaseConfig";

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
        maxComposerHeight={20}
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
});

export default ChatScreen;
