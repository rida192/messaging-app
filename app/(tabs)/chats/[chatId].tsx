import React from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { Bubble, GiftedChat, IMessage } from "react-native-gifted-chat";
import { useLocalSearchParams } from "expo-router";
import useChatMessages from "@hooks/useChatMesseges";
import useSendMessage from "@hooks/useSendMessege";
import { auth } from "@services/firebaseConfig";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { encodeProfilePicturesPath } from "@utils/index";

const ChatScreen = () => {
  const { chatId, photoURL } = useLocalSearchParams();
  const user = auth.currentUser;

  // Current user's avatar
  const currentUserAvatar = user?.photoURL;

  // Other user's avatar
  const otherUserAvatar = encodeProfilePicturesPath(photoURL as string);

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

  // Custom avatar rendering
  const renderAvatar = (props) => {
    const { currentMessage } = props;
    return (
      <Image
        source={{ uri: currentMessage.user.avatar }} // Use the avatar URL
        style={styles.avatar}
      />
    );
  };

  return (
    <View style={styles.container}>
      <GiftedChat
        isStatusBarTranslucentAndroid
        messages={messages.map((message) => ({
          ...message,
          user: {
            ...message.user,
            avatar:
              message.user._id === user?.uid
                ? currentUserAvatar
                : otherUserAvatar, // Set avatar based on user ID
          },
        }))}
        onSend={(newMessages) => sendMessage(newMessages[0])}
        user={{
          _id: user?.uid || "",
          name: user?.displayName || "You",
          avatar: currentUserAvatar, // Current user's avatar
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
        renderAvatar={renderAvatar} // Add custom avatar rendering
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20, // Make the avatar circular
  },
});

export default ChatScreen;
