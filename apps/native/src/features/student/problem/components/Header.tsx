import { StudentRootStackParamList } from '@navigation/student/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '@theme/tokens';
import { XIcon } from 'lucide-react-native';
import { Pressable, View, Text } from 'react-native';

type ProblemScreenProps = Partial<NativeStackScreenProps<StudentRootStackParamList, 'Problem'>>;
const Header = ({ navigation }: ProblemScreenProps) => {
  return (
    <View className='h-[74px] justify-center gap-[2px]'>
      <Text className='text-14r text-gray-700'>11월 7일</Text>
      <View className='flex-row items-center gap-[10px]'>
        <Text className='text-20b text-gray-900'>실습 문제 1번</Text>
        <View className='h-[24px] justify-center rounded-[4px] bg-blue-500/20 px-[6px]'>
          <Text className='text-14m text-blue-500'>정답</Text>
        </View>
      </View>
      <Pressable
        className='absolute right-0 h-[48px] w-[48px] items-center justify-center'
        onPress={() => navigation?.goBack()}>
        <XIcon color={colors.black} />
      </Pressable>
    </View>
  );
};

export default Header;
