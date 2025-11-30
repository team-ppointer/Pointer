import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import { Container } from '@components/common';
import Header from '../components/Header';
import WritingArea from '../components/WritingArea';
import BottomActionBar from '../components/BottomActionBar';
import { BookmarkIcon, MessageCircleMoreIcon, XIcon } from 'lucide-react-native';
import { colors } from '@theme/tokens';
import { StudentRootStackParamList } from '@navigation/student/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';

const PointingScreen = ({
  navigation,
}: Partial<NativeStackScreenProps<StudentRootStackParamList, 'Pointing'>>) => {
  const [bottomBarHeight, setBottomBarHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const handleBottomBarLayout = useCallback((event: LayoutChangeEvent) => {
    setBottomBarHeight(event.nativeEvent.layout.height);
  }, []);
  return (
    <View className='flex-1'>
      <SafeAreaView className='flex-1' edges={['top']}>
        <Container className='flex-1'>
          <View className='h-[66px] flex-row items-center gap-[10px]'>
            <Text className='text-20b text-primary-600'>포인팅 A</Text>
            <Text className='text-20r text-gray-900'>연습문제 1번</Text>

            <Pressable
              className='absolute right-0 h-[48px] w-[48px] items-center justify-center'
              onPress={() => navigation?.goBack()}>
              <XIcon color={colors.black} />
            </Pressable>
          </View>

          {/* Problem */}
          <View className='my-[10px] min-h-[200px] rounded-[8px] bg-white p-[20px]'>
            <Text className='text-13r text-gray-900'>
              문제가 보여지는 영역입니다. 문제가 보여지는 영역입니다. 문제가 보여지는 영역입니다.
              문제가 보여지는 영역입니다. 문제가 보여지는 영역입니다. 문제가 보여지는 영역입니다.
              문제가 보여지는 영역입니다. 문제가 보여지는 영역입니다.{' '}
            </Text>
          </View>

          <View className='mt-[10px] flex flex-col rounded-[8px] border border-gray-400 bg-gray-200'>
            <View className='flex-row gap-[10px] rounded-[8px] border-b border-gray-400 bg-white px-[12px] py-[14px]'>
              <View className='h-[32px] w-[32px] items-center justify-center'>
                <Text className='text-32b text-primary-500 leading-[35px]'>?</Text>
              </View>
              <View className='flex-1'>
                <Text className='text-13b text-gray-900'>포인팅</Text>
                <Text className='text-13r text-gray-900'>
                  질문 텍스트가 나타나는 영역입니다. 질문 텍스트가 나타나는 영역입니다. 질문
                  텍스트가 나타나는 영역입니다. 질문 텍스트가 나타나는 영역입니다. 질문 텍스트가
                  나타나는 영역입니다.
                </Text>
              </View>
            </View>
            <View className='flex-1 px-[12px] py-[14px]'>
              <Text className='text-13r ml-[42px] text-gray-900'>
                처방 텍스트가 나타나는 영역입니다. 처방 텍스트가 나타나는 영역입니다. 처방 텍스트가
                나타나는 영역입니다. 처방 텍스트가 나타나는 영역입니다. 처방 텍스트가 나타나는
                영역입니다. 처방 텍스트가 나타나는 영역입니다. 처방 텍스트가 나타나는 영역입니다.
              </Text>
            </View>
          </View>
        </Container>
        <BottomActionBar bottomInset={insets.bottom} onLayout={handleBottomBarLayout}>
          <BottomActionBar.Button className='bg-gray-200' onPress={() => {}}>
            <BookmarkIcon size={22} color={colors['gray-700']} />
          </BottomActionBar.Button>
          <BottomActionBar.Button className='bg-gray-200' onPress={() => {}}>
            <MessageCircleMoreIcon size={22} color={colors['gray-700']} />
          </BottomActionBar.Button>
          <BottomActionBar.Button className='bg-primary-200 h-[42px] flex-1' onPress={() => {}}>
            <Text className='text-16m text-black'>네</Text>
          </BottomActionBar.Button>
          <BottomActionBar.Button className='bg-primary-500 h-[42px] flex-1' onPress={() => {}}>
            <Text className='text-16m text-white'>아니오</Text>
          </BottomActionBar.Button>
        </BottomActionBar>
      </SafeAreaView>
      {/* <View pointerEvents='box-none' style={StyleSheet.absoluteFill}>
      </View> */}
    </View>
  );
};

export default PointingScreen;
