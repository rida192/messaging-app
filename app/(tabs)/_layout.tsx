import { Tabs } from "expo-router";

import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

import Ionicons from "@expo/vector-icons/Ionicons";
const TabsNavigator = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ size, color }) => (
            <FontAwesome5 name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ size, color }) => (
            <FontAwesome5 name="user-alt" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="people" size={30} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsNavigator;
