import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { AnimatedPressable, Container } from '@components/common';
import { useAuthStore } from '@stores';
import { ScreenLayout } from '../components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteAccount } from '@apis';
import { CheckIcon } from 'lucide-react-native';

const WITHDRAWAL_REASONS = [
  '서비스 사용방법이 너무 어려워요.',
  '수학 학습에 도움이 되지 않아요.',
  '수학 학습에 필요한 기능이 부족해요.',
  '더 이상 필요하지 않아요.',
  '기타',
] as const;

const REASON_MAPPING: Record<
  (typeof WITHDRAWAL_REASONS)[number],
  'DIFFICULT_TO_USE' | 'NOT_HELPFUL' | 'LACK_OF_FEATURES' | 'NO_LONGER_NEEDED' | 'OTHER'
> = {
  '서비스 사용방법이 너무 어려워요.': 'DIFFICULT_TO_USE',
  '수학 학습에 도움이 되지 않아요.': 'NOT_HELPFUL',
  '수학 학습에 필요한 기능이 부족해요.': 'LACK_OF_FEATURES',
  '더 이상 필요하지 않아요.': 'NO_LONGER_NEEDED',
  기타: 'OTHER',
};

const WithdrawalScreen = () => {
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

  const handleWithdrawalClick = async () => {
    if (!showReasons) {
      setShowReasons(true);
      return;
    }

    try {
      const reasons = selectedReasons.map(
        (reason) => REASON_MAPPING[reason as keyof typeof REASON_MAPPING]
      );
      const hasOther = reasons.includes('OTHER');

      await deleteAccount({
        reasons,
        ...(hasOther && { otherReason: '' }),
      });
      signOut();
    } catch (error) {
      console.error('Failed to withdraw', error);
      Alert.alert('오류', '회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <ScreenLayout title='회원 탈퇴'>
      <ScrollView className='flex-1 pt-[10px]' showsVerticalScrollIndicator={false}>
        <Container>
          <View className='mb-[20px]'>
            {!showReasons && (
              <>
                <Text className='text-18sb mb-[6px] text-black'>포인터를 탈퇴하시겠습니까?</Text>
                <Text className='text-12r text-gray-700'>
                  지금까지의 학습, 스크랩, 채팅 기록이 모두 삭제되고{`\n`}14일간 재가입 및 접속이
                  제한됩니다.
                </Text>
              </>
            )}
            {showReasons && (
              <>
                <Text className='text-18sb mb-[6px] text-black'>
                  서비스 개선을 위해{`\n`}
                  탈퇴 사유를 알려주세요.
                </Text>
                <Text className='text-12r text-gray-700'>
                  탈퇴 사유를 모두 선택해주세요. (선택)
                </Text>
              </>
            )}
          </View>
          {showReasons &&
            WITHDRAWAL_REASONS.map((reason) => (
              <AnimatedPressable
                disableScale
                key={reason}
                onPress={() => toggleReason(reason)}
                className='h-[48px] flex-row items-center gap-[10px]'>
                <View
                  className={`h-[16px] w-[16px] items-center justify-center rounded-[4px] border border-gray-700 ${
                    selectedReasons.includes(reason) ? 'bg-blue-500' : 'border border-gray-300'
                  }`}>
                  {selectedReasons.includes(reason) && (
                    <CheckIcon color='#F5F5F5' size={16} strokeWidth={2.5} />
                  )}
                </View>
                <Text className='text-16r flex-1 text-black'>{reason}</Text>
              </AnimatedPressable>
            ))}
        </Container>
      </ScrollView>

      <SafeAreaView edges={['bottom']} className='mb-[18px]'>
        <Container>
          <AnimatedPressable
            onPress={handleWithdrawalClick}
            disabled={showReasons && selectedReasons.length === 0}
            className={`items-center rounded-xl px-3 py-[10px] ${
              !showReasons || selectedReasons.length > 0 ? 'bg-primary-500' : 'bg-gray-300'
            }`}>
            <Text className='text-16m text-white'>탈퇴하기</Text>
          </AnimatedPressable>
        </Container>
      </SafeAreaView>
    </ScreenLayout>
  );
};

export default WithdrawalScreen;
