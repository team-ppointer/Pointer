import { BookOpenText, Megaphone } from "lucide-react";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 bg-[#ECF0FB] items-center">
      <View className="h-[178px] pt-[16px] px-[128px] gap-[10px]">
        <View
          className="flex-row items-center justify-between rounded-[12px] p-[16px] shadow-sm boder bg-[#D6E1FF] w-[768px] h-[76px] border border-[#C5CEFF]"
          style={{
            shadowColor: "#0C0C0D",
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center gap-[12px]">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{}}
            >
              <View className="w-10 h-10 rounded-full bg-[#FFFFFF] items-center justify-center">
                <BookOpenText strokeWidth={2} size={24} color="#3A67EE" />
              </View>
            </View>
            <View>
              <Text
                className="text-[16px] text-[#1E1E21]"
                style={{ lineHeight: 24, fontFamily: "PretendardSemiBold" }}
              >
                오늘의 문제 세트가 도착했어요.
              </Text>
              <Text
                className="text-[12px] text-[#6B6F77] mt-1"
                style={{
                  fontFamily: "PretendardMedium",
                }}
              >
                오늘 12:00
              </Text>
            </View>
          </View>
          <Pressable
            className="h-[33px] items-center px-[12px] py-[6px] rounded-[6px] bg-[#3A67EE] gap-0.5 justify-center"
            // onPress={}
          >
            <Text
              className="text-white text-[13px]"
              style={{ fontFamily: "PretendardMedium" }}
            >
              문제풀기
            </Text>
          </Pressable>
        </View>
        <View
          className="flex-row items-center justify-between rounded-[12px] p-[16px] shadow-sm boder bg-[#FFFFFF] w-[768px] h-[76px]"
          style={{
            shadowColor: "#0C0C0D",
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center gap-[12px]">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{}}
            >
              <View className="w-10 h-10 rounded-full bg-[#FFF4CC] items-center justify-center">
                <Megaphone strokeWidth={2} size={24} color="#E59C00" />
              </View>
            </View>
            <View>
              <Text
                className="text-[16px] text-[#1E1E21]"
                style={{ lineHeight: 24, fontFamily: "PretendardSemiBold" }}
              >
                공지 제목이 작성돼요.
              </Text>
              <Text
                className="text-[12px] text-[#6B6F77] mt-1"
                style={{
                  fontFamily: "PretendardMedium",
                }}
              >
                12월 4일
              </Text>
            </View>
          </View>
          <View className="px-[10px] gap-[10px]">
            <Text
              className="color-[#3A67EE] text-[12px]"
              style={{ fontFamily: "PretendardMedium" }}
            >
              더보기
            </Text>
          </View>
        </View>
      </View>
      {/* <View className="bg-[#F8F9FC] h-[200px]"></View> */}
    </View>
  );
}
