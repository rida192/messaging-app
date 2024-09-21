declare interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  displayName: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: { seconds: number; nanoseconds: number };
}
