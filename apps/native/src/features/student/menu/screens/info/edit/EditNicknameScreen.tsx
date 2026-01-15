import { EditScreenLayout } from '../../../components';
import { OnboardingInput } from '@/features/student/onboarding/components';
import { useState } from 'react';
import { MenuStackParamList } from '@navigation/student/MenuNavigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import usePutMe from '@/apis/controller/student/me/usePutMe';
import { showToast } from '@/features/student/scrap/components/Notification';

const nicknameRegex = /^[가-힣]{2,4}$/;

const EditNicknameScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<MenuStackParamList, 'EditNickname'>) => {
  const { mutate: putMeMutate } = usePutMe();
  const [value, setValue] = useState(route.params.initialNickname || '');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!nicknameRegex.test(value)) {
      setError('한글 2~4자로 입력해 주세요.');
      return;
    }
    putMeMutate(
      { nickname: value },
      {
        onSuccess: () => {
          navigation.goBack();
          showToast('success', '닉네임이 변경되었습니다.');
        },
        onError: () => {
          showToast('error', '닉네임 변경에 실패했습니다.');
        },
      }
    );
  };

  return (
    <EditScreenLayout
      title='닉네임을 입력해 주세요.'
      description='원활한 학습을 위해 본명 사용을 추천해요.'
      onPressCTA={handleSave}
      ctaDisabled={!value}>
      <OnboardingInput
        label='닉네임'
        placeholder='홍길동'
        value={value}
        onChangeText={(text) => {
          setValue(text);
          if (error) setError('');
        }}
        hint='한글만 작성 가능, 2-4글자'
        errorMessage={error || undefined}
      />
    </EditScreenLayout>
  );
};

export default EditNicknameScreen;
