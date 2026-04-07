import { Text, View } from 'react-native';

import {
  CalendarCompletedIcon,
  CalendarInProgressIcon,
  CalendarNotStartedIcon,
  CalendarUnavailableIcon,
} from '@components/system/icons';

const CalendarLegend = () => {
  return (
    <View className='flex flex-row items-center justify-end px-[30px]'>
      <CalendarCompletedIcon width={20} height={20} />
      <Text className='typo-label-medium mr-4 ml-1 text-gray-800'>풀이 완료</Text>
      <CalendarInProgressIcon width={20} height={20} />
      <Text className='typo-label-medium mr-4 ml-1 text-gray-800'>진행 중</Text>
      <CalendarNotStartedIcon width={20} height={20} />
      <Text className='typo-label-medium mr-4 ml-1 text-gray-800'>시작 전</Text>
      <CalendarUnavailableIcon width={20} height={20} />
      <Text className='typo-label-medium ml-1 text-gray-800'>미출제</Text>
    </View>
  );
};

export default CalendarLegend;
