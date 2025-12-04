import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertBellButtonIcon } from '@components/system/icons';
import { StudentRootStackParamList } from '../types';
import { Container } from '@components/common';

type RootNav = NativeStackNavigationProp<StudentRootStackParamList>;

const HomeHeader = () => {
  const navigation = useNavigation<RootNav>();

  return (
    <SafeAreaView edges={['top']} className='bg-blue-100'>
      <Container className='flex-row items-center justify-between py-[14px]'>
        <Image
          className='h-[40px]'
          source={require('../../../../assets/images/pointer-logo.png')}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          className='h-[48px] w-[48px] gap-[10px] rounded-[8px] px-[3px] py-[9px]'>
          <AlertBellButtonIcon />
        </TouchableOpacity>
      </Container>
    </SafeAreaView>
  );
};

export default HomeHeader;
