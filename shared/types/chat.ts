export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type MessageType = "text" | "image" | "link_preview";

export interface ReplySnapshot {
  id: string;
  sender_id: string;
  sender_username?: string | null;
  message_type: MessageType;
  content: string | null;
  metadata?: Record<string, any> | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  message_type: MessageType;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface InboxItem {
  conversation_id: string;
  updated_at: string;
  other_user_id: string;
  other_username: string;
  other_full_name: string;
  other_avatar_url: string | null;
  last_message_content: string | null;
  last_message_type: MessageType;
  last_message_metadata?: Record<string, any> | null;
  last_message_at: string | null;
  last_message_sender_id: string | null;
  last_read_at: string;
  has_unread: boolean;
  unread_count?: number;
}
