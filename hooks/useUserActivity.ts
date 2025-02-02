import { useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@services/firebaseConfig";

/**
 * Custom hook to manage user activity (e.g., active chat ID).
 */
export const useUserActivity = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Updates the active chat ID for a user.
   * @param userId - The ID of the user.
   * @param chatId - The ID of the active chat (or null if no chat is active).
   */
  const updateActiveChatId = async (userId: string, chatId: string | null) => {
    setIsLoading(true);
    setError(null);

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { activeChatId: chatId });
    } catch (err) {
      console.error("Error updating active chat ID:", err);
      setError("Failed to update active chat ID.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches the active chat ID for a user.
   * @param userId - The ID of the user.
   * @returns The active chat ID or null if no chat is active.
   */
  const getActiveChatId = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return userDoc.data().activeChatId || null;
      }

      return null;
    } catch (err) {
      console.error("Error fetching active chat ID:", err);
      setError("Failed to fetch active chat ID.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateActiveChatId, getActiveChatId, isLoading, error };
};
