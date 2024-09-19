import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList } from "react-native";
import {
  getFriendRequests,
  getFriends,
  acceptFriendRequest,
  rejectFriendRequest,
} from "@services/friendService";

const FriendsTabScreen = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    // Fetch friend requests and friends on component mount
    const fetchFriendData = async () => {
      try {
        const requests = await getFriendRequests();
        const friendsList = await getFriends();
        setFriendRequests(requests);
        setFriends(friendsList);
      } catch (error) {
        console.error("Error fetching friend data:", error);
      }
    };
    fetchFriendData();
  }, []);

  const handleAcceptFriendRequest = async (
    requestId,
    fromUserId,
    toUserId,
    displayName
  ) => {
    try {
      await acceptFriendRequest(requestId, fromUserId, toUserId);
      // Update UI
      setFriendRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId)
      );
      setFriends((prevFriends) => [
        ...prevFriends,
        { id: toUserId, displayName: displayName },
      ]);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleRejectFriendRequest = async (requestId) => {
    try {
      await rejectFriendRequest(requestId);
      // Update UI
      setFriendRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId)
      );
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  return (
    <View>
      <Text>Friend Requests</Text>
      <FlatList
        data={friendRequests}
        renderItem={({ item }) => (
          <View>
            <Text>{item.displayName}</Text>
            <Button
              title="Accept"
              onPress={() =>
                handleAcceptFriendRequest(
                  item.id,
                  item.fromUserId,
                  item.toUserId,
                  item.displayName
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
        renderItem={({ item }) => (
          <View>
            <Text>{item.displayName}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default FriendsTabScreen;
