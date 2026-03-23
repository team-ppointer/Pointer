import { View } from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { type MenuStackParamList } from '@navigation/student/MenuNavigator';
import { levelOptions } from '@features/student/onboarding/constants';
import OptionButton from '@features/student/onboarding/components/OptionButton';
import { showToast } from '@features/student/scrap/components/Notification';
import { MessageSquareWarningFilledIcon } from '@components/system/icons';
import { InfoCard } from '@features/student/onboarding/components';
import { colors } from '@theme/tokens';

import { EditScreenLayout } from '../../../components';

const EditScoreScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<MenuStackParamList, 'EditScore'>) => {
  const [level, setLevel] = useState<number | null>(route.params.initialScore || null);

  const levelRows = useMemo(() => {
    const rows: (typeof levelOptions)[] = [];
    for (let i = 0; i < levelOptions.length; i += 3) {
      rows.push(levelOptions.slice(i, i + 3));
    }
    return rows;
  }, []);

  const handleSave = async () => {
    if (!level) {
      showToast('error', '성적을 선택해 주세요.');
      return;
    }
    // MyInfo로 돌아가면서 수정된 값 전달
    navigation.reset({
      index: 1,
      routes: [{ name: 'MenuMain' }, { name: 'MyInfo', params: { updatedData: { level: level } } }],
    });
    showToast('success', '성적이 변경되었습니다.');
  };

  return (
    <EditScreenLayout
      title='최근 공식 수학 성적을 선택해 주세요.'
      description='가장 최근에 응시한 수능/모의고사 성적을 입력하면 실력을 더 정확히 파악할 수 있어요.'
      onPressCTA={handleSave}
      ctaDisabled={!level}>
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
    </EditScreenLayout>
  );
};

export default EditScoreScreen;
