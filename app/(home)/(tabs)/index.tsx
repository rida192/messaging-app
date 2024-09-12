import { Button, Text, View } from "react-native";
import { logout } from "../../../services/auth";

const MainTabScreen = () => {
  return (
    <View>
      <Text>MainTabScreen</Text>
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
