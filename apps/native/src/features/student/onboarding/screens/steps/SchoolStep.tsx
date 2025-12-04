import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Search } from 'lucide-react-native';
import { OnboardingLayout, OnboardingInput } from '../../components';
import { schoolOptions } from '../../constants';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { OnboardingScreenProps } from '../types';
import { colors } from '@theme/tokens';
import { CircleXFilledIcon } from '@components/system/icons';

const SchoolStep = ({ navigation }: OnboardingScreenProps<'School'>) => {
  const school = useOnboardingStore((state) => state.school);
  const setSchool = useOnboardingStore((state) => state.setSchool);

  const [query, setQuery] = useState(school ?? '');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const normalizedOptions = useMemo(
    () => schoolOptions.map((item) => ({ ...item, label: `${item.name}(${item.region})` })),
    []
  );

  const results = useMemo(() => {
    if (!query.trim()) return normalizedOptions;
    return normalizedOptions.filter((option) =>
      option.label.toLowerCase().includes(query.trim().toLowerCase())
    );
  }, [normalizedOptions, query]);

  const showDropdown = dropdownVisible && results.length > 0;

  const handleSelect = (label: string) => {
    setSchool(label);
    setQuery(label);
    setDropdownVisible(false);
  };

  const handleNext = () => {
    if (!school) return;
    navigation.navigate('Score');
  };

  const handleSkip = () => {
    setSchool(null);
    setQuery('');
    navigation.navigate('Score');
  };

  return (
    <OnboardingLayout
      title='현재 재학중인 학교명을 입력해 주세요.'
      description='학교를 입력해 맞춤형 문제를 제공받아요.'
      onPressCTA={handleNext}
      ctaDisabled={!school}
      skipLabel='건너뛰기'
      onSkip={handleSkip}>
      <View>
        <OnboardingInput
          label='학교'
          placeholder='학교명을 입력해 주세요.'
          value={query}
          onFocus={() => setDropdownVisible(true)}
          onBlur={() => {
            setTimeout(() => setDropdownVisible(false), 150);
          }}
          onChangeText={(text) => {
            setQuery(text);
            setSchool(null);
            if (!dropdownVisible) setDropdownVisible(true);
          }}
          rightAccessory={
            school ? (
              <CircleXFilledIcon size={20} color={colors['gray-700']} />
            ) : (
              <Search size={20} color={colors['gray-900']} />
            )
          }
          onPressAccessory={() => {
            if (school) {
              setSchool(null);
              setQuery('');
            }
          }}
        />
        {showDropdown ? (
          <View className='mt-[6px] rounded-[10px] border border-gray-200 bg-white p-[6px] shadow shadow-black/10'>
            <ScrollView
              keyboardShouldPersistTaps='handled'
              style={{ maxHeight: 280 }}
              contentContainerClassName='gap-[8px]'>
              {results.map((item) => (
                <Pressable
                  key={item.id}
                  className={`rounded-[6px] px-[10px] py-[6px] hover:bg-gray-100 active:bg-gray-200 ${
                    school === item.label ? 'bg-gray-200' : 'bg-transparent'
                  }`}
                  onPress={() => handleSelect(item.label)}>
                  <Text className='text-16m text-gray-800'>{item.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>
    </OnboardingLayout>
  );
};

export default SchoolStep;
