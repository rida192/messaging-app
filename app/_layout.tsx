import { useAuthState } from "@services/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";

const queryClient = new QueryClient();

const RootLayout = () => {
  useAuthState();
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
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
      </PaperProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;
