import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Container } from '@components/common';
import { ChevronLeft, AlertCircle } from 'lucide-react-native';
import { useAuthStore } from '@stores';
import { MenuStackParamList } from '../../MenuNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteAccount } from '@/apis/controller/auth';

const WITHDRAWAL_REASONS = [
  '서비스 사용방법이 너무 어려워요.',
  '수학 학습에 도움이 되지 않아요.',
  '수학 학습에 필요한 기능이 부족해요.',
  '더 이상 필요하지 않아요.',
  '기타',
];

const WithdrawalScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();
  const signOut = useAuthStore((state) => state.signOut);

  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [showReasons, setShowReasons] = useState(false);

  const toggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleWithdrawalClick = () => {
    if (!showReasons) {
      setShowReasons(true);
      return;
    }

    try {
      deleteAccount().then(() => {
        signOut();
      });
    } catch (error) {
      console.error('Failed to withdraw', error);
      Alert.alert('오류', '회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <View className='w-full flex-1'>
      <SafeAreaView edges={['top']} className='flex-row items-center justify-between px-5 py-1'>
        <Pressable onPress={() => navigation.goBack()} className='p-2'>
          <ChevronLeft size={32} color='#000' />
        </Pressable>
        <Text className='text-20b text-black'>회원 탈퇴</Text>
        <View className='w-10' />
      </SafeAreaView>
      <ScrollView className='flex-1 pt-[10px]' showsVerticalScrollIndicator={false}>
        <Container className='gap-6'>
          <View className='gap-[6px]'>
            {!showReasons && (
              <>
                <Text className='text-18sb text-black'>포인터를 탈퇴하시겠습니까?</Text>
                <Text className='text-12r text-gray-700'>
                  지금까지의 학습, 스크랩, 채팅 기록이 모두 삭제되고{`\n`}14일간 재가입 및 접속이
                  제한됩니다.
                </Text>
              </>
            )}
            {showReasons && (
              <>
                <Text className='text-18sb text-black'>
                  서비스 개선을 위해{`\n`}
                  탈퇴 사유를 알려주세요.
                </Text>
                <Text className='text-12r text-gray-700'>
                  탈퇴 사유를 모두 선택해주세요. (선택)
                </Text>
              </>
            )}
          </View>
          {showReasons && (
            <View className='gap-2'>
              {WITHDRAWAL_REASONS.map((reason) => (
                <Pressable
                  key={reason}
                  onPress={() => toggleReason(reason)}
                  className='flex-row items-center gap-3 p-4'>
                  <View
                    className={`h-5 w-5 items-center justify-center rounded ${
                      selectedReasons.includes(reason) ? 'bg-blue-500' : 'border-2 border-gray-300'
                    }`}>
                    {selectedReasons.includes(reason) && (
                      <Text className='text-12b text-white'>✓</Text>
                    )}
                  </View>
                  <Text className='text-16r flex-1 text-gray-700'>{reason}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </Container>
      </ScrollView>

      <SafeAreaView edges={['bottom']}>
        <Container>
          <Pressable
            onPress={handleWithdrawalClick}
            disabled={showReasons && selectedReasons.length === 0}
            className={`items-center rounded-xl px-3 py-[10px] ${
              !showReasons || selectedReasons.length > 0 ? 'bg-primary-500' : 'bg-gray-300'
            }`}>
            <Text className='text-16m text-white'>탈퇴하기</Text>
          </Pressable>
        </Container>
      </SafeAreaView>
    </View>
  );
};

export default WithdrawalScreen;
