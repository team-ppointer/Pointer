import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import {
  type NativeStackNavigationProp,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { Container, AnimatedPressable } from '@components/common';
import { BookHeartIcon, CircleStarIcon, ProfileBasicIcon } from '@components/system/icons';
import { useGetMe, usePutMe, TanstackQueryClient } from '@apis';
import { type MenuStackParamList } from '@navigation/student/MenuNavigator';
import {
  gradeOptions,
  levelOptions,
  mathSubjectOptions,
  type GradeValue,
  type MathSubjectValue,
} from '@features/student/onboarding/constants';
import { showToast } from '@features/student/scrap/components/Notification';
import { ConfirmationModal } from '@/features/student/scrap/components/Dialog/ConfirmationModal';

import { InfoSection, ScreenLayout } from '../../components';

// 컴포넌트 외부에 저장 (리마운트 후에도 유지됨)
type LocalData = {
  name?: string;
  phoneNumber?: string;
  grade?: GradeValue;
  schoolId?: number;
  schoolName?: string;
  sido?: string;
  level?: number;
  selectSubject?: MathSubjectValue;
};

let persistedLocalData: LocalData = {};
let persistedHasLocalChanges = false;
let persistedIsInitialized = false;

const MyInfoScreen = () => {
  const { bottom } = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();
  const route = useRoute<NativeStackScreenProps<MenuStackParamList, 'MyInfo'>['route']>();
  const queryClient = useQueryClient();
  const { data } = useGetMe();
  const { mutate: putMeMutate, isPending } = usePutMe();

  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);

  // 로컬 상태로 모든 정보 관리 (외부 변수에서 초기화)
  const [localData, setLocalData] = useState<LocalData>(persistedLocalData);

  // 초기화 여부를 추적하는 ref
  const isInitialized = useRef(persistedIsInitialized);
  // localData에 변경사항이 있는지 추적하는 ref
  const hasLocalChanges = useRef(persistedHasLocalChanges);

  // API 데이터로 초기화 (한 번만 실행, localData가 비어있을 때만)
  useEffect(() => {
    if (data && !persistedIsInitialized && Object.keys(persistedLocalData).length === 0) {
      const initialData: LocalData = {
        name: data.name,
        phoneNumber: data.phoneNumber,
        grade: data.grade,
        schoolId: data.school?.id,
        schoolName: data.school?.name,
        sido: data.school?.sido,
        level: data.level,
        selectSubject: data.selectSubject,
      };
      persistedLocalData = initialData;
      persistedIsInitialized = true;
      persistedHasLocalChanges = false;
      isInitialized.current = true;
      hasLocalChanges.current = false;
      setLocalData(initialData);
    }
  }, [data]);

  // EditScreen에서 돌아올 때 업데이트된 데이터 반영
  useEffect(() => {
    const updatedData = route.params?.updatedData;
    if (updatedData) {
      // 외부 변수에서 이전 데이터를 가져옴 (리마운트 후에도 유지됨)
      const prevData =
        Object.keys(persistedLocalData).length > 0
          ? persistedLocalData
          : {
              name: data?.name,
              phoneNumber: data?.phoneNumber,
              grade: data?.grade,
              schoolId: data?.school?.id,
              schoolName: data?.school?.name,
              sido: data?.school?.sido,
              level: data?.level,
              selectSubject: data?.selectSubject,
            };

      const newData: LocalData = {
        ...prevData,
        ...updatedData,
      };

      // 외부 변수와 state 모두 업데이트
      persistedLocalData = newData;
      persistedHasLocalChanges = true;
      persistedIsInitialized = true;
      hasLocalChanges.current = true;
      isInitialized.current = true;
      setLocalData(newData);
    }
  }, [route.params?.updatedData, data]);

  useFocusEffect(
    useCallback(() => {
      // 리마운트 후 외부 변수에서 localData 복원
      if (Object.keys(persistedLocalData).length > 0 && Object.keys(localData).length === 0) {
        setLocalData(persistedLocalData);
        isInitialized.current = persistedIsInitialized;
        hasLocalChanges.current = persistedHasLocalChanges;
      }

      // localData에 변경사항이 있으면 API를 다시 불러오지 않음
      if (!persistedHasLocalChanges && Object.keys(persistedLocalData).length === 0) {
        queryClient.invalidateQueries({
          queryKey: TanstackQueryClient.queryOptions('get', '/api/student/me').queryKey,
        });
      }
    }, [queryClient, localData])
  );

  const handleCancel = useCallback(() => {
    setIsConfirmationModalVisible(false);
    setLocalData({});
    persistedLocalData = {};
    persistedHasLocalChanges = false;
    persistedIsInitialized = false;
    isInitialized.current = false;
    hasLocalChanges.current = false;
    navigation.goBack();
  }, []);

  const handleSaveAll = useCallback(() => {
    const updateData: {
      name?: string;
      phoneNumber?: string;
      grade?: 'ONE' | 'TWO' | 'THREE' | 'N_TIME';
      schoolId?: number;
      schoolName?: string;
      sido?: string;
      level?: number;
      selectSubject?: 'MIJUKBUN' | 'HWAKTONG' | 'KEEHA';
    } = {};

    if (localData.name) {
      updateData.name = localData.name;
    }
    if (localData.phoneNumber) {
      updateData.phoneNumber = localData.phoneNumber;
    }
    if (localData.grade) {
      updateData.grade = localData.grade;
    }
    if (localData.schoolId) {
      updateData.schoolId = localData.schoolId;
    }
    if (localData.schoolName) {
      updateData.schoolName = localData.schoolName;
    }
    if (localData.sido) {
      updateData.sido = localData.sido;
    }
    if (localData.level) {
      updateData.level = localData.level;
    }
    if (localData.selectSubject) {
      updateData.selectSubject = localData.selectSubject;
    }

    putMeMutate(updateData, {
      onSuccess: () => {
        showToast('success', '모든 정보가 저장되었습니다.');
        queryClient.invalidateQueries({
          queryKey: TanstackQueryClient.queryOptions('get', '/api/student/me').queryKey,
        });
        // 외부 변수와 state 모두 초기화
        persistedLocalData = {};
        persistedHasLocalChanges = false;
        persistedIsInitialized = false;
        isInitialized.current = false;
        hasLocalChanges.current = false;
        setLocalData({});
        navigation.goBack();
      },

      onError: (error) => {
        showToast('error', error.message || '정보 저장에 실패했습니다.');
      },
    });
  }, [localData, putMeMutate, queryClient]);

  // 변경사항이 있는지 확인
  const hasChanges = useMemo(() => {
    if (!persistedHasLocalChanges && Object.keys(persistedLocalData).length === 0) {
      return false;
    }

    // localData와 data를 비교하여 변경사항 확인
    const hasNameChange = localData.name !== undefined && localData.name !== data?.name;
    const hasPhoneChange =
      localData.phoneNumber !== undefined && localData.phoneNumber !== data?.phoneNumber;
    const hasGradeChange = localData.grade !== undefined && localData.grade !== data?.grade;
    const hasSchoolIdChange =
      localData.schoolId !== undefined && localData.schoolId !== data?.school?.id;
    const hasSchoolNameChange =
      localData.schoolName !== undefined && localData.schoolName !== data?.school?.name;
    const hasSidoChange = localData.sido !== undefined && localData.sido !== data?.school?.sido;
    const hasLevelChange = localData.level !== undefined && localData.level !== data?.level;
    const hasSubjectChange =
      localData.selectSubject !== undefined && localData.selectSubject !== data?.selectSubject;

    return (
      hasNameChange ||
      hasPhoneChange ||
      hasGradeChange ||
      hasSchoolIdChange ||
      hasSchoolNameChange ||
      hasSidoChange ||
      hasLevelChange ||
      hasSubjectChange
    );
  }, [localData, data]);

  const saveButton = (
    <AnimatedPressable
      onPress={handleSaveAll}
      disabled={isPending || !hasChanges}
      className={`items-center justify-center pr-5 ${isPending || !hasChanges ? 'opacity-50' : ''}`}>
      <Text className={`text-14sm ${isPending || !hasChanges ? 'text-gray-600' : 'text-blue-500'}`}>
        저장하기
      </Text>
    </AnimatedPressable>
  );

  // 표시할 데이터는 로컬 상태를 우선 사용, 없으면 API 데이터 사용
  const displayData = {
    name: localData.name ?? data?.name ?? '',
    phoneNumber: localData.phoneNumber ?? data?.phoneNumber ?? '',
    grade: localData.grade ?? data?.grade,
    schoolId: localData.schoolId ?? data?.school?.id ?? undefined,
    schoolName: localData.schoolName ?? data?.school?.name ?? '',
    sido: localData.sido ?? data?.school?.sido ?? '',
    level: localData.level ?? data?.level,
    selectSubject: localData.selectSubject ?? data?.selectSubject,
  };

  const providerFormatter = (provider: string | undefined) => {
    switch (provider) {
      case 'KAKAO':
        return '카카오';
      case 'APPLE':
        return '애플';
      case 'GOOGLE':
        return '구글';
      default:
        return '이메일';
    }
  };

  return (
    <>
      <ScreenLayout
        title='내 정보'
        rightElement={saveButton}
        onPressBack={() => {
          if (hasChanges) {
            setIsConfirmationModalVisible(true);
            return;
          }
          navigation.goBack();
        }}>
        <ScrollView className='flex-1 bg-blue-100 pt-[10px]' contentContainerClassName='flex-grow'>
          <Container className='-mt-[100%] gap-[28px] bg-gray-100 pt-[100%] pb-[24px]'>
            <InfoSection
              icon={<ProfileBasicIcon />}
              title='기본 정보'
              fields={[
                {
                  label: '이름',
                  value: displayData.name,
                  onPress: () => {
                    navigation.navigate('EditNickname', { initialNickname: displayData.name });
                  },
                },
                {
                  label: '휴대폰 번호',
                  value: displayData.phoneNumber,
                  onPress: () => {
                    navigation.navigate('EditPhoneNumber');
                  },
                },
              ]}
            />
            <InfoSection
              icon={<BookHeartIcon />}
              title='학습 정보'
              fields={[
                {
                  label: '학교 · 학년',
                  value: `${displayData.schoolName ? displayData.schoolName + ' ' : ''}${
                    gradeOptions.find((option) => option.value === displayData.grade)?.label || ''
                  }`,
                  onPress: () =>
                    navigation.navigate('EditGrade', {
                      initialGrade: displayData.grade,
                      initialSchool: displayData.schoolId
                        ? {
                            id: displayData.schoolId,
                            name: displayData.schoolName,
                            sido: displayData.sido,
                          }
                        : undefined,
                    }),
                },
                {
                  label: '수학등급',
                  value:
                    levelOptions.find((option) => option.value === displayData.level)?.label || '',
                  onPress: () =>
                    navigation.navigate('EditScore', { initialScore: displayData.level }),
                },
                {
                  label: '선택과목',
                  value:
                    mathSubjectOptions.find((option) => option.value === displayData.selectSubject)
                      ?.label || '',
                  onPress: () =>
                    navigation.navigate('EditMathSubject', {
                      initialMathSubject: displayData.selectSubject,
                    }),
                },
              ]}
            />
          </Container>

          <Container
            className='flex-1 bg-blue-100 pt-[24px]'
            style={{ paddingBottom: 24 + bottom }}>
            <InfoSection
              icon={<CircleStarIcon />}
              title='계정 정보'
              showChevron={false}
              fields={[
                { label: '연동 계정', value: providerFormatter(data?.provider) || '' },
                { label: '이메일', value: data?.email || '' },
              ]}
            />
          </Container>
        </ScrollView>
      </ScreenLayout>
      <ConfirmationModal
        visible={isConfirmationModalVisible}
        onClose={() => setIsConfirmationModalVisible(false)}
        title='변경사항이 있습니다. 저장할까요?'
        description='저장하지 않으면 변경사항이 모두 사라집니다.'
        buttons={[
          { label: '그냥 나가기', onPress: handleCancel, variant: 'default' },
          {
            label: '저장하고 나가기',
            onPress: () => {
              setIsConfirmationModalVisible(false);
            },
            variant: 'primary',
          },
        ]}
      />
    </>
  );
};

export default MyInfoScreen;
