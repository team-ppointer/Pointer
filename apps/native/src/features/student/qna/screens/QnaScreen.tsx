import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StudentRootStackParamList, StudentTabParamList } from '@navigation/student/types';
import { useGetQnaList, useGetQnaById, useInvalidateQnaData } from '@apis/controller/student/qna';
import useSubscribeQnaList from '@apis/controller/common/qna/useGetSubscribeQnaList';
import type { QnAListEvent } from '@apis/controller/common/qna/useGetSubscribeQnaList';
import { getAccessToken } from '@utils/auth';

import type { ChatRoom as ChatRoomType } from '../types';
import { mapQnAMetaToChatRoom } from '../types';
import { ChatRoomList } from '../components/ChatRoomList';
import { ChatRoom } from '../components/ChatRoom';
import { useIsTablet } from '../hooks/useIsTablet';

type QnaScreenNavigationProp = NativeStackNavigationProp<StudentRootStackParamList>;
type QnaScreenRouteProp = RouteProp<StudentTabParamList, 'Qna'>;

const QnaScreen = () => {
  const navigation = useNavigation<QnaScreenNavigationProp>();
  const route = useRoute<QnaScreenRouteProp>();
  const isTablet = useIsTablet();

  // 딥링크로 전달된 초기 채팅방 ID
  const initialChatRoomId = route.params?.initialChatRoomId;

  // Selected room state
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);
  // 초기 채팅방 선택 여부를 추적
  const hasInitializedRef = useRef(false);

  const token = getAccessToken();
  const { invalidateQnaById, invalidateQnaList } = useInvalidateQnaData();

  // Debounce ref for qna_list events (prevent excessive invalidations)
  const qnaListDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to student QnA list SSE to receive real-time updates for read status (badge)
  useSubscribeQnaList({
    token: token ?? '',
    enabled: !!token,
    onQnaListEvent: useCallback(
      (event: QnAListEvent) => {
        console.log('[QnaScreen] QnA list event received:', event);
        // qna_list 이벤트 수신 시 현재 채팅방 및 리스트 데이터를 invalidate
        // 디바운스 적용: 500ms 내 중복 이벤트는 무시
        if (qnaListDebounceRef.current) {
          clearTimeout(qnaListDebounceRef.current);
        }
        qnaListDebounceRef.current = setTimeout(() => {
          // Invalidate the list to update badges
          void invalidateQnaList();

          // If in tablet mode with a selected room, also invalidate that room's data
          if (isTablet && selectedRoom && selectedRoom.id > 0) {
            void invalidateQnaById(selectedRoom.id);
          }
          qnaListDebounceRef.current = null;
        }, 500);
      },
      [isTablet, selectedRoom, invalidateQnaById, invalidateQnaList]
    ),
    onError: useCallback((error: Error) => {
      console.error('[QnaScreen] SSE QnaList error:', error);
    }, []),
  });

  // Fetch QnA list (includes both teacher chats and admin chat)
  const { data: qnaListData, isLoading: isLoadingQnaList, error: qnaListError } = useGetQnaList();

  // Fetch selected QnA details (for both teacher and admin chats)
  const { data: selectedQnaData } = useGetQnaById({
    qnaId: selectedRoom?.id ?? 0,
    enabled: isTablet && !!selectedRoom && selectedRoom.id > 0,
  });

  // Map API responses to ChatRoom format
  // Now handles both teacher chats and admin chat (type === 'ADMIN_CHAT') uniformly
  // Also applies optimistic update: selected room's badge is hidden since accessing marks it as read
  const chatRooms = useMemo<ChatRoomType[]>(() => {
    const rooms: ChatRoomType[] = [];

    if (qnaListData?.data?.groups) {
      qnaListData.data.groups.forEach((group) => {
        group.data?.forEach((qna) => {
          const room = mapQnAMetaToChatRoom(qna);

          // Optimistic update: if this room is selected (tablet mode), hide the badge
          // because accessing the room marks it as read
          if (isTablet && selectedRoom && room.id === selectedRoom.id) {
            room.hasNewMessage = false;
          }

          rooms.push(room);
        });
      });
    }

    // Sort by most recent message (newest first)
    rooms.sort((a, b) => {
      const timeA = a.lastMessageTimeRaw ? new Date(a.lastMessageTimeRaw).getTime() : 0;
      const timeB = b.lastMessageTimeRaw ? new Date(b.lastMessageTimeRaw).getTime() : 0;
      return timeB - timeA; // Descending order (newest first)
    });

    return rooms;
  }, [qnaListData, isTablet, selectedRoom]);

  // 초기 채팅방 선택 또는 첫 번째 채팅방 자동 선택 (태블릿)
  useEffect(() => {
    if (!isTablet || chatRooms.length === 0 || hasInitializedRef.current) {
      return;
    }

    // 딥링크로 전달된 initialChatRoomId가 있으면 해당 채팅방 선택
    if (initialChatRoomId) {
      const targetRoom = chatRooms.find((room) => room.id === initialChatRoomId);
      if (targetRoom) {
        setSelectedRoom(targetRoom);
        hasInitializedRef.current = true;
        return;
      }
    }

    // 없으면 첫 번째 채팅방 선택
    if (!selectedRoom) {
      setSelectedRoom(chatRooms[0]);
      hasInitializedRef.current = true;
    }
  }, [isTablet, chatRooms, initialChatRoomId, selectedRoom]);

  const handleSelectRoom = (room: ChatRoomType) => {
    if (isTablet) {
      setSelectedRoom(room);
    } else {
      navigation.navigate('ChatRoom', {
        chatRoomId: room.id,
      });
    }
  };

  const handleNewQuestion = () => {
    // TODO: Navigate to new question screen or show modal
    console.log('New question');
  };

  const handleSearch = () => {
    navigation.navigate('QnaSearch');
  };

  const isLoading = isLoadingQnaList;
  const hasError = qnaListError;

  // 컨텐츠 렌더링 함수 - early return 대신 동일한 구조 유지
  const renderContent = () => {
    if (isLoading) {
      return (
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator size='large' />
        </View>
      );
    }

    if (hasError) {
      return (
        <View className='flex-1 items-center justify-center'>
          <Text className='text-14r text-gray-600'>데이터를 불러올 수 없습니다.</Text>
        </View>
      );
    }

    if (isTablet) {
      return (
        <View className='flex-1 flex-row'>
          {/* Left Panel - Chat Room List */}
          <View className='w-[40%] max-w-[400px] min-w-[320px] border-r border-gray-500 bg-white'>
            <ChatRoomList
              chatRooms={chatRooms}
              selectedRoomId={selectedRoom?.id}
              onSelectRoom={handleSelectRoom}
              onNewQuestion={handleNewQuestion}
              onSearch={handleSearch}
            />
          </View>

          {/* Right Panel - Chat Room */}
          <View className='flex-1'>
            <ChatRoom chatRoom={selectedRoom} qnaData={selectedQnaData} />
          </View>
        </View>
      );
    }

    return (
      <ChatRoomList
        chatRooms={chatRooms}
        onSelectRoom={handleSelectRoom}
        onNewQuestion={handleNewQuestion}
        onSearch={handleSearch}
      />
    );
  };

  // 항상 동일한 SafeAreaView 구조 유지
  return <View className='flex-1 bg-gray-100'>{renderContent()}</View>;
};

export default QnaScreen;
