// app/auth.ts
import { useEffect } from 'react';
import { auth } from '../services/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential,onAuthStateChanged  } from 'firebase/auth';
import { router } from 'expo-router';

// Function to register a new user
const register = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Function to log in a user
const login = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

// Function to log out the current user
const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Custom hook to monitor authentication state
export const useAuthState = () => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If a user is logged in, navigate to the Home screen
        router.push('/(home)/(tabs)')
      } else {
        // If no user is logged in, stay on the Login screen
        router.push('/login')
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);
};

export { register, login, logout };
