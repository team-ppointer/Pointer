import CalendarCompletedIcon from '@/components/system/icons/CalendarCompletedIcon';
import CalendarInProgressIcon from '@/components/system/icons/CalendarInProgressIcon';
import CalendarNotStartedIcon from '@/components/system/icons/CalendarNotStartedIcon';
import CalendarUnavailableIcon from '@/components/system/icons/CalendarUnavailableIcon';
import ChevronDownFilledIcon from '@/components/system/icons/ChevronDownFilledIcon';
import { Pressable, Text, View } from 'react-native';

const CalendarHeader = () => {
  return (
    <View className='flex-row items-center'>
      <Text className='text-20b mr-[4px] text-gray-900'>2025년 11월</Text>
      <Pressable className='p-[4px]'>
        <ChevronDownFilledIcon />
      </Pressable>
      <Text className='text-16r ml-auto text-gray-900'>오늘</Text>
    </View>
  );
};

const CalendarProgressIcon = {
  completed: CalendarCompletedIcon,
  inprogress: CalendarInProgressIcon,
  notstarted: CalendarNotStartedIcon,
  unavailable: CalendarUnavailableIcon,
};

interface CalendarDateProps {
  date: number;
  progress: 'completed' | 'inprogress' | 'notstarted' | 'unavailable';
  isSelected?: boolean;
  disabled?: boolean;
}

const CalendarDate = ({
  date,
  progress,
  isSelected = false,
  disabled = false,
}: CalendarDateProps) => {
  const Icon = CalendarProgressIcon[progress];
  return (
    <View
      className={`flex-col items-center justify-center gap-[2px] rounded-full p-[4px] ${isSelected ? 'bg-primary-200' : 'bg-white'} ${disabled ? 'opacity-30' : ''}`}>
      <Text className={`text-16m ${isSelected ? 'text-[#3952D1]' : 'text-[#25252E]'}`}>{date}</Text>
      <View className='rounded-full bg-white p-[4px]'>
        <Icon />
      </View>
    </View>
  );
};

const CalendarLegend = () => {
  return (
    <View className='flex flex-row items-center justify-end'>
      <CalendarCompletedIcon width={20} height={20} />
      <Text className='text-12r text-gray-900 ml-[4px] mr-[12px]'>풀이 완료</Text>
      <CalendarInProgressIcon width={20} height={20} />
      <Text className='text-12r text-gray-900 ml-[4px] mr-[12px]'>진행 중</Text>
      <CalendarNotStartedIcon width={20} height={20} />
      <Text className='text-12r text-gray-900 ml-[4px] mr-[12px]'>시작 전</Text>
      <CalendarUnavailableIcon width={20} height={20} />
      <Text className='text-12r text-gray-900 ml-[4px]'>미출제</Text>
    </View>
  );
};

const Calendar = () => {
  return (
    <View className='flex flex-row flex-wrap gap-y-[8px]'>
      {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
        <Text
          key={day}
          className='text-16r text-center text-gray-600'
          style={{ width: `${100 / 7}%` }}>
          {day}
        </Text>
      ))}
      {Array.from({ length: 42 }).map((_, index) => (
        <Pressable
          key={index}
          className='items-center justify-center'
          style={{ width: `${100 / 7}%` }}>
          <CalendarDate
            date={index + 1}
            progress={
              Object.keys(CalendarProgressIcon)[index % 4] as keyof typeof CalendarProgressIcon
            }
            isSelected={index === 8}
            disabled={index > 30}
          />
        </Pressable>
      ))}
    </View>
  );
};

const ProblemCalendar = () => {
  return (
    <View className='flex-1 basis-1/2 gap-[20px] rounded-[12px] bg-white p-[20px] shadow-[0px_4px_4px_-4px_rgba(12,12,13,0.05),_0px_16px_32px_-4px_rgba(12,12,13,0.10)]'>
      <CalendarHeader />
      <Calendar />
      <CalendarLegend />
    </View>
  );
};

export default ProblemCalendar;
