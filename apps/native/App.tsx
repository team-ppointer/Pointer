import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { newColors } from './src/theme/tokens';
import './src/app/providers/global.css';

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: newColors['gray-100'],
    card: newColors['blue-100'],
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    PretendardVariable: require('./assets/fonts/PretendardVariable.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator size='small' color={newColors['blue-500']} />
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
