import { Redirect } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuthState } from "../services/auth";

const index = () => {
  useAuthState();
  // return <Redirect href="/(auth)/login" />;
  return (
    <View className="flex-1 justify-center items-center">
      <Text>
        <ActivityIndicator size="large" />
      </Text>
    </View>
  );
};

export default index;
