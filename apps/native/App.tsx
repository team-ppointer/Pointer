import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import RootNavigator from './src/navigation/RootNavigator';
import './src/app/providers/global.css';

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ECF0FB',
    card: '#ECF0FB',
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Pretendard: require('./assets/fonts/Pretendard-Regular.ttf'),
    PretendardMedium: require('./assets/fonts/Pretendard-Medium.ttf'),
    PretendardSemiBold: require('./assets/fonts/Pretendard-SemiBold.ttf'),
    PretendardBold: require('./assets/fonts/Pretendard-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View className='flex-1 items-center justify-center bg-[#ECF0FB]'>
        <ActivityIndicator size='small' color='#3A67EE' />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style='dark' />
      <RootNavigator />
    </NavigationContainer>
  );
}
