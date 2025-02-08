// components/AnimatedSkeletonFriendLabel.tsx
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const SkeletonFriendLabel: React.FC = () => {
  const shimmerTranslateX = useSharedValue(-200); // Start the shimmer off-screen

  // Shimmer animation
  useEffect(() => {
    shimmerTranslateX.value = withRepeat(
      withTiming(200, { duration: 1000, easing: Easing.linear }),
      -1, // Infinite loop
      false // Do not reverse the animation
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslateX.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.avatar} />
      <View style={styles.textContainer}>
        <View style={styles.name} />
        <View style={styles.status} />
      </View>
      <View style={styles.date} />
      {/* Shimmer overlay */}
      <View style={styles.shimmerContainer}>
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    overflow: "hidden", // Ensure the shimmer doesn't overflow
    // backgroundColor: "#e1e1e1", // Background color for the skeleton
    position: "relative", // Required for absolute positioning of the shimmer
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#d1d1d1",
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  name: {
    width: "60%",
    height: 16,
    backgroundColor: "#d1d1d1",
    marginBottom: 5,
    borderRadius: 4,
  },
  status: {
    width: "40%",
    height: 14,
    backgroundColor: "#d1d1d1",
    borderRadius: 4,
  },
  date: {
    width: "13%",
    height: 14,
    backgroundColor: "#d1d1d1",
    borderRadius: 4,
  },
  shimmerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  shimmer: {
    width: "50%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    transform: [{ skewX: "-20deg" }],
  },
});

export default SkeletonFriendLabel;
