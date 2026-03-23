import { View } from 'react-native';
import { useState } from 'react';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { type MenuStackParamList } from '@navigation/student/MenuNavigator';

import { EditScreenLayout } from '../../../components';

import { mathSubjectOptions, type MathSubjectValue } from '@/features/student/onboarding/constants';
import { showToast } from '@/features/student/scrap/components/Notification';
import { OptionButton } from '@/features/student/onboarding/components';

const EditMathSubjectScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<MenuStackParamList, 'EditMathSubject'>) => {
  const [selectSubject, setSelectSubject] = useState<MathSubjectValue | null>(
    route.params.initialMathSubject || null
  );

  const handleSave = async () => {
    if (!selectSubject) {
      showToast('error', '선택과목을 선택해 주세요.');
      return;
    }
    // MyInfo로 돌아가면서 수정된 값 전달
    navigation.reset({
      index: 1,
      routes: [
        { name: 'MenuMain' },
        { name: 'MyInfo', params: { updatedData: { selectSubject: selectSubject } } },
      ],
    });
    showToast('success', '선택과목이 변경되었습니다.');
  };

  return (
    <EditScreenLayout
      title='수능 수학 선택과목을 1개 선택해 주세요.'
      description='2026년 11월 19일에 예정된 수능에서 응시할 선택과목을 선택해 주세요.'
      onPressCTA={handleSave}
      ctaDisabled={!selectSubject}>
      <View className='gap-[20px]'>
        {mathSubjectOptions.map((option) => (
          <OptionButton
            key={option.value}
            label={option.label}
            selected={selectSubject === option.value}
            onPress={() => setSelectSubject(option.value)}
          />
        ))}
      </View>
    </EditScreenLayout>
  );
};

export default EditMathSubjectScreen;
