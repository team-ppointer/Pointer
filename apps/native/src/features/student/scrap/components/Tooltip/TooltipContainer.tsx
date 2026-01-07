import React from 'react';
import { View } from 'react-native';

export interface TooltipContainerProps {
  /** 높이 클래스 (예: 'h-[88px]', 'h-[176px]') */
  height?: string;
  /** 헤더 영역 (옵션) */
  header?: React.ReactNode;
  /** 메뉴 아이템들 */
  children: React.ReactNode;
}

/**
 * Tooltip 컨테이너 공통 컴포넌트
 *
 * @example
 * <TooltipContainer
 *   height="h-[176px]"
 *   header={<TextInput ... />}
 * >
 *   <TooltipMenuItem ... />
 *   <TooltipMenuItem ... />
 * </TooltipContainer>
 */
export const TooltipContainer = ({
  height = 'h-[88px]',
  header,
  children,
}: TooltipContainerProps) => {
  return (
    <View className={`${height} w-[228px] flex-col rounded-[10px] bg-white`}>
      {header && (
        <View className='h-[44px] items-center justify-center gap-2 border-b-[0.5px] border-gray-500 px-[6px]'>
          {header}
        </View>
      )}
      {children}
    </View>
  );
};
