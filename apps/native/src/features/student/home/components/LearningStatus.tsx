import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Container } from '@components/common';
import { TeacherIcon } from '@components/system/icons';

interface TextBubbleProps {
  date: string;
  content: string;
}

const TextBubble = ({ date, content }: TextBubbleProps) => {
  return (
    <View className='flex-1'>
      <View className='absolute top-[15px] -left-[9px]'>
        <Svg width={12} height={18} viewBox='0 0 12 18' fill='none'>
          <Path
            d='M0.399919 9.8L11.3333 18V0L0.399919 8.2C-0.133415 8.6 -0.133415 9.4 0.399919 9.8Z'
            fill='white'
          />
        </Svg>
      </View>

      <View className='w-full gap-[8px] rounded-[12px] bg-white px-[22px] py-[19px]'>
        <Text className='text-12r text-gray-700'>{date}</Text>
        <Text className='text-16m text-black'>{content}</Text>
      </View>
    </View>
  );
};

interface LearningStatusProps {
  studentName: string;
  date: string;
  content: string;
}

const LearningStatus = ({ studentName, date, content }: LearningStatusProps) => {
  return (
    <Container className='gap-[16px] pt-[26px] pb-[32px]'>
      <Text className='text-20b text-gray-900'>{`${studentName}님의 학습 상태`}</Text>
      <View className='flex-row items-start gap-[18px] px-[10px]'>
        {/* Learning Status Icon */}
        <View className='items-center justify-center gap-[4px]'>
          <View className='h-[46px] w-[46px] items-center justify-center rounded-[16px] bg-[#C5CEFF]/80'>
            <TeacherIcon />
          </View>
          <Text className='text-12m text-gray-900'>출제진</Text>
        </View>

        <TextBubble date={date} content={content} />
      </View>
    </Container>
  );
};

export default LearningStatus;
