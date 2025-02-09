import { Timestamp } from "firebase/firestore"; // Import Firestore Timestamp

// export interface Friend {
//   createdAt: { seconds: number; nanoseconds: number }; // Assuming Firebase's Timestamp format
//   displayName: string;
//   email: string;
//   id: string;
//   photoURL: string;
//   username: string;
// }

// Type for lastMessage object
export interface LastMessage {
  senderId: string;
  text: string;
  timestamp: Timestamp;
}

// Type for the main object
export interface Friend {
  createdAt: Timestamp | Date; // Depending on how you retrieve it from Firestore, it could be a Timestamp or Date
  displayName: string;
  email: string;
  id: string;
  lastMessage: LastMessage;
  photoURL: string;
  username: string;
  lastMessageTimestamp?: Timestamp | Date;
}

// {"nanoseconds": 871000000, "seconds": 1738574978}

export interface Message {
  _id: string;
  text: string;
  timestamp: Timestamp | Date;
  senderId: string;
  displayName: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserDisplayName: string;
  fromUserPhotoURL: string; // Add this field
  status: "pending" | "accepted" | "rejected";
  timestamp: Date;
}

// export interface FriendRequest {
//   id: string;
//   fromUserId: string;
//   toUserId: string;
//   status: "pending" | "accepted" | "rejected";
//   displayName: string;
//   photoURL?: string;
//   timestamp: any;
// }

// export interface FriendRequest {
//   id: string;
//   fromUserId: string;
//   toUserId: string;
//   status: "pending" | "accepted" | "rejected";
//   displayName: string;
//   createdAt: { seconds: number; nanoseconds: number };
// }

// Main type for the object
