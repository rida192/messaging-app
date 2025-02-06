import { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TextInput,
  Image,
  Button,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { auth, db } from "@services/firebaseConfig";
import { User, updateProfile } from "firebase/auth";
import { getStorage, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc } from "firebase/firestore";
import { logout } from "@services/auth";
import { styled } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";

const GradientBackground = styled(LinearGradient);

const ProfileTabScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const inputRef = useRef<TextInput>(null); // Reference to the input field for focusing

  useEffect(() => {
    // Get the current user from Firebase Auth
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser(currentUser);
      setDisplayName(currentUser.displayName || "");
      setPhotoURL(currentUser.photoURL || "");
    }
  }, [user]);

  const handleChangeProfilePicture = async () => {
    try {
      // Request permission to access media library
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Permission to access camera roll is required!");
        return;
      }

      // Let the user pick an image
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1, // You can specify the quality of the image (0-1)
      });

      if (!pickerResult.canceled) {
        // Upload the image to Firebase Storage
        const response = await fetch(pickerResult.assets[0].uri);
        const blob = await response.blob();

        const storage = getStorage(); // Get the storage instance
        const storageRef = ref(storage, `profilePictures/${user?.uid}`);

        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        // Update the user's profile
        if (user) {
          await updateProfile(user, { photoURL: downloadURL });
          setPhotoURL(downloadURL); // Assuming you have a state to update the photoURL in the component

          // Update the user's Firestore document
          await updateDoc(doc(db, "users", user.uid), {
            photoURL: downloadURL,
          });
        }
      }
    } catch (error) {
      console.error("Error changing profile picture:", error);
      alert("Failed to change profile picture. Please try again.");
    }
  };

  const handleChangeDisplayName = async () => {
    if (user) {
      // Update the user's profile
      await updateProfile(user, { displayName });
      // setDisplayName(displayName);

      // Manually update the user state
      setUser(auth.currentUser);

      // Update the user's Firestore document
      await updateDoc(doc(db, "users", user.uid), { displayName });
      // Unfocus the input field
      inputRef.current?.blur();
    }
  };

  if (!user) {
    return <Text>Loading user data...</Text>;
  }

  console.log(user);
  return (
    <View className="flex-1">
      <GradientBackground
        colors={["#0a0922", "#3c4a7a"]}
        start={{ x: 0.5, y: 0.25 }}
        end={{ x: 0.5, y: 1.0 }}
        locations={[0, 1]}
        className="pt-24 h-[350px] items-center"
      >
        <TouchableOpacity
          style={{ position: "absolute", top: 40, right: 20 }}
          onPress={async () => {
            await logout();
          }}
        >
          <MaterialCommunityIcons name="exit-to-app" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleChangeProfilePicture}>
          <Image
            source={{ uri: photoURL || undefined }}
            style={{ width: 100, height: 100 }}
            className="mt-[-20px] rounded-full"
          />
          <AntDesign
            name="edit"
            size={20}
            color="black"
            style={{
              position: "absolute",
              bottom: 10,
              right: -5,
              backgroundColor: "white",
              borderRadius: 50,
              padding: 3,
            }}
          />
        </TouchableOpacity>
        <Text className="text-white font-bold text-xl mt-2 ">
          {displayName || "No display name set"}
        </Text>
      </GradientBackground>

      <View className="flex-1 bg-white rounded-t-[60px] mt-[-60px] px-6 py-10">
        <Text className="text-[#797C7B] text-sm tracking-[0.5px] mb-[4px]">
          Display Name
        </Text>
        <View className="flex-row items-center">
          <TextInput
            placeholder="Display Name"
            className="text-lg font-[Poppins] flex-1
            "
            onBlur={handleChangeDisplayName}
            ref={inputRef}
            value={displayName}
            onChangeText={(text) => setDisplayName(text)}
          />
          <AntDesign
            name="right"
            size={24}
            color="black"
            // style={{ position: "absolute", right: 0 }}
          />
        </View>
        <Text className="text-[#797C7B] text-sm tracking-[0.5px] mt-[30px] mb-[10px]">
          Email Address
        </Text>
        <Text className="text-lg font-[Poppins] ">{user.email}</Text>
      </View>
    </View>
  );
};

export default ProfileTabScreen;
