import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { TouchableOpacity, View, Text, Image } from "react-native";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Chats",
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: "regular",
          headerLeft: () => (
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal-circle-outline" size={30} />
            </TouchableOpacity>
          ),

          headerStyle: {
            backgroundColor: "#fff",
          },
          headerSearchBarOptions: {
            placeholder: "Search",
          },
        }}
      />
    </Stack>
  );
};
export default Layout;
