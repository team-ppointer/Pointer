import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { ArrowRightLeft, ChevronLeft, MessageCircleMore, Trash2 } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import { colors } from '@/theme/tokens';
import { ChevronDownFilledIcon } from '@/components/system/icons';
import { TooltipPopover } from '../Tooltip';
import { TooltipContainer } from '../Tooltip/TooltipContainer';
import { TooltipMenuItem } from '../Tooltip/TooltipMenuItem';

export interface ScrapDetailHeaderProps {
  scrapName: string;
  onScrapNameChange: (name: string) => void;
  showSave: boolean;
  onBack: () => void;
  onMessagePress?: () => void;
  canGoBack?: boolean;
  onMoveFolderPress?: () => void;
}

export const ScrapDetailHeader = ({
  scrapName,
  onScrapNameChange,
  showSave,
  onBack,
  onMessagePress,
  canGoBack = true,
  onMoveFolderPress,
}: ScrapDetailHeaderProps) => {
  const lottieRef = useRef<LottieView>(null);
  const [localName, setLocalName] = useState(scrapName);
  const textInputRef = useRef<TextInput>(null);

  // scrapName prop이 변경되면 로컬 상태 동기화
  useEffect(() => {
    setLocalName(scrapName);
  }, [scrapName]);

  return (
    <View className='w-full flex-row items-center justify-between bg-gray-800 px-[20px] py-[14px]'>
      {canGoBack && (
        <Pressable onPress={onBack}>
          <View className='items-center justify-center gap-[10px]'>
            <ChevronLeft color={'#FFF'} size={32} />
          </View>
        </Pressable>
      )}
      <View className='flex-row items-center gap-[10px]'>
        {showSave && (
          <LottieView
            style={{ width: 24, height: 24 }}
            source={require('../../../../../../assets/lottie/refetch_cw.json')}
            ref={lottieRef}
            loop={false}
          />
        )}
        <TooltipPopover
          triggerBorderRadius={4}
          triggerBackgroundColor=''
          from={
            <View className='flex-row items-center gap-[10px]'>
              <Text className='text-20b text-white'>{scrapName || '스크랩 상세'}</Text>
              <ChevronDownFilledIcon size={20} color={colors['gray-600']} />
            </View>
          }
          children={(close) => (
            <TooltipContainer
              height='h-[88px]'
              header={
                <View className='h-[32px] w-[216px] rounded-[6px] bg-gray-300 px-[6px] py-1'>
                  <TextInput
                    ref={textInputRef}
                    className='text-16m items-center justify-center text-black'
                    numberOfLines={1}
                    value={localName}
                    placeholder='스크랩 이름'
                    placeholderTextColor={colors['gray-500']}
                    onEndEditing={() => {
                      const trimmedName = localName.trim();
                      if (trimmedName && trimmedName !== scrapName) {
                        onScrapNameChange(trimmedName);
                      } else if (!trimmedName) {
                        // 빈 값이면 원래 이름으로 복원
                        setLocalName(scrapName);
                      }
                    }}
                    onChangeText={(text) => {
                      setLocalName(text);
                    }}
                    onSubmitEditing={() => {
                      const trimmedName = localName.trim();
                      if (trimmedName && trimmedName !== scrapName) {
                        onScrapNameChange(trimmedName);
                      } else if (!trimmedName) {
                        setLocalName(scrapName);
                      }
                      textInputRef.current?.blur();
                    }}
                    autoFocus={false}
                  />
                </View>
              }>
              <TooltipMenuItem
                icon={<ArrowRightLeft size={20} />}
                label='폴더 이동하기'
                onPress={() => {
                  close();
                  // 툴팁이 완전히 닫힌 후 모달 열기 (애니메이션 완료 대기)
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      onMoveFolderPress?.();
                    });
                  });
                }}
                isLastItem
              />
            </TooltipContainer>
          )}></TooltipPopover>
      </View>
      <Pressable onPress={onMessagePress}>
        <MessageCircleMore size={24} color={'#FFF'} />
      </Pressable>
    </View>
  );
};
