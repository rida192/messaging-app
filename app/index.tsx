import { Text, TouchableOpacity, Image } from "react-native";
import { useAuthState } from "../services/auth";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";

import { styled } from "nativewind";
import { Link } from "expo-router";

const GradientBackground = styled(LinearGradient);

const index = () => {
  useAuthState();

  const [fontsLoaded] = useFonts({
    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
  });

  if (!fontsLoaded) return null;
  // return <Redirect href="/(auth)/login" />;
  return (
    <GradientBackground
      colors={["#0a0922", "#3c4a7a"]}
      start={{ x: 0.0, y: 0.25 }}
      end={{ x: 1, y: 1.0 }}
      locations={[0.4, 1]}
      className="px-6 flex-1 "
    >
      <Image
        className="absolute top-10 left-0 w-[577.31px] h-[244.52px] opacity-70"
        source={require("../assets/images/ellipse.png")}
      />
      <Text className="text-7xl mt-[85px] mb-[39px] font-[Poppins] p-2 leading-[78px] text-white">
        Connect friends easily & quickly
      </Text>
      <Text className="text-base opacity-70 max-w-[330px] text-white">
        Our chat app is the perfect way to stay connected with friends and
        family.
      </Text>

      <TouchableOpacity className="mt-[128px] self-center bg-white/30 py-4 px-20 rounded-2xl  ">
        <Link href={"/(auth)/signUp"}>
          <Text className="text-white text-base">Sign up with e-mail</Text>
        </Link>
      </TouchableOpacity>
      <TouchableOpacity className="mt-[47px] self-center flex-row">
        <Link href={"/(auth)/login"}>
          <Text className="text-white ">Existing account? </Text>
          <Text className="text-white font-black ">Log in</Text>
        </Link>
      </TouchableOpacity>
    </GradientBackground>
  );
};

export default index;
