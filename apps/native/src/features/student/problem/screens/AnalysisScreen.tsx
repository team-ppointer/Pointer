import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, Animated, type LayoutChangeEvent, ScrollView, Text, View } from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { BookmarkIcon, MessageCircleMoreIcon, StarIcon } from 'lucide-react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { colors, shadow } from '@theme/tokens';
import { type StudentRootStackParamList } from '@navigation/student/types';
import { Container } from '@components/common';
import {
  useGetScrapStatusById,
  useToggleScrapFromProblem,
  useToggleScrapFromReadingTip,
  useToggleScrapFromOneStepMore,
} from '@apis/student';
import {
  selectCurrentProblem,
  selectGroup,
  selectInitialized,
  selectPublishAt,
  selectPublishId,
  useProblemSessionStore,
} from '@stores/problemSessionStore';
import useInvalidateStudyData from '@hooks/useInvalidateStudyData';
import { TrackedAnimatedPressable } from '@/features/student/analytics';

import Header from '../components/Header';
import BottomActionBar from '../components/BottomActionBar';
import { formatPublishDateLabel } from '../utils/formatters';
import ProblemViewer from '../components/ProblemViewer';

const AnalysisScreen = ({
  navigation,
}: Partial<NativeStackScreenProps<StudentRootStackParamList, 'Analysis'>>) => {
  const [bottomBarHeight, setBottomBarHeight] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isScraped, setIsScraped] = useState(false);
  const [isReadingTipScraped, setIsReadingTipScraped] = useState(false);
  const [isOneStepMoreScraped, setIsOneStepMoreScraped] = useState(false);
  const scrapAnimValue = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const problem = useProblemSessionStore(selectCurrentProblem);
  const group = useProblemSessionStore(selectGroup);
  const initialized = useProblemSessionStore(selectInitialized);
  const publishId = useProblemSessionStore(selectPublishId);
  const publishAt = useProblemSessionStore(selectPublishAt);
  const resetSession = useProblemSessionStore((state) => state.reset);
  const { invalidateStudyData } = useInvalidateStudyData();
  const toggleScrapMutation = useToggleScrapFromProblem();
  const toggleReadingTipScrapMutation = useToggleScrapFromReadingTip();
  const toggleOneStepMoreScrapMutation = useToggleScrapFromOneStepMore();
  const { data: scrapStatusData } = useGetScrapStatusById(problem?.id ?? 0, !!problem?.id);

  // Scrap animation interpolation
  const scrapBgColor = scrapAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors['gray-200'], colors['gray-400']],
  });

  const publishDateLabel = useMemo(() => formatPublishDateLabel(publishAt), [publishAt]);

  const mainProblemLabel = useMemo(() => {
    if (!group) {
      return '';
    }
    return `실전문제 ${group.no}번`;
  }, [group]);

  const subtitle = publishDateLabel ?? '';

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
    if (!group || !problem) {
      redirectToHome();
    }
  }, [group, initialized, problem, redirectToHome]);

  useEffect(() => {
    setSelectedTab(0);
  }, [problem?.id]);

  // Sync scrap state with fetched data
  useEffect(() => {
    const isProblemScrapped = scrapStatusData?.isProblemScrapped ?? false;
    setIsScraped(isProblemScrapped);
    scrapAnimValue.setValue(isProblemScrapped ? 1 : 0);
  }, [scrapStatusData?.isProblemScrapped, scrapAnimValue]);

  // Sync reading tip scrap state
  useEffect(() => {
    const isReadingTipScrapped = scrapStatusData?.isReadingTipScrapped ?? false;
    setIsReadingTipScraped(isReadingTipScrapped);
  }, [scrapStatusData?.isReadingTipScrapped]);

  // Sync one step more scrap state
  useEffect(() => {
    const isOneStepMoreScrapped = scrapStatusData?.isOneStepMoreScrapped ?? false;
    setIsOneStepMoreScraped(isOneStepMoreScrapped);
  }, [scrapStatusData?.isOneStepMoreScrapped]);

  const handleBottomBarLayout = useCallback((event: LayoutChangeEvent) => {
    setBottomBarHeight(event.nativeEvent.layout.height);
  }, []);

  const handleClose = useCallback(() => {
    goHome();
  }, [goHome]);

  const handlePrimaryAction = useCallback(() => {
    goHome();
  }, [goHome]);

  const handleToggleScrap = useCallback(() => {
    if (!problem?.id || toggleScrapMutation.isPending) {
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
      { problemId: problem.id },
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
  }, [problem?.id, isScraped, scrapAnimValue, toggleScrapMutation]);

  const handleToggleReadingTipScrap = useCallback(() => {
    if (!problem?.id || toggleReadingTipScrapMutation.isPending) {
      return;
    }

    // Optimistic update
    const previousState = isReadingTipScraped;
    const newScrapState = !previousState;
    setIsReadingTipScraped(newScrapState);

    toggleReadingTipScrapMutation.mutate(
      { problemId: problem.id },
      {
        onError: () => {
          setIsReadingTipScraped(previousState);
          Alert.alert('스크랩 실패', '잠시 후 다시 시도해주세요.');
        },
      }
    );
  }, [problem?.id, isReadingTipScraped, toggleReadingTipScrapMutation]);

  const handleToggleOneStepMoreScrap = useCallback(() => {
    if (!problem?.id || toggleOneStepMoreScrapMutation.isPending) {
      return;
    }

    // Optimistic update
    const previousState = isOneStepMoreScraped;
    const newScrapState = !previousState;
    setIsOneStepMoreScraped(newScrapState);

    toggleOneStepMoreScrapMutation.mutate(
      { problemId: problem.id },
      {
        onError: () => {
          setIsOneStepMoreScraped(previousState);
          Alert.alert('스크랩 실패', '잠시 후 다시 시도해주세요.');
        },
      }
    );
  }, [problem?.id, isOneStepMoreScraped, toggleOneStepMoreScrapMutation]);

  const primaryButtonLabel = '학습 완료';

  const tipText = problem?.oneStepMoreContent || '1등급 TIP이 없습니다.';
  const readingTipText = problem?.readingTipContent || '읽기 팁이 없습니다.';
  const oneStepMoreText = problem?.oneStepMoreContent || '추가 학습 내용이 없습니다.';
  const explanationText = problem?.oneStepMoreContent || '해설이 준비 중입니다.';

  return (
    <View className='flex-1'>
      <SafeAreaView className='flex-1' edges={['top']}>
        <Header onClose={handleClose}>
          <Header.TitleGroup>
            <Header.Title variant='accent'>{mainProblemLabel}</Header.Title>
          </Header.TitleGroup>
        </Header>
        <Container>
          <SegmentedControl
            values={['분석', '해설']}
            selectedIndex={selectedTab}
            onChange={(event) => setSelectedTab(event.nativeEvent.selectedSegmentIndex)}
            appearance='light'
            style={{ height: 40 }}
            fontStyle={{ fontSize: 14, fontWeight: '500' }}
            activeFontStyle={{ fontSize: 14, fontWeight: '600' }}
          />
        </Container>
        <View className='flex-1 overflow-hidden'>
          <Container className='flex-1 flex-col gap-[20px] pb-[32px] pt-[20px] md:flex-row'>
            <View className='md:flex-1'>
              <View
                className='rounded-[8px] border border-gray-500 bg-white p-[14px]'
                style={shadow[100]}>
                <View className='mb-[6px] flex-row justify-between gap-[10px]'>
                  <Text className='text-16sb text-gray-600'>문제 본문</Text>
                  <TrackedAnimatedPressable
                    buttonId={isScraped ? 'remove_scrap' : 'add_scrap'}
                    className='h-[32px] w-[32px] items-center justify-center'
                    onPress={handleToggleScrap}>
                    <BookmarkIcon
                      size={20}
                      color={isScraped ? colors['gray-800'] : colors['gray-600']}
                      fill={isScraped ? colors['gray-800'] : 'transparent'}
                    />
                  </TrackedAnimatedPressable>
                </View>
                <ProblemViewer
                  problemContent={problem?.problemContent ?? ''}
                  minHeight={200}
                  fontStyle='serif'
                />
              </View>
            </View>

            <ScrollView className='overflow-visible md:flex-1' style={shadow[100]}>
              <View className='mb-[16px] flex-col rounded-[8px] border border-gray-400 bg-white p-[14px]'>
                <View className='mb-[10px] flex-row items-start justify-between'>
                  <View className='bg-primary-100 rounded-[4px] px-[6px] py-[2px]'>
                    <Text className='text-16b text-primary-500'>문제를 읽어내려갈 때</Text>
                  </View>
                  <TrackedAnimatedPressable
                    buttonId={isReadingTipScraped ? 'remove_scrap' : 'add_scrap'}
                    className='h-[32px] w-[32px] items-center justify-center'
                    onPress={handleToggleReadingTipScrap}>
                    <BookmarkIcon
                      size={20}
                      color={isReadingTipScraped ? colors['gray-800'] : colors['gray-600']}
                      fill={isReadingTipScraped ? colors['gray-800'] : 'transparent'}
                    />
                  </TrackedAnimatedPressable>
                </View>
                <ProblemViewer problemContent={readingTipText} />
              </View>
              <View className='flex-col rounded-[8px] border border-gray-400 bg-white p-[14px]'>
                <View className='mb-[10px] flex-row items-start justify-between'>
                  <View className='bg-primary-100 rounded-[4px] px-[6px] py-[2px]'>
                    <Text className='text-16b text-primary-500'>한 걸음 더</Text>
                  </View>
                  <TrackedAnimatedPressable
                    buttonId={isOneStepMoreScraped ? 'remove_scrap' : 'add_scrap'}
                    className='h-[32px] w-[32px] items-center justify-center'
                    onPress={handleToggleOneStepMoreScrap}>
                    <BookmarkIcon
                      size={20}
                      color={isOneStepMoreScraped ? colors['gray-800'] : colors['gray-600']}
                      fill={isOneStepMoreScraped ? colors['gray-800'] : 'transparent'}
                    />
                  </TrackedAnimatedPressable>
                </View>
                <ProblemViewer problemContent={oneStepMoreText} />
              </View>
            </ScrollView>
          </Container>
        </View>
        <BottomActionBar bottomInset={insets.bottom} onLayout={handleBottomBarLayout}>
          {/* <BottomActionBar.Button className='bg-gray-200' onPress={() => {}}>
            <MessageCircleMoreIcon size={22} color={colors['gray-700']} />
          </BottomActionBar.Button> */}
          <BottomActionBar.Button
            className='bg-primary-500 h-[42px]'
            containerStyle={{ flex: 1 }}
            onPress={handlePrimaryAction}>
            <Text className='text-16m text-white'>{primaryButtonLabel}</Text>
          </BottomActionBar.Button>
        </BottomActionBar>
      </SafeAreaView>
    </View>
  );
};

export default AnalysisScreen;
