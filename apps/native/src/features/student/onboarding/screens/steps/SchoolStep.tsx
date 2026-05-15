import { useState, useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Search } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

import { colors, shadow } from '@theme/tokens';
import { CircleXFilledIcon } from '@components/system/icons';
import { useDebounce } from '@hooks';
import useGetSchool from '@apis/controller/student/school/useGetSchool';

import type { OnboardingScreenProps } from '../types';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { OnboardingLayout, OnboardingInput } from '../../components';
import useFinishOnboarding from '../../hooks/useFinishOnboarding';
import useResolveCurrentMockExamType from '../../hooks/useResolveCurrentMockExamType';
import { getOnboardingTotal } from '../../utils';

const SchoolStep = ({ navigation }: OnboardingScreenProps<'School'>) => {
  const grade = useOnboardingStore((state) => state.grade);
  const schoolId = useOnboardingStore((state) => state.schoolId);
  const setSchoolId = useOnboardingStore((state) => state.setSchoolId);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);
  const currentMockExamType = useOnboardingStore((state) => state.currentMockExamType);
  const currentTypeStatus = useOnboardingStore((state) => state.currentTypeStatus);

  useFocusEffect(
    useCallback(() => {
      setCurrentStep('School');
    }, [setCurrentStep])
  );

  const [query, setQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');

  const debouncedQuery = useDebounce(query.trim(), 300);
  const { data, isLoading } = useGetSchool({ query: debouncedQuery });

  const results = data?.data ?? [];

  const { submit, isPending } = useFinishOnboarding();
  const { resolveCurrentMockExamType, isResolvingCurrentType } = useResolveCurrentMockExamType();

  const isCurrentTypeReady = currentTypeStatus === 'resolved';
  const isCurrentTypeRetryable = currentTypeStatus === 'error';
  const isCurrentTypeBlocked = currentTypeStatus !== 'resolved' && currentTypeStatus !== 'error';
  const hasActiveMockExam = isCurrentTypeReady && Boolean(currentMockExamType?.type);
  const isProcessing = isPending || isResolvingCurrentType;
  const ctaDisabled = !schoolId || isProcessing || isCurrentTypeBlocked;
  const skipDisabled = isProcessing || isCurrentTypeBlocked;

  const handleSelect = (id: number, name: string, sido: string) => {
    const label = `${name}(${sido})`;
    setSchoolId(id);
    setQuery(label);
    setSelectedLabel(label);
  };

  const handleClear = () => {
    setSchoolId(null);
    setQuery('');
    setSelectedLabel('');
  };

  const goNext = async () => {
    let nextMockExamType = currentMockExamType;

    if (isCurrentTypeRetryable) {
      const result = await resolveCurrentMockExamType();
      if (!result.ok) return;
      nextMockExamType = result.currentMockExamType;
    } else if (!isCurrentTypeReady) {
      return;
    }

    if (nextMockExamType?.type) {
      setCurrentStep('MockExam');
      navigation.navigate('MockExam');
      return;
    }
    await submit();
  };

  const handleNext = async () => {
    if (!schoolId) return;
    await goNext();
  };

  const handleSkip = async () => {
    if (skipDisabled) return;
    setSchoolId(null);
    setQuery('');
    setSelectedLabel('');
    await goNext();
  };

  const total = getOnboardingTotal(grade, hasActiveMockExam);
  const current = grade === 'THREE' ? 3 : 2;

  return (
    <OnboardingLayout
      title='현재 재학중인 학교명을 입력해 주세요.'
      description='학교를 입력해 맞춤형 문제를 제공받아요.'
      onPressCTA={handleNext}
      ctaDisabled={ctaDisabled}
      ctaLoading={isProcessing}
      skipLabel='건너뛰기'
      onSkip={handleSkip}
      skipDisabled={skipDisabled}
      progress={{ current, total }}>
      <View>
        <OnboardingInput
          label='학교'
          placeholder='학교명을 입력해 주세요.'
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            if (selectedLabel && text !== selectedLabel) {
              setSchoolId(null);
              setSelectedLabel('');
            }
          }}
          rightAccessory={
            schoolId ? (
              <CircleXFilledIcon size={20} color={colors['gray-700']} />
            ) : (
              <Search size={20} color={colors['gray-900']} />
            )
          }
          onPressAccessory={() => {
            if (schoolId) {
              handleClear();
            }
          }}
        />
        {!schoolId && results.length > 0 ? (
          <View
            className='mt-[6px] rounded-[10px] border border-gray-200 bg-white p-[6px]'
            style={shadow[100]}>
            {isLoading ? (
              <View className='items-center justify-center py-[20px]'>
                <ActivityIndicator size='small' color={colors['gray-500']} />
              </View>
            ) : (
              <ScrollView
                keyboardShouldPersistTaps='handled'
                style={{ maxHeight: 280 }}
                contentContainerClassName='gap-[8px]'>
                {results.map((item) => {
                  const label = `${item.name ?? ''}(${item.sido ?? ''})`;
                  return (
                    <Pressable
                      key={item.id}
                      className={`rounded-[6px] px-[10px] py-[6px] hover:bg-gray-100 active:bg-gray-200 ${
                        schoolId === item.id ? 'bg-gray-200' : 'bg-transparent'
                      }`}
                      onPress={() => handleSelect(item.id, item.name ?? '', item.sido ?? '')}>
                      <Text className='typo-body-1-regular text-gray-800'>{label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>
        ) : null}
      </View>
    </OnboardingLayout>
  );
};

export default SchoolStep;
