// app/firestore.ts
import { db } from '../services/firebaseConfig';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, DocumentData } from 'firebase/firestore';

interface Message {
  chatId: string;
  content: string;
  senderId: string;
  createdAt: Date;
  editedAt?: Date;
}

// Function to add a new message
const addMessage = async (message: Message): Promise<void> => {
  try {
    const messagesRef = collection(db, 'messages');
    await addDoc(messagesRef, { ...message, createdAt: new Date() });
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

// Function to fetch messages for a specific chat
const getMessages = async (chatId: string): Promise<DocumentData[]> => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('chatId', '==', chatId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Function to update a message
const updateMessage = async (messageId: string, newContent: string): Promise<void> => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, { content: newContent, editedAt: new Date() });
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
};

// Function to delete a message
const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await deleteDoc(messageRef);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

export { addMessage, getMessages, updateMessage, deleteMessage };
