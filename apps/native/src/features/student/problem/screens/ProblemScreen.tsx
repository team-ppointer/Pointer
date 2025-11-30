import { colors } from '@theme/tokens';
import { Container } from '@components/common';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookmarkIcon, MessageCircleMoreIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import type { StudentRootStackParamList } from '@navigation/student/types';
import WritingArea from '../components/WritingArea';

type ProblemScreenProps = Partial<NativeStackScreenProps<StudentRootStackParamList, 'Problem'>>;

const ProblemScreen = ({ navigation }: ProblemScreenProps) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className='flex-1' edges={['top']}>
      <Container className='flex-1'>
        <Header navigation={navigation} />

        {/* Problem */}
        <View className='my-[10px] min-h-[200px] rounded-[8px] bg-white p-[20px]'>
          <Text className='text-13r text-gray-900'>문제 내용</Text>
        </View>

        <WritingArea />
      </Container>

      <View
        className='border-t border-gray-300 bg-white pt-[10px]'
        style={{ paddingBottom: 10 + insets.bottom }}>
        <Container className='flex-row items-center gap-[10px]'>
          <Pressable
            className='items-center justify-center rounded-[8px] bg-gray-200 px-[18px] py-[10px]'
            onPress={() => {}}>
            <BookmarkIcon size={22} color={colors['gray-700']} />
          </Pressable>
          <Pressable
            className='items-center justify-center rounded-[8px] bg-gray-200 px-[18px] py-[10px]'
            onPress={() => {}}>
            <MessageCircleMoreIcon size={22} color={colors['gray-700']} />
          </Pressable>
          <Pressable className='bg-primary-500 h-[42px] flex-1 items-center justify-center rounded-[8px] px-[18px]'>
            <Text className='text-16m text-white'>답 입력하기</Text>
          </Pressable>
        </Container>
      </View>
    </SafeAreaView>
  );
};

export default ProblemScreen;
