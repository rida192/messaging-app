// app/(auth)/SignUp.tsx

import React from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { register } from "@services/auth"; // Import the register function
import { Link, router } from "expo-router";

interface SignUpForm {
  email: string;
  displayName: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const SignUp: React.FC = () => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>();
  const password = watch("password");

  const onSubmit = async (data: SignUpForm) => {
    if (data.password !== data.confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    try {
      await register(
        data.email,
        data.password,
        data.displayName,
        data.username
      );
      // Alert.alert("Success", "Account created successfully!");
      router.replace("/(home)/(tabs)");
      // Navigate to Home or Login screen here
    } catch (error) {
      Alert.alert(
        "Sign Up Error",
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <Controller
        control={control}
        name="email"
        rules={{ required: "Email is required" }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Email"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="email-address"
          />
        )}
      />
      {errors.email && (
        <Text style={styles.errorText}>{errors.email.message}</Text>
      )}
      <Controller
        control={control}
        name="username"
        rules={{ required: "Username is required" }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Username"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="email-address"
          />
        )}
      />
      {errors.username && (
        <Text style={styles.errorText}>{errors.username.message}</Text>
      )}
      <Controller
        control={control}
        name="displayName"
        rules={{ required: "Display Name is required" }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Display Name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="email-address"
          />
        )}
      />
      {errors.displayName && (
        <Text style={styles.errorText}>{errors.displayName.message}</Text>
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

      <Controller
        control={control}
        name="confirmPassword"
        rules={{ required: "Please confirm your password" }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry
          />
        )}
      />
      {errors.confirmPassword && (
        <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
      )}

      <Button
        title={isSubmitting ? "Signing up..." : "Sign Up"}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      />

      <Text className="mt-5">
        Already have an account? <Link href="/(auth)/login">Login</Link>{" "}
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

export default SignUp;
