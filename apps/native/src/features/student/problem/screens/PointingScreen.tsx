import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, Animated, LayoutChangeEvent, ScrollView, Text, View } from 'react-native';
import { Container } from '@components/common';
import BottomActionBar from '../components/BottomActionBar';
import Header from '../components/Header';
import { BookmarkIcon, MessageCircleMoreIcon } from 'lucide-react-native';
import { colors } from '@theme/tokens';
import { StudentRootStackParamList } from '@navigation/student/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { postPointing, useToggleScrapFromPointing } from '@apis/student';
import {
  selectCurrentProblem,
  selectCurrentPointing,
  selectChildIndex,
  selectGroup,
  selectInitialized,
  selectPhase,
  selectPublishAt,
  selectPublishId,
  useProblemSessionStore,
} from '@stores/problemSessionStore';
import { useInvalidateStudyData } from '@hooks';
import ProblemViewer from '../components/ProblemViewer';

const PointingScreen = ({
  navigation,
}: Partial<NativeStackScreenProps<StudentRootStackParamList, 'Pointing'>>) => {
  const [bottomBarHeight, setBottomBarHeight] = useState(0);
  const [hasSubmittedUnderstanding, setHasSubmittedUnderstanding] = useState(false);
  const [isSubmittingUnderstanding, setIsSubmittingUnderstanding] = useState(false);
  const [isScraped, setIsScraped] = useState(false);
  const scrapAnimValue = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const phase = useProblemSessionStore(selectPhase);
  const problem = useProblemSessionStore(selectCurrentProblem);
  const pointing = useProblemSessionStore(selectCurrentPointing);
  const initialized = useProblemSessionStore(selectInitialized);
  const group = useProblemSessionStore(selectGroup);
  const childIndex = useProblemSessionStore(selectChildIndex);
  const publishId = useProblemSessionStore(selectPublishId);
  const publishAt = useProblemSessionStore(selectPublishAt);
  const pointingIndex = useProblemSessionStore((state) => state.pointingIndex);
  const pointingTarget = useProblemSessionStore((state) => state.pointingTarget);
  const nextPointing = useProblemSessionStore((state) => state.nextPointing);
  const resetSession = useProblemSessionStore((state) => state.reset);
  const { invalidateStudyData } = useInvalidateStudyData();
  const toggleScrapMutation = useToggleScrapFromPointing();

  // Scrap animation interpolation
  const scrapBgColor = scrapAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors['gray-200'], colors['gray-400']],
  });

  const total = useMemo(() => {
    if (!group || pointingTarget == null) {
      return 0;
    }
    if (pointingTarget === 'MAIN') {
      return group.problem.pointings?.length ?? 0;
    }
    const child = group.childProblems?.[childIndex];
    return child?.pointings?.length ?? 0;
  }, [childIndex, group, pointingTarget]);

  const index = pointingIndex;

  const problemTitle = useMemo(() => {
    if (!group) {
      return '';
    }
    if (phase === 'MAIN_POINTINGS') {
      return `실전 문제 ${group.no}번`;
    }
    if (phase === 'CHILD_POINTINGS') {
      const order = childIndex >= 0 ? childIndex + 1 : 0;
      return order > 0 ? `연습 문제 ${order}번` : '연습 문제';
    }
    return '';
  }, [childIndex, group, phase]);

  const redirectToHome = useCallback(() => {
    resetSession();
    navigation?.navigate('StudentTabs', { screen: 'Home' });
  }, [navigation, resetSession]);

  const goHome = useCallback(() => {
    resetSession();
    void invalidateStudyData(publishId, publishAt);
    navigation?.reset({
      index: 0,
      routes: [
        {
          name: 'StudentTabs',
          params: { screen: 'Home' },
        },
      ],
    });
  }, [invalidateStudyData, navigation, publishAt, publishId, resetSession]);

  useEffect(() => {
    if (!initialized) {
      return;
    }
    if (
      !group ||
      !problem ||
      !pointing ||
      (phase !== 'CHILD_POINTINGS' && phase !== 'MAIN_POINTINGS')
    ) {
      redirectToHome();
    }
  }, [group, initialized, phase, pointing, problem, redirectToHome]);

  const handleBottomBarLayout = useCallback((event: LayoutChangeEvent) => {
    setBottomBarHeight(event.nativeEvent.layout.height);
  }, []);

  const handleClose = useCallback(() => {
    goHome();
  }, [goHome]);

  useEffect(() => {
    setHasSubmittedUnderstanding(pointing?.isUnderstood != null);
    setIsSubmittingUnderstanding(false);
    // Reset scrap state when pointing changes
    setIsScraped(false);
    scrapAnimValue.setValue(0);
  }, [pointing?.id, scrapAnimValue]);

  const handleUnderstandSelection = useCallback(
    async (isUnderstood: boolean) => {
      if (!pointing?.id || isSubmittingUnderstanding) {
        return;
      }
      try {
        setIsSubmittingUnderstanding(true);
        await postPointing(pointing.id, isUnderstood);
        setHasSubmittedUnderstanding(true);
      } catch (error) {
        console.error('Failed to submit pointing feedback', error);
        Alert.alert('학습 여부를 저장할 수 없어요.', '잠시 후 다시 시도해주세요.');
      } finally {
        setIsSubmittingUnderstanding(false);
      }
    },
    [isSubmittingUnderstanding, pointing?.id]
  );

  const ctaLabel = useMemo(() => {
    if (index + 1 < total) {
      return '다음 포인팅';
    }
    if (phase === 'CHILD_POINTINGS') {
      return '다음 문제';
    }
    if (phase === 'MAIN_POINTINGS') {
      return '해설 보기';
    }
    return '계속';
  }, [index, phase, total]);

  const handleCtaPress = useCallback(() => {
    const prevPhase = useProblemSessionStore.getState().phase;
    nextPointing();
    const nextPhase = useProblemSessionStore.getState().phase;

    if (prevPhase === 'CHILD_POINTINGS' && nextPhase === 'CHILD_PROBLEM') {
      navigation?.replace('Problem');
    } else if (
      (prevPhase === 'CHILD_POINTINGS' || prevPhase === 'MAIN_POINTINGS') &&
      nextPhase === 'ANALYSIS'
    ) {
      navigation?.replace('Analysis');
    }
  }, [navigation, nextPointing]);

  const handleToggleScrap = useCallback(() => {
    if (!pointing?.id || toggleScrapMutation.isPending) {
      return;
    }

    // Optimistic update with animation
    const previousState = isScraped;
    const newScrapState = !previousState;
    setIsScraped(newScrapState);
    Animated.spring(scrapAnimValue, {
      toValue: newScrapState ? 1 : 0,
      useNativeDriver: false,
      tension: 200,
      friction: 20,
    }).start();

    toggleScrapMutation.mutate(
      { pointingId: pointing.id },
      {
        onError: () => {
          // Revert to previous state on error
          setIsScraped(previousState);
          Animated.spring(scrapAnimValue, {
            toValue: previousState ? 1 : 0,
            useNativeDriver: false,
            tension: 200,
            friction: 20,
          }).start();
          Alert.alert('스크랩 실패', '잠시 후 다시 시도해주세요.');
        },
      }
    );
  }, [pointing?.id, isScraped, scrapAnimValue, toggleScrapMutation]);

  const pointingIndexLabel = total > 0 && index >= 0 ? `포인팅 ${index + 1}/${total}` : '';

  return (
    <View className='flex-1'>
      <SafeAreaView className='flex-1' edges={['top']}>
        <Header onClose={handleClose}>
          <Header.TitleGroup>
            <Header.Title variant='accent'>{pointingIndexLabel}</Header.Title>
            <Header.Title variant='secondary'>{problemTitle}</Header.Title>
          </Header.TitleGroup>
        </Header>
        <ScrollView>
          <Container className='flex-1 pb-[32px]'>
            <View className='my-[10px] overflow-hidden rounded-[8px] bg-white'>
              <ProblemViewer
                problemContent={problem?.problemContent ?? ''}
                minHeight={200}
                padding={20}
              />
            </View>

            <View className='mt-[10px] flex flex-col rounded-[8px] border border-gray-400 bg-gray-200'>
              <View className='flex-row gap-[10px] rounded-[8px] border-b border-gray-400 bg-white px-[12px] py-[14px]'>
                <View className='h-[32px] w-[32px] items-center justify-center'>
                  <Text className='text-32b text-primary-500 leading-[35px]'>?</Text>
                </View>
                <View className='flex-1'>
                  <Text className='text-13b text-gray-900'>포인팅</Text>
                  <ProblemViewer problemContent={pointing?.questionContent ?? ''} />
                </View>
              </View>
              <View className='ml-[42px] px-[12px] py-[14px]'>
                <ProblemViewer problemContent={pointing?.commentContent ?? ''} />
              </View>
            </View>
          </Container>
        </ScrollView>
        <BottomActionBar bottomInset={insets.bottom} onLayout={handleBottomBarLayout}>
          <BottomActionBar.Button
            animatedStyle={{ backgroundColor: scrapBgColor }}
            onPress={handleToggleScrap}>
            <BookmarkIcon
              size={22}
              color={isScraped ? colors['primary-500'] : colors['gray-700']}
              fill={isScraped ? colors['primary-500'] : 'transparent'}
            />
          </BottomActionBar.Button>
          {/* <BottomActionBar.Button className='bg-gray-200' onPress={() => {}}>
            <MessageCircleMoreIcon size={22} color={colors['gray-700']} />
          </BottomActionBar.Button> */}
          {hasSubmittedUnderstanding ? (
            <BottomActionBar.Button
              className='bg-primary-500 h-[42px]'
              containerStyle={{ flex: 1 }}
              onPress={handleCtaPress}>
              <Text className='text-16m text-white'>{ctaLabel}</Text>
            </BottomActionBar.Button>
          ) : (
            <View className='flex-1 flex-row gap-[10px]'>
              <BottomActionBar.Button
                className={`bg-primary-200 h-[42px] ${isSubmittingUnderstanding ? 'opacity-60' : ''}`}
                containerStyle={{ flex: 1 }}
                disabled={isSubmittingUnderstanding}
                onPress={() => handleUnderstandSelection(true)}>
                <Text className='text-16m text-black'>네</Text>
              </BottomActionBar.Button>
              <BottomActionBar.Button
                className={`bg-primary-500 h-[42px] ${isSubmittingUnderstanding ? 'opacity-60' : ''}`}
                containerStyle={{ flex: 1 }}
                disabled={isSubmittingUnderstanding}
                onPress={() => handleUnderstandSelection(false)}>
                <Text className='text-16m text-white'>아니오</Text>
              </BottomActionBar.Button>
            </View>
          )}
        </BottomActionBar>
      </SafeAreaView>
    </View>
  );
};

export default PointingScreen;
