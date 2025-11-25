import { BookOpenText, Megaphone } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function Home() {
  return (
    <View className='flex-1 items-center bg-[#ECF0FB]'>
      <View className='h-[178px] gap-[10px] px-[128px] pt-[16px]'>
        <View
          className='boder h-[76px] w-[768px] flex-row items-center justify-between rounded-[12px] border border-[#C5CEFF] bg-[#D6E1FF] p-[16px] shadow-sm'
          style={{
            shadowColor: '#0C0C0D',
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 3,
            elevation: 2,
          }}>
          <View className='flex-row items-center gap-[12px]'>
            <View className='h-10 w-10 items-center justify-center rounded-full' style={{}}>
              <View className='h-10 w-10 items-center justify-center rounded-full bg-[#FFFFFF]'>
                <BookOpenText strokeWidth={2} size={24} color='#3A67EE' />
              </View>
            </View>
            <View>
              <Text
                className='text-[16px] text-[#1E1E21]'
                style={{ lineHeight: 24, fontFamily: 'PretendardSemiBold' }}>
                오늘의 문제 세트가 도착했어요.
              </Text>
              <Text
                className='mt-1 text-[12px] text-[#6B6F77]'
                style={{
                  fontFamily: 'PretendardMedium',
                }}>
                오늘 12:00
              </Text>
            </View>
          </View>
          <Pressable
            className='h-[33px] items-center justify-center gap-0.5 rounded-[6px] bg-[#3A67EE] px-[12px] py-[6px]'
            // onPress={}
          >
            <Text className='text-[13px] text-white' style={{ fontFamily: 'PretendardMedium' }}>
              문제풀기
            </Text>
          </Pressable>
        </View>
        <View
          className='boder h-[76px] w-[768px] flex-row items-center justify-between rounded-[12px] bg-[#FFFFFF] p-[16px] shadow-sm'
          style={{
            shadowColor: '#0C0C0D',
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 3,
            elevation: 2,
          }}>
          <View className='flex-row items-center gap-[12px]'>
            <View className='h-10 w-10 items-center justify-center rounded-full' style={{}}>
              <View className='h-10 w-10 items-center justify-center rounded-full bg-[#FFF4CC]'>
                <Megaphone strokeWidth={2} size={24} color='#E59C00' />
              </View>
            </View>
            <View>
              <Text
                className='text-[16px] text-[#1E1E21]'
                style={{ lineHeight: 24, fontFamily: 'PretendardSemiBold' }}>
                공지 제목이 작성돼요.
              </Text>
              <Text
                className='mt-1 text-[12px] text-[#6B6F77]'
                style={{
                  fontFamily: 'PretendardMedium',
                }}>
                12월 4일
              </Text>
            </View>
          </View>
          <View className='gap-[10px] px-[10px]'>
            <Text
              className='color-[#3A67EE] text-[12px]'
              style={{ fontFamily: 'PretendardMedium' }}>
              더보기
            </Text>
          </View>
        </View>
      </View>
      {/* <View className="bg-[#F8F9FC] h-[200px]"></View> */}
    </View>
  );
}
