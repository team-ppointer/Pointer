import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Container } from '@components/common';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { MenuStackParamList } from '../../MenuNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/tokens';

interface TermsItem {
  id: string;
  title: string;
  content?: string;
}

const TERMS_LIST: TermsItem[] = [
  { id: 'service', title: '이용약관' },
  { id: 'privacy', title: '개인정보 처리방침' },
  { id: 'marketing', title: '마케팅 정보 수신 동의' },
];

const TermsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();

  const handleTermPress = (term: TermsItem) => {
    console.log('Term pressed:', term);
  };

  return (
    <View className='w-full flex-1'>
      <SafeAreaView edges={['top']} className='flex-row items-center justify-between px-5 py-1'>
        <Pressable onPress={() => navigation.goBack()} className='p-2'>
          <ChevronLeft size={32} color='#000' />
        </Pressable>
        <Text className='text-20b text-black'>서비스 약관</Text>
        <View className='w-10' />
      </SafeAreaView>

      <ScrollView className='flex-1 pt-[10px]' showsVerticalScrollIndicator={false}>
        <Container className='gap-3'>
          {TERMS_LIST.map((term) => (
            <Pressable
              key={term.id}
              onPress={() => handleTermPress(term)}
              className='h-[48px] flex-row items-center justify-between'>
              <Text className='text-16m flex-1 text-black'>{term.title}</Text>
              <ChevronRight size={20} color={colors['gray-600']} />
            </Pressable>
          ))}
        </Container>
      </ScrollView>
    </View>
  );
};

export default TermsScreen;
