import { useState, useEffect } from "react";
import { Text, View, TextInput, Image, Button } from "react-native";
import { auth, db } from "@services/firebaseConfig";
import { User, updateProfile } from "firebase/auth";
import { getStorage, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@services/firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc } from "firebase/firestore";

const ProfileTabScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");

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
    }
  };

  if (!user) {
    return <Text>Loading user data...</Text>;
  }

  console.log(user);
  return (
    <View>
      <Text>Email: {user.email}</Text>
      <Text>Display Name: {displayName || "No display name set"}</Text>
      <Image
        source={{ uri: photoURL || undefined }}
        style={{ width: 100, height: 100 }}
      />
      <Button
        title="Change Profile Picture"
        onPress={handleChangeProfilePicture}
      />

      <TextInput
        placeholder="Display Name"
        value={displayName}
        onChangeText={(text) => setDisplayName(text)}
      />
      <Button title="Change Display Name" onPress={handleChangeDisplayName} />
    </View>
  );
};

export default ProfileTabScreen;
