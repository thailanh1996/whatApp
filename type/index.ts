import { Timestamp } from "firebase/firestore";

export interface Conversation {
  users: string[];
}

export interface AppUser {
  email: string;
  lastSeen: Timestamp;
  photoURL: string;
}

export interface Imessage {
  id: string;
  conversation_id: string;
  sent_at: string | null;
  user: string;
  text: string;
}
