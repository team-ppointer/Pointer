import { useMemo } from 'react';
import { View } from 'react-native';
import { MessageSquareWarningFilledIcon } from '@components/system/icons';

import { InfoCard, OnboardingLayout, OptionButton } from '../../components';
import { levelOptions } from '../../constants';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';

import { colors } from '@/theme/tokens';

const ScoreStep = ({ navigation }: OnboardingScreenProps<'Score'>) => {
  const level = useOnboardingStore((state) => state.level);
  const setLevel = useOnboardingStore((state) => state.setLevel);

  const handleSkip = () => {
    setLevel(null);
    navigation.navigate('Welcome');
  };

  const levelRows = useMemo(() => {
    const rows: (typeof levelOptions)[] = [];
    for (let i = 0; i < levelOptions.length; i += 3) {
      rows.push(levelOptions.slice(i, i + 3));
    }
    return rows;
  }, []);

  return (
    <OnboardingLayout
      title='최근 공식 수학 성적을 선택해 주세요.'
      description='가장 최근에 응시한 수능/모의고사 성적을 입력하면 실력을 더 정확히 파악할 수 있어요.'
      onPressCTA={() => navigation.navigate('Welcome')}
      ctaDisabled={!level}
      skipLabel='건너뛰기'
      onSkip={handleSkip}>
      <View className='mb-[32px] gap-[10px]'>
        {levelRows.map((row, rowIndex) => (
          <View key={`level-row-${rowIndex}`} className='flex-row gap-[10px]'>
            {row.map((option) => (
              <View key={option.value} className='flex-1'>
                <OptionButton
                  label={option.label}
                  selected={level === option.value}
                  onPress={() => setLevel(option.value)}
                  isCentered
                />
              </View>
            ))}
          </View>
        ))}
      </View>
      <InfoCard
        icon={<MessageSquareWarningFilledIcon size={16} color={colors['primary-600']} />}
        title='최근 공식 성적을 선택해 주세요.'
        description={
          '가장 최근에 본 공식 6, 9 모의고사 혹은 수능 성적을 입력해주는 것이 객관적 실력 파악에 가장 좋아요.\n그러나 6, 9 모의고사 혹은 수능 성적이 없는 학생은 자신의 내신 혹은 대략적인 성적을 선택해 주세요.'
        }
      />
    </OnboardingLayout>
  );
};

export default ScoreStep;
