import { useState, useEffect } from "react";
import { searchUsers } from "@services/friendService";

export const useSearchUsers = (searchTerm: string) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]); // Clear search results when searchTerm is empty
      return;
    }

    const handleSearch = async () => {
      setIsLoading(true);
      try {
        const results = await searchUsers(searchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    handleSearch();
  }, [searchTerm]);

  return { searchResults, isLoading };
};
