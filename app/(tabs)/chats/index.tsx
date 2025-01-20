// components/MainTabScreen.tsx
import { View, FlatList, Text } from "react-native";
import React from "react";
import { useFriends } from "@hooks/useFriends";
import { auth } from "@services/firebaseConfig";
import FriendLabel from "@components/friendLable";
import Header from "@components/header";
import { Friend } from "../../../types";

const MainTabScreen: React.FC = () => {
  const user = auth.currentUser;

  const { data: friends, isLoading, error } = useFriends(user.uid);

  if (isLoading)
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  if (error)
    return (
      <View>
        <Text>Error loading friends</Text>
      </View>
    );

  return (
    <View className="flex-1">
      <Header user={user} title="Home" />
      <View className="flex-1 bg-white rounded-t-[60px] mt-[-60px] px-6 py-10">
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: Friend }) => {
            return <FriendLabel item={item} />;
          }}
        />
      </View>
    </View>
  );
};

export default MainTabScreen;
