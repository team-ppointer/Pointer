import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleIcon,
  MinusIcon,
  TriangleIcon,
  XIcon,
} from 'lucide-react-native';
import { View, Text, Pressable } from 'react-native';
import { newColors } from '@/theme/tokens';
import TextButton from '@/components/common/TextButton';

const Navigation = () => {
  return (
    <View className='flex-row items-center justify-between px-[24px]'>
      <Pressable className='p-[8px]'>
        <ChevronLeftIcon color={newColors['gray-700']} size={32} strokeWidth={1.5} />
      </Pressable>
      <View className='flex-col items-center'>
        <Text className='text-13r text-[#1E1E21] opacity-60'>11월 07일 금요일</Text>
        <Text className='text-18b text-gray-900'>문제 세트 이름</Text>
      </View>
      <Pressable className='p-[8px]'>
        <ChevronRightIcon color={newColors['gray-700']} size={32} strokeWidth={1.5} />
      </Pressable>
    </View>
  );
};

const Divider = () => {
  return <View className='h-[1px] bg-gray-400' />;
};

const ProblemStatusIcon = {
  completed: { Icon: CircleIcon, color: newColors['green-500'] },
  inprogress: { Icon: TriangleIcon, color: newColors['secondary-500'] },
  notstarted: { Icon: XIcon, color: newColors['red-500'] },
  unavailable: { Icon: MinusIcon, color: newColors['gray-700'] },
};

interface ProblemItemProps {
  title: string;
  status: 'completed' | 'inprogress' | 'notstarted' | 'unavailable';
}

const ProblemItem = ({ title, status }: ProblemItemProps) => {
  const {Icon, color} = ProblemStatusIcon[status];

  return (
    <View className='h-[42px] flex-row items-center justify-between'>
      <Text className='text-14r text-[#1E1E21]'>{title}</Text>
      <Icon color={color} size={20} strokeWidth={2.5}/>
    </View>
  );
};

const ProblemList = () => {
  return (
    <View className='flex-col px-[24px]'>
      <View className='mb-[8px] flex-row items-center justify-between'>
        <Text className='text-16b mr-[12px] text-[#1E1E21]'>1번</Text>
        <Text className='text-12sb mr-auto text-green-500'>학습 완료</Text>
        <TextButton>문제 풀기</TextButton>
        <Pressable className='ml-[8px] p-[4px]'>
          <ChevronDownIcon color={newColors['gray-700']} size={20} strokeWidth={1.5} />
        </Pressable>
      </View>
      <ProblemItem title='실전 문제' status='completed' />
      <ProblemItem title='연습 문제 1' status='inprogress' />
      <ProblemItem title='연습 문제 2' status='notstarted' />
      <ProblemItem title='연습 문제 3' status='unavailable' />
    </View>
  );
};

const ProblemSet = () => {
  return (
    <View className='flex-1 basis-1/2 gap-[24px] rounded-[12px] bg-white pb-[24px] pt-[16px] shadow-[0px_4px_4px_-4px_rgba(12,12,13,0.05),_0px_16px_32px_-4px_rgba(12,12,13,0.10)]'>
      <Navigation />
      <ProblemList />
      <Divider />
      <ProblemList />
      <Divider />
      <ProblemList />
    </View>
  );
};

export default ProblemSet;
