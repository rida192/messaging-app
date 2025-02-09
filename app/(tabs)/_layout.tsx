import { Tabs } from "expo-router";
import CustomTabBar from "@components/customTabBar";

const TabsNavigator = () => {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      // screenOptions={{
      //   tabBarStyle: {
      //     position: "absolute",
      //     bottom: 74,
      //     backgroundColor: "cyan",
      //     height: 30,
      //   },
      // }}
      screenOptions={{ headerShown: false }} // Hide header for all screens
    >
      <Tabs.Screen name="chats" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="connections" />
    </Tabs>
  );
};

export default TabsNavigator;
