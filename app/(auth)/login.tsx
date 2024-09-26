// app/(auth)/Login.tsx

import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { login } from "@services/auth";
import { useRouter } from "expo-router";

import { LinearGradient } from "expo-linear-gradient";
import { styled } from "nativewind";

const GradientBackground = styled(LinearGradient);

interface LoginForm {
  identifier: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  useEffect(() => {
    reset({
      identifier: "",
      password: "",
    });
  }, []);

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.identifier, data.password);
      router.replace("/(tabs)/chats");
    } catch (error) {
      Alert.alert(
        "Login Error",
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text className="text-lg text-center text-[#3D4A7A] font-bold font-[Poppins]">
        Login
      </Text>

      <Controller
        control={control}
        name="identifier"
        rules={{ required: "Email is required" }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Email or Username"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="email-address"
          />
        )}
      />
      {errors.identifier && (
        <Text style={styles.errorText}>{errors.identifier.message}</Text>
      )}

      <Controller
        control={control}
        name="password"
        rules={{ required: "Password is required" }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry
          />
        )}
      />
      {errors.password && (
        <Text style={styles.errorText}>{errors.password.message}</Text>
      )}

      <GradientBackground
        colors={["#0a0922", "#3c4a7a"]}
        start={{ x: 0.0, y: 0.25 }}
        end={{ x: 1, y: 1.0 }}
        locations={[0.4, 1]}
        className="py-4 rounded-2xl mt-24 "
      >
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text className="text-white text-center text-base font-bold font-[Poppins]">
            {isSubmitting ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>
      </GradientBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomColor: "#3D4A7A",
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  errorText: { color: "red", marginBottom: 10 },
});

export default Login;
