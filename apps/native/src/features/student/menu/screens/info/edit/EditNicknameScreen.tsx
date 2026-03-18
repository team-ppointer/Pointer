import { EditScreenLayout } from '../../../components';
import { OnboardingInput } from '@/features/student/onboarding/components';
import { useState } from 'react';
import { MenuStackParamList } from '@navigation/student/MenuNavigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { showToast } from '@/features/student/scrap/components/Notification';

const nicknameRegex = /^[가-힣]{2,4}$/;

const EditNicknameScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<MenuStackParamList, 'EditNickname'>) => {
  const [name, setName] = useState(route.params.initialNickname || '');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!nicknameRegex.test(name)) {
      setError('한글 2~4자로 입력해 주세요.');
      return;
    }
    // MyInfo로 돌아가면서 수정된 값 전달
    navigation.reset({
      index: 1,
      routes: [
        { name: 'MenuMain' },
        {
          name: 'MyInfo',
          params: {
            updatedData: {
              name,
            },
          },
        },
      ],
    });
    showToast('success', '이름이 변경되었습니다.');
  };

  return (
    <EditScreenLayout
      title='이름을 입력해 주세요.'
      // description='원활한 학습을 위해 본명 사용을 추천해요.'
      onPressCTA={handleSave}
      ctaDisabled={!name}>
      <OnboardingInput
        label='이름'
        placeholder='홍길동'
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (error) setError('');
        }}
        hint='한글만 작성 가능, 2-4글자'
        errorMessage={error || undefined}
      />
    </EditScreenLayout>
  );
};

export default EditNicknameScreen;
