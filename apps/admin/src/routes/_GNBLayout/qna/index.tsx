import { createFileRoute } from '@tanstack/react-router';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  getQna,
  getQnaById,
  postQnaChat,
  putQnaChat,
  deleteQnaChat,
  postUploadFile,
  putS3Upload,
  useSubscribeQna,
} from '@apis';
import { useInvalidate, useSelectedStudent } from '@hooks';
import { Header } from '@components';
import { components } from '@schema';
import { tokenStorage } from '@utils';
import { Slide, toast, ToastContainer } from 'react-toastify';
import {
  MessageCircle,
  Send,
  Reply,
  Image as ImageIcon,
  ImageOff,
  Paperclip,
  X,
  FileText,
  File,
  FileSpreadsheet,
  Download,
  Pencil,
  Trash2,
  User,
  Search,
} from 'lucide-react';

export const Route = createFileRoute('/_GNBLayout/qna/')({
  component: RouteComponent,
});

type ChatResp = components['schemas']['ChatResp'];
type UploadFileResp = components['schemas']['UploadFileResp'];
type QnAResp = components['schemas']['QnAResp'];
type QnAMetaResp = components['schemas']['QnAMetaResp'];

// Types
interface Message {
  id: number;
  type: 'text' | 'reply-text' | 'reply-image' | 'file' | 'image';
  sender: 'me' | 'other';
  content: string;
  timestamp: string;
  date: string;
  reply?: {
    type: 'text' | 'image';
    title: string;
    content: string;
    imageUrl?: string;
  };
  file?: {
    name: string;
    extension: string;
    url: string;
  };
  image?: {
    url: string;
  };
  files?: UploadFileResp[];
  replyToId?: number;
}

// Helpers
const formatTime = (dateTime?: string): string => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const formatDate = (dateTime?: string): string => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const getFileExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  const ext = parts.length > 1 ? parts[parts.length - 1] : undefined;
  return ext ? ext.toUpperCase() : 'FILE';
};

const getFileIcon = (extension: string) => {
  const ext = extension.toLowerCase();
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) return FileText;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet;
  return File;
};

// Map ChatResp to Message
const mapChatRespToMessage = (chat: ChatResp, allChats: ChatResp[], dateTime?: string): Message => {
  const chatFiles = chat.files ?? [];
  const hasFiles = chatFiles.length > 0;
  const hasReply = chat.replyToId !== undefined && chat.replyToId !== null;
  const replyTarget = hasReply ? allChats.find((c) => c.id === chat.replyToId) : undefined;

  let type: Message['type'] = 'text';
  if (hasReply && hasFiles) {
    type = 'reply-image';
  } else if (hasReply) {
    type = 'reply-text';
  } else if (hasFiles) {
    const firstFile = chatFiles[0];
    if (firstFile?.fileType === 'IMAGE') {
      type = 'image';
    } else {
      type = 'file';
    }
  }

  let reply: Message['reply'];
  if (replyTarget) {
    const replyFiles = replyTarget.files ?? [];
    const replyHasFiles = replyFiles.length > 0;
    const replyFirstFile = replyHasFiles ? replyFiles[0] : undefined;
    reply = {
      type: replyFirstFile?.fileType === 'IMAGE' ? 'image' : 'text',
      title: replyTarget.isMine ? '내 메시지' : '상대방 메시지',
      content: replyTarget.content || (replyFirstFile ? '사진' : ''),
      imageUrl: replyFirstFile?.fileType === 'IMAGE' ? replyFirstFile.url : undefined,
    };
  }

  let file: Message['file'];
  let image: Message['image'];

  if (hasFiles && !hasReply) {
    const firstFile = chatFiles[0];
    if (firstFile?.fileType === 'IMAGE') {
      image = { url: firstFile.url };
    } else if (firstFile) {
      file = {
        name: firstFile.fileName,
        extension: getFileExtension(firstFile.fileName),
        url: firstFile.url,
      };
    }
  }

  return {
    id: chat.id,
    type,
    sender: chat.isMine ? 'me' : 'other',
    content: chat.content,
    timestamp: formatTime(dateTime),
    date: formatDate(dateTime),
    reply,
    file,
    image,
    files: chat.files,
    replyToId: chat.replyToId,
  };
};

// Map QnAResp to Messages
const mapQnARespToMessages = (qna: QnAResp): Message[] => {
  if (!qna.chats || qna.chats.length === 0) return [];

  // 메시지를 ID 기준으로 정렬 (오래된 순 -> 최신 순)
  const sortedChats = [...qna.chats].sort((a, b) => a.id - b.id);

  return sortedChats.map((chat) => {
    return mapChatRespToMessage(chat, sortedChats, chat.createdAt);
  });
};

const DateDivider = ({ date }: { date: string }) => (
  <div className='flex items-center py-4'>
    <div className='h-px flex-1 bg-gray-300' />
    <span className='px-4 text-xs text-gray-500'>{date}</span>
    <div className='h-px flex-1 bg-gray-300' />
  </div>
);

// File Attachment Component
const FileAttachment = ({
  file,
  uploadFile,
}: {
  file?: Message['file'];
  uploadFile?: UploadFileResp;
  isMe?: boolean;
}) => {
  const fileName = file?.name ?? uploadFile?.fileName ?? 'Unknown File';
  const fileUrl = file?.url ?? uploadFile?.url ?? '';
  const extension = file?.extension ?? getFileExtension(fileName);

  if (!fileName || !fileUrl) return null;

  const FileIcon = getFileIcon(extension);

  const handleDownload = () => {
    window.open(fileUrl, '_blank');
  };

  return (
    <button
      type='button'
      onClick={handleDownload}
      className='flex min-w-[200px] items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:bg-gray-50'>
      <div className='flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50'>
        <FileIcon className='h-4 w-4 text-gray-400' />
      </div>
      <div className='flex-1 overflow-hidden text-left'>
        <p className='truncate text-sm font-medium text-gray-900'>{fileName}</p>
        <p className='text-xs text-gray-500'>{extension}</p>
      </div>
      <Download className='h-4 w-4 text-gray-400' />
    </button>
  );
};

// Single Image Component
const SingleImage = ({
  url,
  onPress,
  size = 'large',
}: {
  url: string;
  onPress?: () => void;
  size?: 'large' | 'medium' | 'small';
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeStyles = {
    large: 'h-[200px] w-[250px]',
    medium: 'h-[120px] w-[120px]',
    small: 'h-[80px] w-[80px]',
  };

  if (hasError) {
    const errorClasses = `${sizeStyles[size]} flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-100`;
    return (
      <div className={errorClasses}>
        <ImageOff className='mb-1 h-6 w-6 text-gray-400' />
        <span className='text-center text-xs text-gray-400'>이미지를 불러올 수 없습니다</span>
      </div>
    );
  }

  return (
    <button type='button' onClick={onPress} className='overflow-hidden rounded-lg'>
      <img
        src={url}
        className={`${sizeStyles[size]} rounded-lg bg-gray-200 object-cover`}
        alt=''
        onError={() => setHasError(true)}
      />
    </button>
  );
};

// Images Grid Component
const ImagesGrid = ({
  images,
  onPressImage,
}: {
  images: UploadFileResp[];
  onPressImage?: (url: string) => void;
}) => {
  const count = images.length;
  const firstImage = images[0];

  if (count === 1 && firstImage) {
    return (
      <SingleImage
        url={firstImage.url}
        onPress={() => onPressImage?.(firstImage.url)}
        size='large'
      />
    );
  }

  if (count === 2) {
    return (
      <div className='flex gap-1'>
        {images.map((img, index) => (
          <SingleImage
            key={img.id ?? index}
            url={img.url}
            onPress={() => onPressImage?.(img.url)}
            size='medium'
          />
        ))}
      </div>
    );
  }

  const rows: Array<Array<{ img: UploadFileResp; index: number }>> = [];
  for (let i = 0; i < images.length; i += 2) {
    const row: Array<{ img: UploadFileResp; index: number }> = [];
    const currentImg = images[i];
    const nextImg = images[i + 1];
    if (currentImg) {
      row.push({ img: currentImg, index: i });
    }
    if (nextImg) {
      row.push({ img: nextImg, index: i + 1 });
    }
    if (row.length > 0) {
      rows.push(row);
    }
  }

  return (
    <div className='flex flex-col gap-1'>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className='flex gap-1'>
          {row.map(({ img, index }) => (
            <SingleImage
              key={img.id ?? index}
              url={img.url}
              onPress={() => onPressImage?.(img.url)}
              size='medium'
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Image Message Component
const ImageMessage = ({
  image,
  files,
  isMe,
  onPressImage,
}: {
  image?: Message['image'];
  files?: Message['files'];
  isMe: boolean;
  onPressImage?: (url: string) => void;
}) => {
  if (files && files.length > 0) {
    const imageFiles = files.filter((f) => f.fileType === 'IMAGE');
    const otherFiles = files.filter((f) => f.fileType !== 'IMAGE');

    return (
      <div className='flex flex-col gap-2'>
        {imageFiles.length > 0 && <ImagesGrid images={imageFiles} onPressImage={onPressImage} />}
        {otherFiles.map((file) => (
          <FileAttachment key={file.id} uploadFile={file} isMe={isMe} />
        ))}
      </div>
    );
  }

  if (image) {
    return <SingleImage url={image.url} onPress={() => onPressImage?.(image.url)} size='large' />;
  }

  return null;
};

// Reply Preview Component
const ReplyPreview = ({ reply }: { reply: Message['reply']; isMe: boolean }) => {
  if (!reply) return null;

  return (
    <div className='mb-2 border-b border-gray-400 pb-2'>
      <p className='text-xs font-medium text-gray-700'>{reply.title}</p>
      {reply.type === 'image' && reply.imageUrl ? (
        <div className='mt-1 flex items-center gap-1.5'>
          <ImageIcon className='h-3.5 w-3.5 text-gray-500' />
          <span className='text-xs text-gray-500'>사진</span>
        </div>
      ) : (
        <p className='mt-1 line-clamp-2 text-xs text-gray-500'>{reply.content}</p>
      )}
    </div>
  );
};

// Profile Image Component
const ProfileImage = ({ imageUrl }: { imageUrl?: string }) => {
  const [hasError, setHasError] = useState(false);

  if (!imageUrl || hasError) {
    return (
      <div className='flex h-9 w-9 items-center justify-center rounded-full bg-gray-300'>
        <User className='h-5 w-5 text-gray-600' />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      className='h-9 w-9 rounded-full bg-gray-300'
      alt=''
      onError={() => setHasError(true)}
    />
  );
};

// Message Bubble Component
const MessageBubble = ({
  message,
  senderName,
  profileImageUrl,
  showProfile = false,
  onReply,
  onEdit,
  onDelete,
  onPressImage,
}: {
  message: Message;
  senderName?: string;
  profileImageUrl?: string;
  showProfile?: boolean;
  showTail?: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onPressImage?: (url: string) => void;
}) => {
  const { type, sender, content, timestamp, reply, file, image, files } = message;
  const isMe = sender === 'me';
  const [isHovered, setIsHovered] = useState(false);

  const needsBubbleBackground =
    type === 'text' || type === 'reply-text' || type === 'reply-image' || type === 'file';

  const renderContent = () => {
    switch (type) {
      case 'file':
        return <FileAttachment file={file} uploadFile={files?.[0]} isMe={isMe} />;
      case 'image':
        return <ImageMessage image={image} files={files} isMe={isMe} onPressImage={onPressImage} />;
      case 'reply-text':
      case 'reply-image':
        return (
          <div>
            <ReplyPreview reply={reply} isMe={isMe} />
            {files && files.length > 0 && (
              <div className='mb-2'>
                <ImageMessage files={files} isMe={isMe} onPressImage={onPressImage} />
              </div>
            )}
            {content && <p className='text-sm text-gray-900'>{content}</p>}
          </div>
        );
      case 'text':
      default:
        return <p className='text-sm break-all text-gray-900'>{content}</p>;
    }
  };

  return (
    <div
      className={`group relative flex px-4 py-1 ${isMe ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {/* Reply Button - Left side for my messages */}
      {isMe && isHovered && (
        <div className='mr-2 flex items-center gap-1'>
          <button
            type='button'
            onClick={() => onReply?.(message)}
            className='flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-300'>
            <Reply className='h-3.5 w-3.5 text-gray-600' />
          </button>
          <button
            type='button'
            onClick={() => onEdit?.(message)}
            className='flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-300'>
            <Pencil className='h-3.5 w-3.5 text-gray-600' />
          </button>
          <button
            type='button'
            onClick={() => onDelete?.(message)}
            className='flex h-7 w-7 items-center justify-center rounded-full bg-red-100 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-200'>
            <Trash2 className='h-3.5 w-3.5 text-red-600' />
          </button>
        </div>
      )}

      {/* Timestamp - Left side for my messages */}
      {isMe && <span className='mr-2 self-end text-xs text-gray-400'>{timestamp}</span>}

      {/* Profile Image for other's messages */}
      {!isMe && (
        <div className='mr-2 w-9 flex-shrink-0'>
          {showProfile && <ProfileImage imageUrl={profileImageUrl} />}
        </div>
      )}

      {/* Message Content */}
      <div className={`max-w-[60%] ${!isMe ? 'flex flex-col' : ''}`}>
        {!isMe && showProfile && senderName && (
          <p className='mb-1 text-xs font-medium text-gray-600'>{senderName}</p>
        )}
        <div
          className={`inline-block ${
            needsBubbleBackground
              ? `rounded-2xl px-3 py-2 ${isMe ? 'bg-blue-100' : 'bg-white'}`
              : ''
          }`}>
          {renderContent()}
        </div>
      </div>

      {/* Timestamp - Right side for other's messages */}
      {!isMe && <span className='ml-2 self-end text-xs text-gray-400'>{timestamp}</span>}

      {/* Reply Button - Right side for other's messages */}
      {!isMe && isHovered && (
        <div className='ml-2 flex items-center'>
          <button
            type='button'
            onClick={() => onReply?.(message)}
            className='flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-300'>
            <Reply className='h-3.5 w-3.5 text-gray-600' />
          </button>
        </div>
      )}
    </div>
  );
};

// Message Input Component
const MessageInput = ({
  replyTo,
  editingMessage,
  senderName,
  onClearReply,
  onCancelEdit,
  onSend,
  onImageSelected,
  onFileSelected,
  disabled,
}: {
  replyTo?: Message | null;
  editingMessage?: Message | null;
  senderName?: string;
  onClearReply?: () => void;
  onCancelEdit?: () => void;
  onSend: (text: string, replyTo?: Message) => void;
  onImageSelected?: (file: File) => void;
  onFileSelected?: (file: File) => void;
  disabled?: boolean;
}) => {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isComposingRef = useRef(false);

  const wasSendingRef = useRef(false);

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content);
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  // disabled가 풀리면 포커스 복원 (전송 완료 후)
  useEffect(() => {
    if (disabled) {
      wasSendingRef.current = true;
    } else if (wasSendingRef.current) {
      wasSendingRef.current = false;
      textareaRef.current?.focus();
    }
  }, [disabled]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim(), replyTo ?? undefined);
    setText('');
    onClearReply?.();
    onCancelEdit?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // IME 조합 중에는 Enter 무시 (한국어/일본어/중국어 이중 입력 방지)
    if (e.nativeEvent.isComposing || isComposingRef.current) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected?.(file);
    }
    e.target.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected?.(file);
    }
    e.target.value = '';
  };

  const canSend = text.trim().length > 0 && !disabled;
  const isEditing = !!editingMessage;

  return (
    <div className='border-t border-gray-200 bg-white p-4'>
      {/* Editing Indicator */}
      {isEditing && (
        <div className='mb-3 flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2'>
          <div className='flex items-center gap-2'>
            <Pencil className='h-4 w-4 text-blue-600' />
            <span className='text-sm font-medium text-blue-600'>메시지 수정 중</span>
          </div>
          <button type='button' onClick={onCancelEdit} className='rounded p-1 hover:bg-blue-100'>
            <X className='h-4 w-4 text-gray-600' />
          </button>
        </div>
      )}

      {/* Reply Preview */}
      {replyTo && !isEditing && (
        <div className='mb-3 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2'>
          <div className='flex items-center gap-2'>
            <Reply className='h-4 w-4 text-gray-500' />
            <div className='overflow-hidden'>
              <p className='text-xs font-medium text-gray-700'>
                {replyTo.sender === 'me' ? '내 메시지' : (senderName ?? '상대방')}에게 답장
              </p>
              <p className='truncate text-xs text-gray-500'>{replyTo.content || '사진'}</p>
            </div>
          </div>
          <button type='button' onClick={onClearReply} className='rounded p-1 hover:bg-gray-200'>
            <X className='h-4 w-4 text-gray-600' />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className='flex items-center gap-2'>
        {/* Attachment Buttons */}
        <div className='flex items-center gap-1'>
          <input
            ref={imageInputRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleImageSelect}
          />
          <button
            type='button'
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled}
            className='flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-100 disabled:opacity-50'>
            <ImageIcon className='h-5 w-5' />
          </button>

          <input ref={fileInputRef} type='file' className='hidden' onChange={handleFileSelect} />
          <button
            type='button'
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className='flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-100 disabled:opacity-50'>
            <Paperclip className='h-5 w-5' />
          </button>
        </div>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onCompositionEnd={() => {
            isComposingRef.current = false;
          }}
          placeholder='메시지를 입력하세요...'
          disabled={disabled}
          rows={1}
          className='flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-sm transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:opacity-50'
          style={{ maxHeight: '120px' }}
        />

        {/* Send Button */}
        <button
          type='button'
          onClick={handleSend}
          disabled={!canSend}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
            canSend ? 'bg-main hover:bg-main/90 text-white' : 'bg-gray-200 text-gray-400'
          }`}>
          <Send className='h-4 w-4' />
        </button>
      </div>
    </div>
  );
};

// Format relative time for chat list
const formatRelativeTime = (dateTime?: string): string => {
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
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
};

// Chat List Sidebar Component
const ChatList = ({
  qnaItems,
  selectedQnaId,
  onSelect,
  isLoading,
  searchQuery,
  onSearchChange,
}: {
  qnaItems: QnAMetaResp[];
  selectedQnaId: number | null;
  onSelect: (qna: QnAMetaResp) => void;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) => {
  return (
    <div className='flex h-full flex-col border-r border-gray-200 bg-white'>
      {/* Search */}
      <div className='border-b border-gray-200 p-3'>
        <div className='flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2'>
          <Search className='h-4 w-4 text-gray-400' />
          <input
            type='text'
            placeholder='검색...'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className='flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none'
          />
          {searchQuery && (
            <button type='button' onClick={() => onSearchChange('')}>
              <X className='h-3.5 w-3.5 text-gray-400 hover:text-gray-600' />
            </button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className='flex-1 overflow-y-auto'>
        {isLoading ? (
          <div className='flex h-32 items-center justify-center'>
            <div className='text-sm text-gray-400'>로딩 중...</div>
          </div>
        ) : qnaItems.length === 0 ? (
          <div className='flex h-32 flex-col items-center justify-center'>
            <MessageCircle className='mb-2 h-8 w-8 text-gray-300' />
            <p className='text-sm text-gray-400'>
              {searchQuery ? '검색 결과가 없습니다' : '대화가 없습니다'}
            </p>
          </div>
        ) : (
          qnaItems.map((item) => (
            <button
              key={item.id}
              type='button'
              onClick={() => onSelect(item)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                selectedQnaId === item.id
                  ? 'bg-main/10 border-r-main border-r-2'
                  : 'hover:bg-gray-50'
              }`}>
              {/* Avatar */}
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                  selectedQnaId === item.id ? 'bg-main' : 'bg-gray-200'
                }`}>
                <User
                  className={`h-5 w-5 ${
                    selectedQnaId === item.id ? 'text-white' : 'text-gray-500'
                  }`}
                />
              </div>

              {/* Content */}
              <div className='min-w-0 flex-1'>
                <div className='flex items-center justify-between'>
                  <span className='truncate text-sm font-semibold text-gray-900'>
                    {item.studentName ?? '알 수 없음'}
                  </span>
                  <span className='ml-2 flex-shrink-0 text-xs text-gray-400'>
                    {formatRelativeTime(item.latestMessageTime)}
                  </span>
                </div>
                <div className='mt-0.5 flex items-center justify-between'>
                  <p className='truncate text-xs text-gray-500'>
                    {item.latestMessageContent || '메시지 없음'}
                  </p>
                  {(item.unreadCount ?? 0) > 0 && (
                    <span className='bg-main ml-2 flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-medium text-white'>
                      {item.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

// Main Component
function RouteComponent() {
  const { selectedStudent } = useSelectedStudent();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [localSelectedQnaId, setLocalSelectedQnaId] = useState<number | null>(null);
  const [localSelectedStudentName, setLocalSelectedStudentName] = useState<string | null>(null);
  const [initializedFromGlobal, setInitializedFromGlobal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { invalidateQna } = useInvalidate();

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch QnA rooms with debounced search query
  const { data: qnaListData, isLoading: isLoadingList } = getQna({
    query: debouncedQuery || undefined,
  });

  // Flatten all QnA items from groups, sorted by latest message time
  const allQnaItems = useMemo(() => {
    if (!qnaListData?.data?.groups) return [];
    const items: QnAMetaResp[] = [];
    for (const group of qnaListData.data.groups) {
      if (group.data) {
        items.push(...group.data);
      }
    }
    // Sort by latest message time (most recent first)
    return items.sort((a, b) => {
      const timeA = a.latestMessageTime ? new Date(a.latestMessageTime).getTime() : 0;
      const timeB = b.latestMessageTime ? new Date(b.latestMessageTime).getTime() : 0;
      return timeB - timeA;
    });
  }, [qnaListData]);

  // Initialize local selection from global selectedStudent (once)
  useEffect(() => {
    if (initializedFromGlobal || allQnaItems.length === 0) return;

    if (selectedStudent) {
      const matchingQna = allQnaItems.find((q) => q.studentName === selectedStudent.name);
      if (matchingQna) {
        setLocalSelectedQnaId(matchingQna.id);
        setLocalSelectedStudentName(matchingQna.studentName ?? null);
      }
    }
    setInitializedFromGlobal(true);
  }, [allQnaItems, selectedStudent, initializedFromGlobal]);

  const handleSelectQna = useCallback((qna: QnAMetaResp) => {
    setLocalSelectedQnaId(qna.id);
    setLocalSelectedStudentName(qna.studentName ?? null);
    setReplyTo(null);
    setEditingMessage(null);
  }, []);

  const selectedQnaId = localSelectedQnaId;

  // Fetch selected QnA data
  const { data: qnaData, isLoading: isLoadingQna } = getQnaById({
    qnaId: selectedQnaId ?? 0,
    enabled: !!selectedQnaId,
  });

  // Mutations
  const { mutate: sendChat, isPending: isSending } = postQnaChat();
  const { mutate: updateChat, isPending: isUpdating } = putQnaChat();
  const { mutate: removeChat, isPending: isDeleting } = deleteQnaChat();
  const { mutate: uploadFile } = postUploadFile();

  // Get access token for SSE connection
  const accessToken = tokenStorage.getToken();

  // Debounced invalidation for SSE events
  // Merges chat (list+detail) and read_status (list only) within debounce window,
  // keeping the broadest scope to avoid dropping detail invalidation.
  const invalidateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingQnaIdRef = useRef<number | undefined>(undefined);
  const debouncedInvalidateQna = useCallback(
    (qnaId?: number) => {
      // chat 이벤트가 qnaId를 설정하면, 같은 윈도우 내 read_status가 이를 덮어쓰지 않음
      if (qnaId) pendingQnaIdRef.current = qnaId;
      if (invalidateTimeoutRef.current) {
        clearTimeout(invalidateTimeoutRef.current);
      }
      invalidateTimeoutRef.current = setTimeout(() => {
        invalidateQna(pendingQnaIdRef.current);
        pendingQnaIdRef.current = undefined;
        invalidateTimeoutRef.current = null;
      }, 300);
    },
    [invalidateQna]
  );

  // 언마운트 시 debounce 타이머 정리
  useEffect(() => {
    return () => {
      if (invalidateTimeoutRef.current) {
        clearTimeout(invalidateTimeoutRef.current);
      }
    };
  }, []);

  // Subscribe to SSE for real-time updates
  useSubscribeQna({
    qnaId: selectedQnaId ?? 0,
    token: accessToken ?? '',
    enabled: !!selectedQnaId && !!accessToken,
    onChatEvent: useCallback(() => {
      console.log('[QnA] Chat event received');
      debouncedInvalidateQna(selectedQnaId ?? undefined);
    }, [debouncedInvalidateQna, selectedQnaId]),
    onReadStatusEvent: useCallback(() => {
      console.log('[QnA] Read status event received');
      // list만 invalidate (qnaId 미전달) — detail refetch가 read_status를 다시 유발하는 무한 루프 방지
      debouncedInvalidateQna();
    }, [debouncedInvalidateQna]),
    onOpen: useCallback(() => {
      // 재연결 시 백그라운드 동안 놓친 메시지 catch-up
      invalidateQna(selectedQnaId ?? undefined);
    }, [invalidateQna, selectedQnaId]),
    onError: useCallback((error: Error) => {
      console.error('[QnA] SSE error:', error);
    }, []),
  });

  // Map API data to messages
  const messages = useMemo<Message[]>(() => {
    if (!qnaData) return [];
    return mapQnARespToMessages(qnaData);
  }, [qnaData]);

  // Group messages with date dividers
  const groupedMessages = useMemo(() => {
    const groups: Array<{
      type: 'date' | 'message';
      date?: string;
      message?: Message;
      showProfile?: boolean;
      showTail?: boolean;
    }> = [];
    let currentDate = '';

    messages.forEach((message, index) => {
      if (message.date && message.date !== currentDate) {
        currentDate = message.date;
        groups.push({ type: 'date', date: currentDate });
      }

      const previousMessage = index > 0 ? messages[index - 1] : null;
      const dateChanged = previousMessage && previousMessage.date !== message.date;
      const senderChanged = previousMessage && previousMessage.sender !== message.sender;
      const showTail = index === 0 || senderChanged || dateChanged || !previousMessage;
      const isOther = message.sender === 'other';
      const showProfile = isOther && showTail;

      groups.push({ type: 'message', message, showProfile, showTail });
    });

    return groups;
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleReply = useCallback((message: Message) => {
    setReplyTo(message);
    setEditingMessage(null);
  }, []);

  const handleClearReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const handleEdit = useCallback((message: Message) => {
    if (message.type === 'text' || message.type === 'reply-text') {
      setEditingMessage(message);
      setReplyTo(null);
    } else {
      toast.warning('텍스트 메시지만 수정할 수 있습니다.');
    }
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
  }, []);

  const handleDelete = useCallback(
    (message: Message) => {
      if (window.confirm('이 메시지를 삭제하시겠습니까?')) {
        removeChat(
          {
            params: {
              path: { chatId: message.id },
            },
          },
          {
            onSuccess: () => {
              toast.success('메시지가 삭제되었습니다.');
              invalidateQna(selectedQnaId ?? undefined);
            },
            onError: () => {
              toast.error('메시지 삭제에 실패했습니다.');
            },
          }
        );
      }
    },
    [removeChat, invalidateQna, selectedQnaId]
  );

  const handleSend = useCallback(
    (text: string, reply?: Message) => {
      if (!selectedQnaId) return;

      if (editingMessage) {
        updateChat(
          {
            params: {
              path: { chatId: editingMessage.id },
            },
            body: { content: text },
          },
          {
            onSuccess: () => {
              toast.success('메시지가 수정되었습니다.');
              setEditingMessage(null);
              invalidateQna(selectedQnaId ?? undefined);
            },
            onError: () => {
              toast.error('메시지 수정에 실패했습니다.');
            },
          }
        );
      } else {
        sendChat(
          {
            body: {
              qnaId: selectedQnaId,
              content: text,
              replyToId: reply?.id,
            },
          },
          {
            onSuccess: () => {
              invalidateQna(selectedQnaId ?? undefined);
            },
            onError: () => {
              toast.error('메시지 전송에 실패했습니다.');
            },
          }
        );
      }
    },
    [selectedQnaId, editingMessage, sendChat, updateChat, invalidateQna]
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!selectedQnaId) return;

      const fileName = file.name;
      const fileType = file.type.startsWith('image/') ? 'IMAGE' : 'OTHER';

      uploadFile(
        {
          body: {
            fileName,
            fileType,
          },
        },
        {
          onSuccess: async (uploadResp) => {
            if (!uploadResp?.uploadUrl || !uploadResp?.file?.id) return;

            try {
              // S3에 파일 업로드 (content-disposition 헤더 포함)
              const response = await putS3Upload({
                url: uploadResp.uploadUrl,
                file,
                contentDisposition: uploadResp.contentDisposition,
              });

              if (!response.ok) {
                toast.error('파일 업로드에 실패했습니다.');
                return;
              }

              // 채팅 메시지 전송
              sendChat(
                {
                  body: {
                    qnaId: selectedQnaId,
                    content: '',
                    files: [uploadResp.file.id],
                    replyToId: replyTo?.id,
                  },
                },
                {
                  onSuccess: () => {
                    setReplyTo(null);
                    invalidateQna(selectedQnaId ?? undefined);
                  },
                  onError: () => {
                    toast.error('메시지 전송에 실패했습니다.');
                  },
                }
              );
            } catch {
              toast.error('파일 업로드에 실패했습니다.');
            }
          },
          onError: () => {
            toast.error('파일 업로드에 실패했습니다.');
          },
        }
      );
    },
    [selectedQnaId, replyTo, uploadFile, sendChat, invalidateQna]
  );

  const handlePressImage = useCallback((url: string) => {
    window.open(url, '_blank');
  }, []);

  const isPending = isSending || isUpdating || isDeleting;
  const isLoading = isLoadingList || isLoadingQna;

  const currentStudentName = localSelectedStudentName ?? selectedStudent?.name;

  return (
    <div className='flex h-screen flex-col bg-gray-50'>
      <ToastContainer
        position='top-center'
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        draggable
        pauseOnHover
        theme='dark'
        transition={Slide}
        style={{
          fontSize: '1.6rem',
        }}
      />

      {/* Header */}
      <Header title='Q&A'>
        <></>
      </Header>

      <div className='mx-auto w-full max-w-7xl flex-1 overflow-hidden px-8 py-8'>
        <div className='flex h-[calc(100dvh-12rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white'>
          {/* Chat List Sidebar */}
          <div className='w-80 min-w-64 flex-shrink-0 lg:w-[30%] lg:max-w-96'>
            <ChatList
              qnaItems={allQnaItems}
              selectedQnaId={selectedQnaId}
              onSelect={handleSelectQna}
              isLoading={isLoadingList}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Chat Area */}
          <div className='flex flex-1 flex-col overflow-hidden'>
            {/* Chat Header */}
            {selectedQnaId && currentStudentName && (
              <div className='flex items-center justify-between border-b border-gray-200 px-4 py-4'>
                <div className='flex items-center gap-3'>
                  <h3 className='text-lg font-bold text-gray-900'>{currentStudentName}</h3>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className='flex-1 overflow-y-auto bg-gray-100 py-4'>
              {!selectedQnaId ? (
                <div className='flex h-full flex-col items-center justify-center'>
                  <MessageCircle className='mb-4 h-12 w-12 text-gray-300' />
                  <p className='text-sm font-medium text-gray-400'>대화를 선택해주세요</p>
                  <p className='text-sm text-gray-400'>
                    좌측 목록에서 학생을 선택하면 대화가 표시됩니다
                  </p>
                </div>
              ) : isLoading ? (
                <div className='flex h-full items-center justify-center'>
                  <div className='text-sm text-gray-500'>로딩 중...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className='flex h-full flex-col items-center justify-center'>
                  <MessageCircle className='mb-4 h-12 w-12 text-gray-300' />
                  <p className='text-sm font-medium text-gray-400'>아직 대화가 없습니다</p>
                  <p className='text-sm text-gray-400'>메시지를 보내 대화를 시작해보세요</p>
                </div>
              ) : (
                <>
                  {groupedMessages.map((item, index) => {
                    if (item.type === 'date' && item.date) {
                      return <DateDivider key={`date-${item.date}-${index}`} date={item.date} />;
                    }
                    if (item.type === 'message' && item.message) {
                      return (
                        <MessageBubble
                          key={`msg-${item.message.id}`}
                          message={item.message}
                          senderName={currentStudentName}
                          showProfile={item.showProfile}
                          showTail={item.showTail}
                          onReply={handleReply}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onPressImage={handlePressImage}
                        />
                      );
                    }
                    return null;
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            {selectedQnaId && (
              <MessageInput
                replyTo={replyTo}
                editingMessage={editingMessage}
                senderName={currentStudentName}
                onClearReply={handleClearReply}
                onCancelEdit={handleCancelEdit}
                onSend={handleSend}
                onImageSelected={handleFileUpload}
                onFileSelected={handleFileUpload}
                disabled={isPending}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
