import React from 'react';
import { BookOpenText, Megaphone } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { newColors } from '@/theme/tokens';

const HomeScreen = () => {
  return (
    <View className='flex-1 items-center bg-blue-100'>
      <View className='h-[178px] gap-[10px] px-[128px] pt-[16px]'>
        <View
          className='border-primary-200 h-[76px] w-[768px] flex-row items-center justify-between rounded-[12px] border bg-blue-200 p-[16px] shadow-sm'
          style={{
            shadowColor: '#0C0C0D',
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 3,
            elevation: 2,
          }}>
          <View className='flex-row items-center gap-[12px]'>
            <View className='h-10 w-10 items-center justify-center rounded-full'>
              <View className='h-10 w-10 items-center justify-center rounded-full bg-white'>
                <BookOpenText strokeWidth={2} size={24} color={newColors['blue-500']} />
              </View>
            </View>
            <View>
              <Text className='text-16sb text-[#1E1E21]'>오늘의 문제 세트가 도착했어요.</Text>
              <Text className='text-12m mt-1 text-gray-700'>오늘 12:00</Text>
            </View>
          </View>
          <Pressable className='h-[33px] items-center justify-center rounded-[6px] bg-blue-500 px-[12px] py-[6px]'>
            <Text className='text-13m text-white'>문제풀기</Text>
          </Pressable>
        </View>
        <View
          className='boder h-[76px] w-[768px] flex-row items-center justify-between rounded-[12px] bg-white p-[16px] shadow-sm'
          style={{
            shadowColor: '#0C0C0D',
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 3,
            elevation: 2,
          }}>
          <View className='flex-row items-center gap-[12px]'>
            <View className='h-10 w-10 items-center justify-center rounded-full'>
              <View className='bg-secondary-100 h-10 w-10 items-center justify-center rounded-full'>
                <Megaphone strokeWidth={2} size={24} color={newColors['secondary-500']} />
              </View>
            </View>
            <View>
              <Text className='text-16sb text-[#1E1E21]'>공지 제목이 작성돼요.</Text>
              <Text className='text-12m mt-1 text-gray-700'>12월 4일</Text>
            </View>
          </View>
          <View className='gap-[10px] px-[10px]'>
            <Text className='text-12m text-blue-500'>더보기</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;
