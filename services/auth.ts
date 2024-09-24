// app/auth.ts
import { useEffect } from "react";
import { auth, db } from "../services/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  onAuthStateChanged,
} from "firebase/auth";
import { router } from "expo-router";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

// Function to check if a username already exists
const isUsernameUnique = async (username: string): Promise<boolean> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username));
  const querySnapshot = await getDocs(q);

  return querySnapshot.empty; // Returns true if no user with the given username exists
};

// Function to register a new user
const register = async (
  email: string,
  password: string,
  displayName: string,
  username: string
): Promise<UserCredential> => {
  if (!email || !password || !displayName || !username) {
    throw new Error("All fields are required");
  }
  try {
    const isUnique = await isUsernameUnique(username);

    if (!isUnique) {
      throw new Error("Username is already taken");
    }

    // Create the user with Firebase Auth

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      displayName,
      email: user.email,
      username,
      createdAt: new Date(),
    });

    return userCredential;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// Function to log in a user
const login = async (
  identifier: string,
  password: string
): Promise<UserCredential> => {
  try {
    let email = identifier;

    // Check if the identifier is an email
    const isEmail = identifier.includes("@");

    if (!isEmail) {
      // Assume identifier is a username, fetch the corresponding email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", identifier));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Username does not exist");
      }

      // Assuming username is unique, get the first matching document
      const userDoc = querySnapshot.docs[0];
      email = userDoc.data().email;
    }

    // Use the email to log in the user
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

// Function to log out the current user
const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

// Custom hook to monitor authentication state
export const useAuthState = () => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If a user is logged in, navigate to the Home screen
        router.push("/(home)/(tabs)");
      }
      //  else {
      //   // If no user is logged in, stay on the Login screen
      //   router.push("/login");
      // }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);
};

export { register, login, logout };
