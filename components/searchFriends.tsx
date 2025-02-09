import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { searchUsers, sendFriendRequest } from "@services/friendService";
import { auth } from "../services/firebaseConfig";

export default function SearchFriends() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const results = await searchUsers(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFriendRequest = async (
    toUserId: string,
    toUserPhotoURL: string
  ) => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    try {
      await sendFriendRequest(
        currentUserId,
        toUserId,
        auth.currentUser?.displayName || "Unknown User",
        auth.currentUser?.photoURL || toUserPhotoURL
      );
      alert("Friend request sent!");
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Search by username"
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 10,
          paddingHorizontal: 10,
        }}
      />
      <Button title="Search" onPress={handleSearch} disabled={isLoading} />

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#ccc",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {item.photoURL && (
              <Image
                source={{ uri: item.photoURL }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: 10,
                }}
              />
            )}
            <Text style={{ flex: 1 }}>{item.username}</Text>
            <TouchableOpacity
              onPress={() => handleSendFriendRequest(item.id, item.photoURL)}
            >
              <Text style={{ color: "blue" }}>Send Friend Request</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
