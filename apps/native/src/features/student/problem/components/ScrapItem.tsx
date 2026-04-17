import { Text } from 'react-native';
import { BookmarkIcon } from 'lucide-react-native';

import { shadow, colors } from '@theme/tokens';
import { AnimatedPressable } from '@components/common';

interface ScrapItemProps {
  title: string;
  isBookmarked?: boolean;
  onPress?: () => void;
  onBookmark?: () => void;
}

const ScrapItem = ({ title, isBookmarked = false, onPress, onBookmark }: ScrapItemProps) => {
  return (
    <AnimatedPressable
      className='h-[40px] flex-row items-center justify-between rounded-[8px] bg-white pr-[6px] pl-[10px]'
      style={shadow['100']}
      onPress={onPress}>
      <Text className='typo-body-2-medium px-[6px]'>{title}</Text>
      <AnimatedPressable className='p-[6px]' onPress={onBookmark}>
        <BookmarkIcon
          size={20}
          color={isBookmarked ? colors['primary-500'] : colors['gray-600']}
          fill={isBookmarked ? colors['primary-500'] : 'none'}
        />
      </AnimatedPressable>
    </AnimatedPressable>
  );
};

export default ScrapItem;
