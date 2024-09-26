import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, Image } from "react-native";
import {
  acceptFriendRequest,
  rejectFriendRequest,
  listenToFriendRequests,
  listenToFriends,
} from "@services/friendService";
import SearchFriends from "@components/searchFriends";

const FriendsTabScreen = () => {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    // Set up real-time listeners
    const unsubscribeFriendRequests = listenToFriendRequests((requests) => {
      // Only include pending requests
      const pendingRequests = requests.filter(
        (req) => req.status === "pending"
      );
      setFriendRequests(pendingRequests);
    });

    const unsubscribeFriends = listenToFriends((friendsList) => {
      setFriends(friendsList);
    });

    // Clean up listeners on component unmount
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

  return (
    <View>
      <SearchFriends />
      <Text>Friend Requests</Text>
      <FlatList
        data={friendRequests}
        renderItem={({ item }: { item: FriendRequest }) => (
          <View>
            <Text>{item.displayName}</Text>
            <Button
              title="Accept"
              onPress={() =>
                handleAcceptFriendRequest(
                  item.id,
                  item.fromUserId,
                  item.toUserId
                )
              }
            />
            <Button
              title="Reject"
              onPress={() => handleRejectFriendRequest(item.id)}
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      <Text>Friends</Text>
      <FlatList
        data={friends}
        renderItem={({ item }: { item: Friend }) => (
          <View>
            <Text>{item.displayName}</Text>
            {item.photoURL && (
              <Image
                source={{ uri: item.photoURL }}
                style={{ width: 50, height: 50 }}
              />
            )}
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default FriendsTabScreen;
