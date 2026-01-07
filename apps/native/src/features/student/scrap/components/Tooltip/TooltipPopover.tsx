import { colors } from '@/theme/tokens';
import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Popover from 'react-native-popover-view';
import { Placement } from 'react-native-popover-view/dist/Types';

export interface TooltipPopoverProps {
  from: React.ReactNode;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  placement?: Placement;
  popoverStyle?: ViewStyle;
  triggerBorderRadius?: number;
  triggerBackgroundColor?: string;
}

const TooltipPopover = ({
  from,
  children,
  placement = Placement.AUTO,
  popoverStyle,
  triggerBorderRadius = 10,
  triggerBackgroundColor = '#EDEEF2',
}: TooltipPopoverProps) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const close = () => {
    setIsVisible(false);
  };

  // from을 Pressable로 감싸서 클릭 시 열리도록 함
  const triggerElement = (
    <Pressable
      onPress={() => setIsVisible(true)}
      style={{
        borderRadius: triggerBorderRadius,
        backgroundColor: isVisible ? triggerBackgroundColor : 'transparent',
      }}
      className='items-center justify-center'>
      {from}
    </Pressable>
  );

  return (
    <Popover
      isVisible={isVisible}
      onRequestClose={close}
      from={triggerElement}
      placement={placement}
      animationConfig={{ duration: 0.1 }}
      popoverStyle={{
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors['gray-400'],
        shadowColor: '#0F0F12',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        ...popoverStyle,
      }}
      backgroundStyle={{ backgroundColor: 'transparent' }}>
      {typeof children === 'function' ? children(close) : children}
    </Popover>
  );
};

export default TooltipPopover;
