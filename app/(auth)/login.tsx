// app/(auth)/Login.tsx

import React from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { login } from "@services/auth";
import { Link, router } from "expo-router";

interface LoginForm {
  identifier: string;
  password: string;
}

const Login: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.identifier, data.password);
      // Alert.alert("Success", "You are logged in!");
      router.replace("/(home)/(tabs)");
      // Navigate to Home or Dashboard screen here
    } catch (error) {
      Alert.alert(
        "Login Error",
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

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

      <Button
        title={isSubmitting ? "Logging in..." : "Login"}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      />
      <Text className="mt-5">
        Don't have an account? <Link href="/(auth)/signUp">signup</Link>{" "}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  errorText: { color: "red", marginBottom: 10 },
});

export default Login;
