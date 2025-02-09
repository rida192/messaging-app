import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For icons
import {
  listenToFriendRequests,
  handleRejectFriendRequest,
  handleAcceptFriendRequest,
} from "@services/friendService";
import SearchFriends from "@components/searchFriends";
import { FriendRequest } from "../../types";
import { styled } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";

const GradientBackground = styled(LinearGradient);

const ConnectionsTabScreen = () => {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeFriendRequests = listenToFriendRequests((requests) => {
      const pendingRequests = requests.filter(
        (req) => req.status === "pending"
      );
      setFriendRequests(pendingRequests);
      setIsLoading(false);
    });

    // const unsubscribeFriends = listenToFriends((friendsList) => {
    //   setFriends(friendsList);
    //   setIsLoading(false);
    // });

    return () => {
      if (unsubscribeFriendRequests) unsubscribeFriendRequests();
      // if (unsubscribeFriends) unsubscribeFriends();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <GradientBackground
        colors={["#0a0922", "#3c4a7a"]}
        start={{ x: 0.5, y: 0.25 }}
        end={{ x: 0.5, y: 1.0 }}
        locations={[0, 1]}
        className="pt-24 h-[350px] items-center"
      >
        <Text className="flex-1 text-white text-xl font-[Poppins] text-center">
          Connections
        </Text>
      </GradientBackground>
      <View className="flex-1 bg-white rounded-t-[60px] mt-[-160px] px-6 py-10">
        <SearchFriends />
        <Text style={styles.sectionTitle}>Friend Requests</Text>
        {friendRequests.length === 0 ? (
          <Text style={styles.emptyStateText}>No pending friend requests.</Text>
        ) : (
          <FlatList
            data={friendRequests}
            renderItem={({ item }: { item: FriendRequest }) => (
              <View style={styles.requestItem}>
                <Image
                  source={{
                    uri:
                      item.fromUserPhotoURL || "https://via.placeholder.com/50",
                  }}
                  style={styles.avatar}
                />
                <Text style={styles.displayName}>
                  {item.fromUserDisplayName}
                </Text>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() =>
                    handleAcceptFriendRequest(
                      item.id,
                      item.fromUserId,
                      item.toUserId
                    )
                  }
                >
                  <Ionicons name="checkmark" size={24} color="green" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleRejectFriendRequest(item.id)}
                >
                  <Ionicons name="close" size={24} color="red" />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 16,
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  displayName: {
    fontSize: 16,
    flex: 1,
  },
  acceptButton: {
    marginLeft: 8,
  },
  rejectButton: {
    marginLeft: 8,
  },
});

export default ConnectionsTabScreen;
