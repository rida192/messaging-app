import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { register } from "@services/auth";
import { useRouter } from "expo-router";

import { LinearGradient } from "expo-linear-gradient";
import { styled } from "nativewind";

const GradientBackground = styled(LinearGradient);

interface SignUpForm {
  email: string;
  displayName: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const SignUp: React.FC = () => {
  const router = useRouter();
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
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Sign Up Error",
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  return (
    <View className="flex-1 justify-center p-5">
      <Text className="text-lg text-center text-[#3D4A7A] font-bold font-[Poppins]">
        Sign up with Email
      </Text>

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
            {isSubmitting ? "Signing up..." : "Create an account"}
          </Text>
        </TouchableOpacity>
      </GradientBackground>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default SignUp;
