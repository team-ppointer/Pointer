import { BookOpenText, type LucideIcon, Megaphone, MessageCircleMore } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

import { colors } from '@theme/tokens';
import { AnimatedPressable } from '@components/common';

type IconType = 'megaphone' | 'message' | 'book';

type IconConfig = {
  Icon: LucideIcon;
  bgClass: string;
  iconColor: string;
};

const iconConfigs: Record<IconType, IconConfig> = {
  megaphone: {
    Icon: Megaphone,
    bgClass: 'bg-secondary-100',
    iconColor: colors['secondary-500'],
  },
  message: {
    Icon: MessageCircleMore,
    bgClass: 'bg-[#FFE5CC]',
    iconColor: '#F68300',
  },
  book: {
    Icon: BookOpenText,
    bgClass: 'bg-primary-200',
    iconColor: colors['primary-600'],
  },
};

const IconContainer = ({ type }: { type: IconType }) => {
  const { Icon, bgClass, iconColor } = iconConfigs[type];

  return (
    <View className={`size-[40px] items-center justify-center rounded-full ${bgClass}`}>
      <Icon strokeWidth={2} size={24} color={iconColor} />
    </View>
  );
};

interface ButtonProps {
  variant?: 'blue' | 'outline' | 'ghost';
  icon?: LucideIcon;
  onPress?: () => void;
  children: React.ReactNode;
}

const Button = ({ variant = 'blue', icon: Icon, onPress, children }: ButtonProps) => {
  const baseStyles =
    'flex flex-row items-center justify-center gap-[2px] rounded-[8px] px-[10px] h-[36px]';

  const variantStyles = {
    blue: 'bg-primary-600',
    outline: 'border bg-white border-gray-500',
    ghost: 'bg-transparent text-blue-500 hover:text-blue-600 active:text-blue-700',
  };

  const textStyles = {
    blue: 'typo-body-2-medium text-white',
    outline: 'typo-body-2-medium text-black',
    ghost: 'typo-body-2-medium text-primary-600',
  };

  return (
    <AnimatedPressable className={`${baseStyles} ${variantStyles[variant]}`} onPress={onPress}>
      <Text className={textStyles[variant]}>{children}</Text>
      {Icon && <Icon strokeWidth={2} size={16} />}
    </AnimatedPressable>
  );
};

interface NotificationItemProps {
  variant?: 'default' | 'blue';
  icon: IconType;
  title: string;
  time: string;
  hasBadge?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
}

const NotificationItem = ({
  variant = 'default',
  icon,
  title,
  time,
  hasBadge = false,
  onPress,
  children,
}: NotificationItemProps) => {
  const variantStyles = {
    default: 'border-gray-300 bg-white',
    blue: 'border-primary-200 bg-[#D6E1FF]',
  };

  const content = (
    <View
      className={`h-[76px] flex-row items-center justify-between gap-[10px] rounded-[12px] border p-[16px] ${variantStyles[variant]}`}>
      <View className='flex-1 flex-row items-center gap-[12px]'>
        <View className='flex-shrink-0'>
          <IconContainer type={icon} />
          {hasBadge && (
            <View className='bg-new absolute top-0 right-0 size-[10px] rounded-full'></View>
          )}
        </View>
        <View className='flex-1 gap-[2px]'>
          <Text className='typo-heading-2-semibold truncate text-black' numberOfLines={1}>
            {title}
          </Text>
          <Text className='typo-caption-regular text-gray-700'>{time}</Text>
        </View>
      </View>
      {children}
    </View>
  );

  if (onPress) {
    return <AnimatedPressable onPress={onPress}>{content}</AnimatedPressable>;
  }

  return content;
};

NotificationItem.Button = Button;
export default NotificationItem;
