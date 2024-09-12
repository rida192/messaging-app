import { useState, useEffect } from "react";
import { Text, View } from "react-native";
import { auth } from "../../../services/firebaseConfig";
import { User } from "firebase/auth";

const ProfileTabScreen = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get the current user from Firebase Auth
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  if (!user) {
    return <Text>Loading user data...</Text>;
  }

  console.log(user);
  return (
    <View>
      <Text>Email: {user.email}</Text>
      <Text>Display Name: {user.displayName || "No display name set"}</Text>
      <Text>Photo URL: {user.photoURL || "No photo available"}</Text>
    </View>
  );
};

export default ProfileTabScreen;
