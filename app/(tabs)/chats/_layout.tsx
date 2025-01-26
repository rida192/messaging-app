import { Ionicons } from "@expo/vector-icons";
import { encodeProfilePicturesPath } from "@utils/index";
import { Stack, useGlobalSearchParams } from "expo-router";

import { TouchableOpacity, View, Text, Image } from "react-native";

const Layout = () => {
  const { displayName, photoURL } = useGlobalSearchParams(); // Extract parameters

  return (
    <Stack
      screenOptions={{ animation: "slide_from_right", animationDuration: 100 }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          // title: "Chats",
          // headerLargeTitle: true,
          // headerTransparent: true,
          // headerBlurEffect: "regular",
          // headerLeft: () => (
          //   <TouchableOpacity>
          //     <Ionicons name="ellipsis-horizontal-circle-outline" size={30} />
          //   </TouchableOpacity>
          // ),
          // headerStyle: {
          //   backgroundColor: "#fff",
          // },
          // headerSearchBarOptions: {
          //   placeholder: "Search",
          // },
        }}
      />

      <Stack.Screen
        name="[chatId]"
        options={{
          title: "",
          // headerBackTitleVisible: false,
          headerTitle: () => (
            <View
              style={{
                flexDirection: "row",
                width: 220,
                alignItems: "center",
                gap: 10,
                paddingBottom: 4,
              }}
            >
              <Image
                source={{
                  uri:
                    encodeProfilePicturesPath(photoURL) ||
                    "https://via.placeholder.com/150",
                }}
                style={{ width: 40, height: 40, borderRadius: 50 }}
              />
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                {displayName || "Unkonwn User"}
              </Text>
            </View>
          ),
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 30 }}>
              <TouchableOpacity>
                <Ionicons name="videocam-outline" size={30} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="call-outline" size={30} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
    </Stack>
  );
};
export default Layout;
