import { Container } from '@components/common';
import React, { ReactNode } from 'react';
import { LayoutChangeEvent, Pressable, PressableProps, View } from 'react-native';

type BottomActionBarProps = {
  bottomInset?: number;
  onLayout?: (event: LayoutChangeEvent) => void;
  children: ReactNode;
};

type BottomActionBarButtonProps = PressableProps & {
  className?: string;
  children?: ReactNode;
};

type BottomActionBarComponent = ((props: BottomActionBarProps) => React.ReactElement) & {
  Button: (props: BottomActionBarButtonProps) => React.ReactElement;
};

const combineClassName = (...classNames: Array<string | undefined>) =>
  classNames.filter(Boolean).join(' ');

const BottomActionBarButton = ({ className, children, ...rest }: BottomActionBarButtonProps) => (
  <Pressable
    className={combineClassName(
      'items-center justify-center rounded-[8px] px-[18px] py-[10px]',
      className
    )}
    {...rest}>
    {children}
  </Pressable>
);

const BottomActionBar = (({ bottomInset = 0, onLayout, children }: BottomActionBarProps) => (
  <View
    className='border-t border-gray-300 bg-white pt-[10px]'
    style={{ paddingBottom: 10 + bottomInset }}
    onLayout={onLayout}>
    <Container className='flex-row items-center gap-[10px]'>{children}</Container>
  </View>
)) as BottomActionBarComponent;

BottomActionBar.Button = BottomActionBarButton;

export default BottomActionBar;
