import { Tabs } from "expo-router";
import CustomTabBar from "@components/customTabBar";

const TabsNavigator = () => {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      // screenOptions={{ headerShown: false }} // Hide header for all screens
    >
      <Tabs.Screen
        name="chats"
        options={{
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
        }}
      />
    </Tabs>
  );
};

export default TabsNavigator;
