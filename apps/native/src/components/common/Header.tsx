import React, { type FC, type ReactNode } from 'react';
import { View, Text } from 'react-native';
import { ChevronLeft, type LucideIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { colors } from '@theme/tokens';

import ContentInset from './ContentInset';
import AnimatedPressable from './AnimatedPressable';

type HeaderBadge = 'correct' | 'incorrect';

type HeaderProps = {
  title?: string;
  subtitle?: string;
  badge?: HeaderBadge;
  showBackButton?: boolean;
  onPressBack?: () => void;
  right?: ReactNode;
  paddingHorizontal?: number | { left: number; right: number };
};

const badgeConfig = {
  correct: { bg: 'bg-primary-200', text: 'text-primary-600', label: '정답' },
  incorrect: { bg: 'bg-red-100', text: 'text-red-500', label: '오답' },
} as const;

const Badge = ({ variant }: { variant: HeaderBadge }) => {
  const config = badgeConfig[variant];
  return (
    <View className={`rounded px-[6px] py-[2px] ${config.bg}`}>
      <Text className={`typo-heading-2-semibold ${config.text}`}>{config.label}</Text>
    </View>
  );
};

const HeaderTextButton = ({
  children,
  onPress,
  color = colors['gray-700'],
  disabled,
}: {
  children: ReactNode;
  onPress?: () => void;
  color?: string;
  disabled?: boolean;
}) => (
  <AnimatedPressable
    className={`h-[48px] items-center justify-center px-[12px] ${disabled ? 'opacity-50' : ''}`}
    onPress={onPress}
    disabled={disabled}>
    <Text className='typo-heading-2-semibold' style={{ color }}>
      {children}
    </Text>
  </AnimatedPressable>
);

const HeaderIconButton = ({
  icon: Icon,
  onPress,
  color,
}: {
  icon: LucideIcon;
  onPress?: () => void;
  color?: string;
}) => (
  <AnimatedPressable className='items-center justify-center p-[12px]' onPress={onPress}>
    <Icon size={24} {...(color && { color })} />
  </AnimatedPressable>
);

const getRightGap = (children: ReactNode): number => {
  let hasTextButton = false;
  const check = (node: ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (!React.isValidElement(child)) return;
      if (child.type === HeaderTextButton) hasTextButton = true;
      if (child.type === React.Fragment) check((child.props as { children?: ReactNode }).children);
    });
  };
  check(children);
  return hasTextButton ? 8 : 4;
};

const resolveOverrideStyle = (paddingHorizontal: HeaderProps['paddingHorizontal']) => {
  if (paddingHorizontal === undefined) return null;
  if (typeof paddingHorizontal === 'number') {
    return { paddingHorizontal };
  }
  return {
    paddingLeft: paddingHorizontal.left,
    paddingRight: paddingHorizontal.right,
  };
};

const HeaderRoot = ({
  title,
  subtitle,
  badge,
  showBackButton,
  onPressBack,
  right,
  paddingHorizontal,
}: HeaderProps) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onPressBack) {
      onPressBack();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const inner = (
    <>
      <View className='flex-row items-center gap-[4px]'>
        {showBackButton && <HeaderIconButton icon={ChevronLeft} onPress={handleBack} />}
        {(title || subtitle || badge) && (
          <View className='flex-row items-center gap-[12px]'>
            {title && <Text className='typo-title-1-bold text-gray-900'>{title}</Text>}
            {subtitle && <Text className='typo-title-1-semibold text-gray-700'>{subtitle}</Text>}
            {badge && <Badge variant={badge} />}
          </View>
        )}
      </View>
      {right && (
        <View className='flex-row items-center' style={{ gap: getRightGap(right) }}>
          {right}
        </View>
      )}
    </>
  );

  const overrideStyle = resolveOverrideStyle(paddingHorizontal);

  return (
    <View className='h-[56px] w-full'>
      {overrideStyle ? (
        <View className='size-full flex-row items-center justify-between' style={overrideStyle}>
          {inner}
        </View>
      ) : (
        <ContentInset className='h-full flex-row items-center justify-between'>
          {inner}
        </ContentInset>
      )}
    </View>
  );
};

type HeaderComponent = FC<HeaderProps> & {
  TextButton: typeof HeaderTextButton;
  IconButton: typeof HeaderIconButton;
};

const Header = HeaderRoot as HeaderComponent;
Header.TextButton = HeaderTextButton;
Header.IconButton = HeaderIconButton;

export default Header;
