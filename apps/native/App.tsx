import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
    PretendardVariable: require('./assets/fonts/PretendardVariable.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View className='flex-1 items-center justify-center bg-[#ECF0FB]'>
          <ActivityIndicator size='small' color='#3A67EE' />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style='dark' />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
