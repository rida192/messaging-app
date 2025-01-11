import { Image, Text, TouchableOpacity, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { styled } from "nativewind";

import { User } from "firebase/auth";
const GradientBackground = styled(LinearGradient);

const Header = ({ user, title }: { user: User; title: string }) => {
  // console.log("user", user);
  return (
    <GradientBackground
      colors={["#0a0922", "#3c4a7a"]}
      start={{ x: 0.5, y: 0.25 }}
      end={{ x: 0.5, y: 1.0 }}
      locations={[0, 1]}
      className="pt-24 h-[250px]"
    >
      <View className="flex-row justify-between px-6 items-center">
        <View className="flex-1">
          <Text className="text-white"></Text>
        </View>
        <Text className="flex-1 text-white text-xl font-[Poppins] text-center ">
          {title}
        </Text>
        <View className="flex-1 ">
          <Image
            source={{ uri: user.photoURL }}
            className="w-12 h-12 rounded-full justify-end self-end"
            resizeMode="cover"
          />
        </View>
      </View>
    </GradientBackground>
  );
};

export default Header;
