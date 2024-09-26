import { Button, Text, View } from "react-native";
import { logout } from "@services/auth";

const MainTabScreen = () => {
  return (
    <View className="flex-1">
      <Text className="mt-72">MainTabScreen</Text>
      <Button
        title="logout"
        onPress={async () => {
          await logout();
        }}
      />
    </View>
  );
};

export default MainTabScreen;
