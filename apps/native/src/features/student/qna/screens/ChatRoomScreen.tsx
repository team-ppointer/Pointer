import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { StudentRootStackParamList } from '@navigation/student/types';
import { DUMMY_CHAT_ROOMS } from '../constants';
import { ChatRoom } from '../components/ChatRoom';

type ChatRoomScreenProps = NativeStackScreenProps<StudentRootStackParamList, 'ChatRoom'>;
type ChatRoomScreenNavigationProp = NativeStackNavigationProp<StudentRootStackParamList>;

const ChatRoomScreen = () => {
  const navigation = useNavigation<ChatRoomScreenNavigationProp>();
  const route = useRoute<ChatRoomScreenProps['route']>();
  const { chatRoomId } = route.params;

  const chatRoom = useMemo(() => {
    return DUMMY_CHAT_ROOMS.find((room) => room.id === chatRoomId) ?? null;
  }, [chatRoomId]);

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-gray-100">
      <ChatRoom chatRoom={chatRoom} onBack={handleBack} showBackButton />
    </View>
  );
};

export default ChatRoomScreen;

