// components/CustomTabBar.js
import React, { useEffect, useState } from "react";

import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter, useSegments } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const CustomTabBar = (props) => {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // const isTabBarVisible = segments[2] !== "[chatId]";

  useEffect(() => {
    setIsTabBarVisible(segments[2] !== "[chatId]");
  }, [segments]);

  // if (!isTabBarVisible) return null;

  const tabs = [
    {
      name: "chats",
      icon: (color) => <Entypo name="chat" size={24} color={color} />,
      label: "Chats",
    },
    {
      name: "profile",
      icon: (color) => <FontAwesome5 name="user-alt" size={24} color={color} />,
      label: "Profile",
    },
    {
      name: "friends",
      icon: (color) => <Ionicons name="people" size={30} color={color} />,
      label: "Friends",
    },
  ];

  const activeIndex = tabs.findIndex((tab) => segments[1] === tab.name);
  const circlePosition = useSharedValue(
    (width / tabs.length) * activeIndex + (width / tabs.length - 60) / 2
  );

  // Opacity animation for the tab bar
  const tabBarOpacity = useSharedValue(isTabBarVisible ? 1 : 0);

  useEffect(() => {
    // Animate opacity when visibility changes
    tabBarOpacity.value = withTiming(isTabBarVisible ? 1 : 0, {
      duration: 300,
    });
  }, [isTabBarVisible]);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: circlePosition.value }],
  }));

  const animatedTabBarStyle = useAnimatedStyle(() => ({
    opacity: tabBarOpacity.value,
  }));

  const handleTabPress = (index) => {
    circlePosition.value = withSpring(
      (width / tabs.length) * index + (width / tabs.length - 60) / 2,
      {
        damping: 15,
        stiffness: 220,
      }
    );
  };

  return (
    <Animated.View
      style={[
        styles.tabBar,
        { display: isTabBarVisible ? "flex" : "none" },
        animatedTabBarStyle,
      ]}
    >
      {/* Purple Circle */}
      <Animated.View style={[styles.circle, animatedCircleStyle]} />

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((tab, index) => {
          const isActive = segments[1] === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => {
                handleTabPress(index);
                if (isActive) return;
                router.push(`/(tabs)/${tab.name}` as any);
              }}
              style={styles.tabButton}
            >
              {tab.icon(isActive ? "white" : "#222")}
              <Text
                style={{
                  color: isActive ? "white" : "#222",
                  fontSize: 12,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "white",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 0, // Remove horizontal padding
    flex: 1,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    position: "absolute",
    top: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3d4a7a",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CustomTabBar;
