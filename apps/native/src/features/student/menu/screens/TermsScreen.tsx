import React from 'react';
import { Text, ScrollView } from 'react-native';
import { AnimatedPressable, Container } from '@components/common';
import { ChevronRight } from 'lucide-react-native';
import { ScreenLayout } from '../components';
import { colors } from '@theme/tokens';

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
  const handleTermPress = (term: TermsItem) => {
    console.log('Term pressed:', term);
  };

  return (
    <ScreenLayout title='서비스 약관'>
      <ScrollView className='flex-1 pt-[10px]' showsVerticalScrollIndicator={false}>
        <Container className='gap-3'>
          {TERMS_LIST.map((term) => (
            <AnimatedPressable
              disableScale
              key={term.id}
              onPress={() => handleTermPress(term)}
              className='h-[48px] flex-row items-center justify-between'>
              <Text className='text-16m flex-1 text-black'>{term.title}</Text>
              <ChevronRight size={20} color={colors['gray-600']} />
            </AnimatedPressable>
          ))}
        </Container>
      </ScrollView>
    </ScreenLayout>
  );
};

export default TermsScreen;
