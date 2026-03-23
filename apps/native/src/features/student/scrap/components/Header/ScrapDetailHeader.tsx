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
  const [lottiePlayed, setLottiePlayed] = useState(false);
  const lottieRef = useRef<LottieView>(null);

  const [_localName, setLocalName] = useState<string | undefined>();
  const localName = _localName ?? scrapName;
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!showSave) return;

    setLottiePlayed(true);

    const playWhenReady = () => {
      if (lottieRef.current) {
        lottieRef.current.play();
      }
    };

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(playWhenReady);
    });

    return () => cancelAnimationFrame(id);
  }, [showSave]);

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
        {lottiePlayed && (
          <LottieView
            style={{ width: 24, height: 24 }}
            source={require('../../../../../../assets/lottie/refetch_cw.json')}
            ref={lottieRef}
            loop={false}
            onAnimationFinish={() => {
              setLottiePlayed(false);
            }}
          />
        )}
        <TooltipPopover
          triggerBorderRadius={4}
          triggerBackgroundColor=''
          from={
            <View className='flex-row items-center gap-[10px]'>
              <Text
                className='text-20b text-center text-white md:max-w-[344px] lg:max-w-[464px]'
                numberOfLines={1}>
                {scrapName || '스크랩 상세'}
              </Text>
              <ChevronDownFilledIcon size={20} color={colors['gray-600']} />
            </View>
          }>
          {(close) => (
            <TooltipContainer
              height=''
              header={
                <View className='h-[32px] w-[216px] rounded-[6px] bg-gray-300 px-[6px] py-1'>
                  <TextInput
                    ref={textInputRef}
                    className='text-16m flex-1 text-black'
                    style={{ lineHeight: 20, paddingVertical: 0 }}
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
                        setLocalName(undefined);
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
                        setLocalName(undefined);
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
          )}
        </TooltipPopover>
      </View>
      <Pressable onPress={onMessagePress}>
        {/* 미구현 <MessageCircleMore size={24} color={'#FFF'} />` */}
      </Pressable>
    </View>
  );
};
