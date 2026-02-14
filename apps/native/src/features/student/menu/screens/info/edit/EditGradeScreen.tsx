import { View } from 'react-native';
import { EditScreenLayout } from '../../../components';
import { OptionButton } from '@features/student/onboarding/components';
import { useState } from 'react';
import { showToast } from '@features/student/scrap/components/Notification';
import { MenuStackParamList } from '@navigation/student/MenuNavigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { gradeOptions, GradeValue } from '@features/student/onboarding/constants';

const EditGradeScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<MenuStackParamList, 'EditGrade'>) => {
  const [grade, setGrade] = useState<GradeValue | null>(route.params.initialGrade || null);

  const handleSave = async () => {
    if (!grade) {
      showToast('error', '학년을 선택해 주세요.');
      return;
    }

    navigation.push('EditSchool', {
      initialSchool: route.params.initialSchool,
      initialGrade: grade,
    });

    showToast('success', '학년이 변경되었습니다.');
  };

  const handleSkip = () => {
    navigation.push('EditSchool', {
      initialSchool: route.params.initialSchool,
      initialGrade: route.params.initialGrade,
    });
  };

  return (
    <EditScreenLayout
      title='고등학교 학년을 선택해 주세요.'
      description='학년을 입력해 교육과정이 고려된 맞춤형 문제를 제공받아요.'
      onPressCTA={handleSave}
      ctaDisabled={!grade}
      skipLabel='건너뛰기'
      onSkip={handleSkip}>
      <View className='gap-[20px]'>
        {gradeOptions.map((option) => (
          <OptionButton
            key={option.value}
            label={option.label}
            selected={grade === option.value}
            onPress={() => setGrade(option.value)}
          />
        ))}
      </View>
    </EditScreenLayout>
  );
};

export default EditGradeScreen;
