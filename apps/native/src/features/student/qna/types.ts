// Chat Room Types
export type ChatRoomStatus = 'asking' | 'resolved';

export type ChatRoomType = 'publisher' | 'teacher';

export interface ChatRoom {
  id: string;
  type: ChatRoomType;
  title: string;
  lastMessage: string;
  lastMessageTime: string;
  status: ChatRoomStatus;
  hasNewMessage: boolean;
  thumbnailUrl?: string;
  teacherName?: string;
}

// Message Types
export type MessageType = 'text' | 'reply-text' | 'reply-image' | 'file' | 'image';

export type MessageSender = 'me' | 'other';

export interface ReplyContent {
  type: 'text' | 'image';
  title: string;
  content: string;
  imageUrl?: string;
}

export interface FileContent {
  name: string;
  extension: string;
  url: string;
}

export interface ImageContent {
  url: string;
  width?: number;
  height?: number;
}

export interface Message {
  id: string;
  type: MessageType;
  sender: MessageSender;
  content: string;
  timestamp: string;
  date: string;
  reply?: ReplyContent;
  file?: FileContent;
  image?: ImageContent;
}

// Comment Types (for 출제진 코멘트 모아보기)
export interface Comment {
  id: string;
  content: string;
  timestamp: string;
  date: string;
  problemTitle?: string;
}

// Search Types
export interface SearchResult {
  chatRooms: ChatRoomSearchResult[];
  messages: MessageSearchResult[];
}

export interface ChatRoomSearchResult {
  id: string;
  title: string;
  thumbnailUrl?: string;
  status: ChatRoomStatus;
  date: string;
  matchedKeyword: string;
}

export interface MessageSearchResult {
  id: string;
  chatRoomId: string;
  content: string;
  senderName: string;
  senderType: ChatRoomType;
  status: ChatRoomStatus;
  date: string;
  thumbnailUrl?: string;
  matchedKeyword: string;
}

// Filter Types
export type ChatRoomFilterType = 'all' | 'asking' | 'resolved';

