import { components } from '@schema';

// API Response Types
export type QnAMetaResp = components['schemas']['QnAMetaResp'];
export type QnAResp = components['schemas']['QnAResp'];
export type ChatResp = components['schemas']['ChatResp'];
export type UploadFileResp = components['schemas']['UploadFileResp'];
export type ChatCreateRequest = components['schemas']['ChatCreateRequest'];
export type QnASearchResp = components['schemas']['QnASearchResp'];
export type ChatSearchResultResp = components['schemas']['ChatSearchResultResp'];

// Chat Room Types
export type ChatRoomStatus = 'asking' | 'resolved';
export type ChatRoomType = 'publisher' | 'teacher';

export interface ChatRoom {
  id: number;
  type: ChatRoomType;
  title: string;
  lastMessage: string;
  lastMessageTime: string;
  status: ChatRoomStatus;
  hasNewMessage: boolean;
  thumbnailUrl?: string;
  teacherName?: string;
  publishId?: number;
  publishDate?: string;
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
  id: number;
  type: MessageType;
  sender: MessageSender;
  content: string;
  timestamp: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  reply?: ReplyContent;
  file?: FileContent;
  image?: ImageContent;
  files?: UploadFileResp[];
  replyToId?: number;
}

// Search Types
export interface SearchResult {
  chatRooms: ChatRoomSearchResult[];
  messages: MessageSearchResult[];
}

export interface ChatRoomSearchResult {
  id: number;
  title: string;
  thumbnailUrl?: string;
  status: ChatRoomStatus;
  date: string;
  matchedKeyword: string;
  type: ChatRoomType;
}

export interface MessageSearchResult {
  id: number;
  chatRoomId: number;
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

// =============================================================================
// API Response Mappers
// =============================================================================

/**
 * Format date-time string to display format
 */
const formatDateTime = (dateTime?: string): string => {
  if (!dateTime) return '';
  
  const date = new Date(dateTime);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

/**
 * Format time for message timestamp
 */
const formatTime = (dateTime?: string): string => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

/**
 * Format date for message date divider
 */
const formatDate = (dateTime?: string): string => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

/**
 * Get file extension from filename
 */
const getFileExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
};

/**
 * Map QnAResp (admin chat) to ChatRoom
 */
export const mapAdminChatToChatRoom = (resp: QnAResp): ChatRoom => ({
  id: resp.id,
  type: 'publisher',
  title: '포인터 출제진',
  lastMessage: resp.latestMessageContent ?? '',
  lastMessageTime: formatDateTime(resp.latestMessageTime),
  status: 'asking', // Admin chat doesn't have status
  hasNewMessage: (resp.unreadCount ?? 0) > 0,
  publishId: resp.publishId,
  publishDate: resp.publishDate,
});

/**
 * Map QnAMetaResp to ChatRoom
 */
export const mapQnAMetaToChatRoom = (meta: QnAMetaResp): ChatRoom => ({
  id: meta.id,
  type: 'teacher',
  title: meta.title,
  lastMessage: meta.latestMessageContent ?? '',
  lastMessageTime: formatDateTime(meta.latestMessageTime),
  status: 'asking', // TODO: API doesn't seem to have status field in meta
  hasNewMessage: (meta.unreadCount ?? 0) > 0,
  teacherName: meta.studentName, // In student view, this would be teacher name
  publishId: meta.publishId,
  publishDate: meta.publishDate,
});

/**
 * Map ChatResp to Message
 */
export const mapChatRespToMessage = (
  chat: ChatResp,
  allChats: ChatResp[],
): Message => {
  const hasFiles = chat.files && chat.files.length > 0;
  const hasReply = chat.replyToId !== undefined && chat.replyToId !== null;
  
  // Find the reply target
  const replyTarget = hasReply 
    ? allChats.find(c => c.id === chat.replyToId) 
    : undefined;
  
  // Determine message type
  let type: MessageType = 'text';
  if (hasReply && hasFiles) {
    type = 'reply-image';
  } else if (hasReply) {
    type = 'reply-text';
  } else if (hasFiles) {
    const firstFile = chat.files[0];
    if (firstFile?.fileType === 'IMAGE') {
      type = 'image';
    } else {
      type = 'file';
    }
  }

  // Build reply content if exists
  let reply: ReplyContent | undefined;
  if (replyTarget) {
    const replyHasFiles = replyTarget.files && replyTarget.files.length > 0;
    const replyFirstFile = replyHasFiles ? replyTarget.files[0] : undefined;
    
    reply = {
      type: replyFirstFile?.fileType === 'IMAGE' ? 'image' : 'text',
      title: replyTarget.isMine ? '내 메시지' : '상대방 메시지',
      content: replyTarget.content || (replyFirstFile ? '사진' : ''),
      imageUrl: replyFirstFile?.fileType === 'IMAGE' ? replyFirstFile.url : undefined,
    };
  }

  // Build file/image content
  let file: FileContent | undefined;
  let image: ImageContent | undefined;
  
  if (hasFiles && !hasReply) {
    const firstFile = chat.files[0];
    if (firstFile?.fileType === 'IMAGE') {
      image = {
        url: firstFile.url,
      };
    } else if (firstFile) {
      file = {
        name: firstFile.fileName,
        extension: getFileExtension(firstFile.fileName),
        url: firstFile.url,
      };
    }
  }

  // Check if message was edited (createdAt differs from updatedAt)
  const isEdited = chat.createdAt !== chat.updatedAt;

  return {
    id: chat.id,
    type,
    sender: chat.isMine ? 'me' : 'other',
    content: chat.content,
    timestamp: formatTime(chat.updatedAt),
    date: formatDate(chat.createdAt),
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    isEdited,
    reply,
    file,
    image,
    files: chat.files,
    replyToId: chat.replyToId,
  };
};

/**
 * Map QnAResp chats to Messages
 * Sort by createdAt for consistent ordering (oldest first)
 */
export const mapQnARespToMessages = (qna: QnAResp): Message[] => {
  if (!qna.chats || qna.chats.length === 0) return [];

  // 메시지를 createdAt 기준으로 정렬 (오래된 순 -> 최신 순)
  const sortedChats = [...qna.chats].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return sortedChats.map((chat) => mapChatRespToMessage(chat, sortedChats));
};

/**
 * Map search results to UI format
 */
export const mapSearchResults = (searchResp: QnASearchResp): SearchResult => {
  const chatRooms: ChatRoomSearchResult[] = [];
  const messages: MessageSearchResult[] = [];

  // Map QnA results (grouped by week)
  if (searchResp.qnaResults?.data?.groups) {
    searchResp.qnaResults.data.groups.forEach(group => {
      group.data?.forEach(qna => {
        chatRooms.push({
          id: qna.id,
          title: qna.title,
          status: 'asking',
          date: formatDateTime(qna.latestMessageTime),
          matchedKeyword: '',
          type: qna.type === 'ADMIN_CHAT' ? 'publisher' : 'teacher',
        });
      });
    });
  }

  // Map chat results
  if (searchResp.chatResults?.data) {
    searchResp.chatResults.data.forEach(chat => {
      messages.push({
        id: chat.chatId,
        chatRoomId: chat.qnaId,
        content: chat.chatContent,
        senderName: chat.isMine ? '나' : '상대방',
        senderType: chat.qnaType === 'ADMIN_CHAT' ? 'publisher' : 'teacher',
        status: 'asking',
        date: formatDateTime(chat.latestMessageTime),
        matchedKeyword: '',
      });
    });
  }

  return { chatRooms, messages };
};
