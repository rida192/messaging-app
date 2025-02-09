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
  acceptFriendRequest,
  rejectFriendRequest,
  listenToFriendRequests,
  listenToFriends,
} from "@services/friendService";
import SearchFriends from "@components/searchFriends";
import { Friend, FriendRequest } from "../../types";

const FriendsTabScreen = () => {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeFriendRequests = listenToFriendRequests((requests) => {
      const pendingRequests = requests.filter(
        (req) => req.status === "pending"
      );
      setFriendRequests(pendingRequests);
      setIsLoading(false);
    });

    const unsubscribeFriends = listenToFriends((friendsList) => {
      setFriends(friendsList);
      setIsLoading(false);
    });

    return () => {
      if (unsubscribeFriendRequests) unsubscribeFriendRequests();
      if (unsubscribeFriends) unsubscribeFriends();
    };
  }, []);

  const handleAcceptFriendRequest = async (requestId, fromUserId, toUserId) => {
    try {
      await acceptFriendRequest(requestId, fromUserId, toUserId);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleRejectFriendRequest = async (requestId) => {
    try {
      await rejectFriendRequest(requestId);
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
              <Text style={styles.displayName}>{item.fromUserDisplayName}</Text>
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

      <Text style={styles.sectionTitle}>Friends</Text>
      {friends.length === 0 ? (
        <Text style={styles.emptyStateText}>No friends yet.</Text>
      ) : (
        <FlatList
          data={friends}
          renderItem={({ item }: { item: Friend }) => (
            <View style={styles.friendItem}>
              <Image
                source={{
                  uri: item.photoURL || "https://via.placeholder.com/50",
                }}
                style={styles.avatar}
              />
              <Text style={styles.displayName}>{item.displayName}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      )}
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

export default FriendsTabScreen;
