import { Text, View } from 'react-native';
import { EditScreenLayout } from '../../components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MenuStackParamList } from '../../MenuNavigator';
import { useMemo, useState } from 'react';
import { levelOptions } from '@/features/student/onboarding/constants';
import OptionButton from '@/features/student/onboarding/components/OptionButton';
import { showToast } from '@/features/student/scrap/components/Notification';
import { putMe } from '@/apis/controller/student';
import { TanstackQueryClient } from '@/apis/client';
import { useQueryClient } from '@tanstack/react-query';

const EditScoreScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<MenuStackParamList, 'EditScore'>) => {
  const queryClient = useQueryClient();
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
    const { isSuccess } = await putMe({ level: level });
    if (isSuccess) {
      await queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/me').queryKey,
      });
      navigation.goBack();
      showToast('success', '성적이 변경되었습니다.');
    }
  };

  return (
    <EditScreenLayout
      title='최근 공식 수학 성적을 선택해 주세요.'
      description='가장 최근에 응시한 수능/모의고사 성적을 입력하면 실력을 더 정확히 파악할 수 있어요.'
      onPressCTA={handleSave}
      ctaDisabled={!level}>
      <View>
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
    </EditScreenLayout>
  );
};

export default EditScoreScreen;
