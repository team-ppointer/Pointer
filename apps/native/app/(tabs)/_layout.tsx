import { Tabs } from "expo-router";
import { Bell, Bookmark, Home, Menu, MessageCircleMore } from "lucide-react";
import React from "react";
import { Image, Text, View } from "react-native";

const _Layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: 76,
          paddingHorizontal: 226,
          gap: 10,
          backgroundColor: "#F8F9FC",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 4,
          paddingBottom: 20,
        },
        tabBarLabelPosition: "below-icon",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          // headerShown:false,
          header: () => (
            <View className=" bg-[#ECF0FB] px-[128px] py-[14px] flex-row justify-between">
              <Image
                className="w-[150px] h-[40px]"
                source={require("@/assets/images/pointer-logo.png")}
              />
              <View className="h-[48px] w-[48px] px-[3px] py-[9px] gap-[10px] rounded-[8px]">
                <Bell className="h-[24px]" style={{ aspectRatio: 1 }}></Bell>
              </View>
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? "#617AF9" : "#3E3F45",
                fontFamily: "PretendardBold",
                fontSize: 14,
              }}
            >
              홈
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Home color={focused ? "#617AF9" : "#3E3F45"} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="scrap"
        options={{
          // headerShown:false,
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? "#617AF9" : "#3E3F45",
                fontFamily: "PretendardBold",
                fontSize: 14,
              }}
            >
              스크랩
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Bookmark color={focused ? "#617AF9" : "#3E3F45"} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="qna/page"
        options={{
          // headerShown:false,
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? "#617AF9" : "#3E3F45",
                fontFamily: "PretendardBold",
                fontSize: 14,
              }}
            >
              QnA
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <MessageCircleMore
              color={focused ? "#617AF9" : "#3E3F45"}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="all"
        options={{
          // headerShown:false,
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? "#617AF9" : "#3E3F45",
                fontFamily: "PretendardBold",
                fontSize: 14,
              }}
            >
              전체 메뉴
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Menu color={focused ? "#617AF9" : "#3E3F45"} size={22} />
          ),
        }}
      />
    </Tabs>
  );
};

export default _Layout;
