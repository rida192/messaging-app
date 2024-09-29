import { Timestamp } from "firebase/firestore"; // Import Firestore Timestamp

declare interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  displayName: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: { seconds: number; nanoseconds: number };
}

// declare interface Friend {
//   createdAt: { seconds: number; nanoseconds: number }; // Assuming Firebase's Timestamp format
//   displayName: string;
//   email: string;
//   id: string;
//   photoURL: string;
//   username: string;
// }

// Type for lastMessage object
declare interface LastMessage {
  senderId: string;
  text: string;
  timestamp: Timestamp;
}

// Type for the main object
declare interface Friend {
  createdAt: Timestamp | Date; // Depending on how you retrieve it from Firestore, it could be a Timestamp or Date
  displayName: string;
  email: string;
  id: string;
  lastMessage: LastMessage;
  photoURL: string;
  username: string;
}

declare interface Message {
  id: string;
  text: string;
  timestamp: Timestamp | Date;
  senderId: string;
  displayName: string;
}
