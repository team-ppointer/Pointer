import { OnboardingInput } from '@features/student/onboarding/components';
import { EditScreenLayout } from '../../../components';
import { useState } from 'react';
import { showToast } from '@features/student/scrap/components/Notification';
import { useGetSchool, usePutMe } from '@apis';
import { MenuStackParamList } from '@navigation/student/MenuNavigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Search } from 'lucide-react-native';
import { colors, shadow } from '@theme/tokens';
import { CircleXFilledIcon } from '@components/system/icons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useDebounce } from '@hooks';

const EditSchoolScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<MenuStackParamList, 'EditSchool'>) => {
  const { mutate: putMeMutate } = usePutMe();

  const [schoolId, setSchoolId] = useState<number | null>(route.params.initialSchool?.id || null);

  const [query, setQuery] = useState(route.params.initialSchool?.name || '');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const debouncedQuery = useDebounce(query.trim(), 300);
  const { data, isLoading } = useGetSchool(
    debouncedQuery.length > 0 ? { query: debouncedQuery } : { query: '' }
  );

  const results = data?.data ?? [];
  const showDropdown = dropdownVisible && (results.length > 0 || isLoading);

  const handleSelect = (id: number, name: string, sido: string) => {
    const label = `${name}(${sido})`;
    setSchoolId(id);
    setQuery(label);
    setSelectedLabel(label);
    setDropdownVisible(false);
  };

  const handleClear = () => {
    setSchoolId(null);
    setQuery('');
    setSelectedLabel('');
  };

  const handleSave = async () => {
    putMeMutate(
      { schoolId: schoolId ?? undefined },
      {
        onSuccess: () => {
          navigation.push('EditGrade', { initialGrade: route.params.initialSchool?.grade });
          showToast('success', '학교가 변경되었습니다.');
        },
      }
    );
  };

  const handleSkip = () => {
    setSchoolId(null);
    setQuery('');
    setSelectedLabel('');
    navigation.push('EditGrade', { initialGrade: route.params.initialSchool?.grade });
  };

  return (
    <EditScreenLayout
      title='현재 재학중인 학교명을 입력해 주세요.'
      description='학교를 입력해 맞춤형 문제를 제공받아요.'
      onPressCTA={handleSave}
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
            if (selectedLabel && text !== selectedLabel) {
              setSchoolId(null);
              setSelectedLabel('');
            }
            if (!dropdownVisible) setDropdownVisible(true);
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
        {showDropdown ? (
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
                      <Text className='text-16m text-gray-800'>{label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>
        ) : null}
      </View>
    </EditScreenLayout>
  );
};

export default EditSchoolScreen;
