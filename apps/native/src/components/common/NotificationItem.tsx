import { colors } from '@theme/tokens';
import { BookOpenText, LucideIcon, Megaphone, MessageCircleMore } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { AnimatedPressable } from '@components/common';

type IconType = 'megaphone' | 'message' | 'book' | 'book-white';

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
    iconColor: '#F27900',
  },
  book: {
    Icon: BookOpenText,
    bgClass: 'bg-[#D6E1FF]',
    iconColor: colors['blue-500'],
  },
  'book-white': {
    Icon: BookOpenText,
    bgClass: 'bg-white',
    iconColor: colors['blue-500'],
  },
};

const IconContainer = ({ type }: { type: IconType }) => {
  const { Icon, bgClass, iconColor } = iconConfigs[type];

  return (
    <View className={`h-[40px] w-[40px] items-center justify-center rounded-full ${bgClass}`}>
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
    'flex flex-row items-center justify-center gap-[2px] rounded-[6px] px-[12px] py-[6px]';

  const variantStyles = {
    blue: 'bg-blue-500',
    outline: 'border bg-white border-gray-400',
    ghost: 'bg-transparent text-blue-500 hover:text-blue-600 active:text-blue-700',
  };

  const textStyles = {
    blue: 'text-14m text-white',
    outline: 'text-14m text-gray-800',
    ghost: 'text-12m text-blue-500',
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
  hasShadow?: boolean;
  hasBadge?: boolean;
  children: React.ReactNode;
}

const NotificationItem = ({
  variant = 'default',
  icon,
  title,
  time,
  hasShadow = false,
  hasBadge = false,
  children,
}: NotificationItemProps) => {
  const variantStyles = {
    default: 'border-gray-300 bg-white',
    blue: 'border-primary-200 bg-[#D6E1FF]',
  };

  return (
    <View
      className={`h-[76px] flex-row items-center justify-between gap-[10px] rounded-[12px] border p-[16px] ${variantStyles[variant]} ${hasShadow ? 'shadow-[0px_1px_4px_0px_rgba(12,12,13,0.05)]' : ''}`}>
      <View className='flex-1 flex-row items-center gap-[12px]'>
        <View className='flex-shrink-0'>
          <IconContainer type={icon} />
          {hasBadge && (
            <View className='absolute right-0 top-0 h-[10px] w-[10px] rounded-full bg-[#E75043]'></View>
          )}
        </View>
        <View className='flex-1'>
          <Text className='text-16sb mb-[2px] truncate text-black' numberOfLines={1}>
            {title}
          </Text>
          <Text className='text-12r text-gray-700'>{time}</Text>
        </View>
      </View>
      {children}
    </View>
  );
};

NotificationItem.Button = Button;
export default NotificationItem;
