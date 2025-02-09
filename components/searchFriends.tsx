import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useSearchUsers } from "../hooks/useSearchUsers";
import { useSendFriendRequest } from "../hooks/useSendFriendRequest";

export default function SearchFriends() {
  const [searchTerm, setSearchTerm] = useState("");
  const { searchResults, isLoading } = useSearchUsers(searchTerm);
  const handleSendFriendRequest = useSendFriendRequest();

  return (
    <View>
      <View className="flex-row items-center">
        <TextInput
          placeholder="Search by username"
          value={searchTerm}
          onChangeText={setSearchTerm}
          className="text-lg font-[Poppins] flex-1"
        />
        <AntDesign name="right" size={24} color="black" />
      </View>

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
