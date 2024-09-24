declare interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  displayName: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: { seconds: number; nanoseconds: number };
}

declare interface Friend {
  createdAt: { seconds: number; nanoseconds: number }; // Assuming Firebase's Timestamp format
  displayName: string;
  email: string;
  id: string;
  photoURL: string;
  username: string;
}
