import { StudentRootStackParamList } from '@/navigation/student/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SearchScrapScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  return (
    <SafeAreaView edges={['top']} className='bg-gray-100'>
      <View className='flex-row items-center justify-between px-5 py-3.5'>
        {navigation.canGoBack() ? (
          <Pressable onPress={() => navigation.goBack()} className='p-2'>
            <View className='h-[48px] w-[48px] items-center justify-center gap-[10px]'>
              <ChevronLeft className='text-black' size={32} />
            </View>
          </Pressable>
        ) : (
          <View className='h-[48px] w-[48px] gap-[10px]' />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchScrapScreen;
