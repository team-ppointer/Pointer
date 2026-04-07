import React from 'react';
import { Pressable, View, Text } from 'react-native';

export interface TooltipMenuItemProps {
  /** 아이콘 컴포넌트 */
  icon: React.ReactNode;
  /** 메뉴 라벨 */
  label: string;
  /** 클릭 핸들러 */
  onPress: () => void;
  /** 텍스트 색상 클래스 (기본: text-black) */
  textColor?: string;
  /** 마지막 아이템 여부 (border 제거용) */
  isLastItem?: boolean;
  /** 위험한 동작 여부 (빨간색 스타일) */
  isDangerous?: boolean;
}

/**
 * Tooltip 메뉴 아이템 공통 컴포넌트
 *
 * @example
 * <TooltipMenuItem
 *   icon={<Trash2 size={20} color="red" />}
 *   label="삭제"
 *   onPress={handleDelete}
 *   isDangerous
 *   isLastItem
 * />
 */
export const TooltipMenuItem = ({
  icon,
  label,
  onPress,
  textColor = 'text-black',
  isLastItem = false,
  isDangerous = false,
}: TooltipMenuItemProps) => {
  return (
    <Pressable
      className={`flex-1 flex-row items-center gap-2 py-2.5 pr-[26px] pl-4 ${
        !isLastItem ? 'border-b-[0.5px] border-gray-500' : ''
      }`}
      onPress={onPress}>
      <View>{icon}</View>
      <Text className={`text-16r ${isDangerous ? 'text-red-400' : textColor}`}>{label}</Text>
    </Pressable>
  );
};
