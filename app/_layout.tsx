import { useAuthState } from "@services/auth";
import { Stack } from "expo-router";
const RootLayout = () => {
  useAuthState();
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="(auth)"
        options={{
          title: "",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          title: "",
          headerTransparent: true,
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default RootLayout;
