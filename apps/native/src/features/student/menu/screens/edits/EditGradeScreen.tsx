import { View } from 'react-native';
import { EditScreenLayout } from '../../components';
import {
  OnboardingInput,
  OnboardingLayout,
  OptionButton,
} from '@/features/student/onboarding/components';
import { useEffect, useState } from 'react';
import { showToast } from '@/features/student/scrap/components/Notification';
import { MenuStackParamList } from '../../MenuNavigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { putMe } from '@/apis/controller/student';
import { useQueryClient } from '@tanstack/react-query';
import { gradeOptions, GradeValue } from '@/features/student/onboarding/constants';
import { TanstackQueryClient } from '@/apis/client';

const EditGradeScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<MenuStackParamList, 'EditGrade'>) => {
  const queryClient = useQueryClient();
  const [grade, setGrade] = useState<GradeValue | null>(route.params.initialGrade || null);

  const handleSave = async () => {
    if (!grade) {
      showToast('error', '학년을 선택해 주세요.');
      return;
    }
    const { isSuccess } = await putMe({ grade: grade });
    if (isSuccess) {
      await queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/me').queryKey,
      });
      navigation.reset({
        index: 1,
        routes: [{ name: 'MenuMain' }, { name: 'MyInfo' }],
      });
      showToast('success', '학년이 변경되었습니다.');
    }
  };
  return (
    <EditScreenLayout
      title='고등학교 학년을 선택해 주세요.'
      description='학년을 입력해 교육과정이 고려된 맞춤형 문제를 제공받아요.'
      onPressCTA={handleSave}
      ctaDisabled={!grade}>
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
