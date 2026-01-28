import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, ScrollView, Text, View } from 'react-native';
import { AnimatedPressable, Container } from '@components/common';
import { TrackedAnimatedPressable } from '@/analytics';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { StudentRootStackParamList } from '@navigation/student/types';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { colors, shadow } from '@theme/tokens';
import { BookmarkIcon, ChevronLeftIcon, MessageCircleMoreIcon } from 'lucide-react-native';
import { components } from '@schema';
import ProblemViewer from '../components/ProblemViewer';
import { formatPublishDateLabel } from '../utils/formatters';
import {
  useGetScrapStatusById,
  useToggleScrapFromProblem,
  useToggleScrapFromPointing,
} from '@apis/student';

type AllPointingsNavigationProp = NativeStackNavigationProp<
  StudentRootStackParamList,
  'AllPointings'
>;

type AllPointingsRouteProp = RouteProp<StudentRootStackParamList, 'AllPointings'>;

type AllPointingsScreenProps = {
  navigation: AllPointingsNavigationProp;
  route: AllPointingsRouteProp;
};

type PublishProblemGroupResp = components['schemas']['PublishProblemGroupResp'];
type ProblemWithStudyInfoResp = components['schemas']['ProblemWithStudyInfoResp'];
type PointingWithFeedbackResp = components['schemas']['PointingWithFeedbackResp'];

type AllPointingsRouteParams = {
  group: PublishProblemGroupResp;
  publishAt?: string;
  problemSetTitle?: string;
};

type TabItem = {
  key: string;
  label: string;
  description: string;
  problem: ProblemWithStudyInfoResp;
};

const getPointingBadgeLabel = (index: number) => {
  const charCode = 'A'.charCodeAt(0) + index;
  if (charCode <= 'Z'.charCodeAt(0)) {
    return String.fromCharCode(charCode);
  }
  return `${index + 1}`;
};

const AllPointingsScreen = (props: AllPointingsScreenProps) => {
  const { navigation, route } = props;
  const [selectedTab, setSelectedTab] = useState(0);
  const [isProblemScraped, setIsProblemScraped] = useState(false);
  const [scrappedPointingIds, setScrappedPointingIds] = useState<number[]>([]);

  const toggleProblemScrapMutation = useToggleScrapFromProblem();
  const togglePointingScrapMutation = useToggleScrapFromPointing();

  const params = route?.params as AllPointingsRouteParams | undefined;

  if (!params) {
    return (
      <View className='flex-1'>
        <SafeAreaView className='flex-1' edges={['top', 'bottom']}>
          <View className='h-[66px] flex-row items-center justify-between gap-[10px] px-[20px] py-[14px]'>
            <AnimatedPressable className='p-[8px]' onPress={() => navigation.goBack()}>
              <ChevronLeftIcon color={colors.black} size={32} />
            </AnimatedPressable>
            <Text className='text-20b text-primary-600'>포인팅 전체보기</Text>
            <View className='w-[40px]' />
          </View>
          <View className='flex-1 items-center justify-center px-[24px]'>
            <Text className='text-14m text-gray-600'>포인팅 정보를 불러올 수 없어요.</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const { group, publishAt, problemSetTitle } = params;

  const publishDateLabel = useMemo(() => formatPublishDateLabel(publishAt), [publishAt]);

  const tabItems: TabItem[] = useMemo(() => {
    if (!group) {
      return [];
    }
    const childProblems: ProblemWithStudyInfoResp[] = group.childProblems ?? [];
    return [
      {
        key: `main-${group.problem.id}`,
        label: '실전문제',
        description: `실전문제 ${group.no}번`,
        problem: group.problem,
      },
      ...childProblems.map((child, index) => ({
        key: `child-${child.id}-${index}`,
        label: `연습문제 ${index + 1}번`,
        description: `연습문제 ${index + 1}번`,
        problem: child,
      })),
    ];
  }, [group]);

  useEffect(() => {
    setSelectedTab(0);
  }, [group?.problem?.id]);

  useEffect(() => {
    if (selectedTab >= tabItems.length && tabItems.length > 0) {
      setSelectedTab(0);
    }
  }, [selectedTab, tabItems.length]);

  const currentItem = tabItems[selectedTab];
  const currentProblem = currentItem?.problem;
  const currentDescription = currentItem?.description ?? '';
  const pointings: PointingWithFeedbackResp[] = currentProblem?.pointings ?? [];

  // Fetch scrap status for current problem
  const { data: scrapStatusData } = useGetScrapStatusById(
    currentProblem?.id ?? 0,
    !!currentProblem?.id
  );

  // Sync scrap state with fetched data
  useEffect(() => {
    const isProblemScrapped = scrapStatusData?.isProblemScrapped ?? false;
    setIsProblemScraped(isProblemScrapped);
  }, [scrapStatusData?.isProblemScrapped]);

  useEffect(() => {
    const ids = scrapStatusData?.scrappedPointingIds ?? [];
    setScrappedPointingIds(ids);
  }, [scrapStatusData?.scrappedPointingIds]);

  const headerTitle = group ? `${group.no}번 포인팅 전체보기` : '포인팅 전체보기';

  const handleClose = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  const handleToggleProblemScrap = useCallback(() => {
    if (!currentProblem?.id || toggleProblemScrapMutation.isPending) {
      return;
    }

    // Optimistic update
    const previousState = isProblemScraped;
    const newScrapState = !previousState;
    setIsProblemScraped(newScrapState);

    toggleProblemScrapMutation.mutate(
      { problemId: currentProblem.id },
      {
        onError: () => {
          setIsProblemScraped(previousState);
          Alert.alert('스크랩 실패', '잠시 후 다시 시도해주세요.');
        },
      }
    );
  }, [currentProblem?.id, isProblemScraped, toggleProblemScrapMutation]);

  const handleTogglePointingScrap = useCallback(
    (pointingId: number) => {
      if (togglePointingScrapMutation.isPending) {
        return;
      }

      // Optimistic update
      const previousIds = [...scrappedPointingIds];
      const isCurrentlyScraped = scrappedPointingIds.includes(pointingId);
      const newIds = isCurrentlyScraped
        ? scrappedPointingIds.filter((id) => id !== pointingId)
        : [...scrappedPointingIds, pointingId];
      setScrappedPointingIds(newIds);

      togglePointingScrapMutation.mutate(
        { pointingId },
        {
          onError: () => {
            setScrappedPointingIds(previousIds);
            Alert.alert('스크랩 실패', '잠시 후 다시 시도해주세요.');
          },
        }
      );
    },
    [scrappedPointingIds, togglePointingScrapMutation]
  );

  return (
    <View className='flex-1'>
      <SafeAreaView className='flex-1' edges={['top']}>
        <View className='h-[56px] flex-row items-center justify-between gap-[10px] px-[20px] py-[4px]'>
          <AnimatedPressable className='p-[8px]' onPress={handleClose}>
            <ChevronLeftIcon color={colors.black} size={32} />
          </AnimatedPressable>
          <View className='flex-row items-center gap-[8px]'>
            <Text className='text-20b text-primary-600'>{headerTitle}</Text>
            {publishDateLabel ? (
              <Text className='text-20r text-gray-700'>{publishDateLabel}</Text>
            ) : null}
          </View>
          {/* <Pressable className='p-[8px]' onPress={() => {}}>
            <MessageCircleMoreIcon color={colors.black} size={24} />
          </Pressable> */}
          <View className='w-[40px]' />
        </View>
        {tabItems.length > 0 ? (
          <Container className='mb-[20px] py-[4px]'>
            <SegmentedControl
              values={tabItems.map((item) => item.label)}
              selectedIndex={selectedTab}
              onChange={(event) => setSelectedTab(event.nativeEvent.selectedSegmentIndex)}
              appearance='light'
              style={{ height: 40 }}
              fontStyle={{ fontSize: 14, fontWeight: '500' }}
              activeFontStyle={{ fontSize: 14, fontWeight: '600' }}
            />
          </Container>
        ) : null}
        <View className='flex-1 overflow-hidden'>
          <Container className='flex-1 flex-col gap-[20px] pb-[32px] md:flex-row'>
            <View className='md:flex-1'>
              <View
                className='rounded-[8px] border border-gray-500 bg-white p-[14px]'
                style={shadow[100]}>
                <View className='mb-[6px] flex-row justify-between gap-[10px]'>
                  <Text className='text-16sb text-gray-600'>문제 본문</Text>
                  <TrackedAnimatedPressable
                    buttonId={isProblemScraped ? 'remove_scrap' : 'add_scrap'}
                    className='h-[32px] w-[32px] items-center justify-center'
                    onPress={handleToggleProblemScrap}>
                    <BookmarkIcon
                      size={20}
                      color={isProblemScraped ? colors['gray-800'] : colors['gray-600']}
                      fill={isProblemScraped ? colors['gray-800'] : 'transparent'}
                    />
                  </TrackedAnimatedPressable>
                </View>
                <ProblemViewer
                  problemContent={currentProblem?.problemContent ?? ''}
                  minHeight={200}
                  fontStyle='serif'
                />
              </View>
            </View>

            <ScrollView className='overflow-visible md:flex-1' style={shadow[100]}>
              {pointings.length === 0 ? (
                <View className='mt-[10px] rounded-[8px] border border-dashed border-gray-400 bg-gray-50 px-[16px] py-[24px]'>
                  <Text className='text-13m text-center text-gray-700'>
                    {currentProblem
                      ? `${currentDescription}에 등록된 포인팅이 없어요.`
                      : '포인팅을 불러올 수 없어요.'}
                  </Text>
                </View>
              ) : (
                pointings.map((pointing, index) => {
                  const badgeLabel = getPointingBadgeLabel(index);
                  return (
                    <View
                      key={pointing.id ?? `${currentProblem.id}-${index}`}
                      className='mb-[16px] flex flex-col overflow-hidden rounded-[8px] border border-gray-400 bg-gray-200'>
                      <View className='flex-col gap-[6px] border-b border-gray-400 bg-white p-[14px]'>
                        <View className='flex-row items-start justify-between'>
                          <View className='flex-row items-center'>
                            <Text className='text-16b mr-[4px] text-gray-800'>포인팅</Text>
                            <Text className='text-16b text-primary-500 mr-[8px]'>{badgeLabel}</Text>
                            <Text className='text-13m text-gray-700'>포인팅 질문</Text>
                          </View>
                          <TrackedAnimatedPressable
                            buttonId={
                              pointing.id && scrappedPointingIds.includes(pointing.id)
                                ? 'remove_scrap'
                                : 'add_scrap'
                            }
                            className='h-[32px] w-[32px] items-center justify-center'
                            onPress={() => pointing.id && handleTogglePointingScrap(pointing.id)}>
                            <BookmarkIcon
                              size={20}
                              color={
                                pointing.id && scrappedPointingIds.includes(pointing.id)
                                  ? colors['gray-800']
                                  : colors['gray-600']
                              }
                              fill={
                                pointing.id && scrappedPointingIds.includes(pointing.id)
                                  ? colors['gray-800']
                                  : 'transparent'
                              }
                            />
                          </TrackedAnimatedPressable>
                        </View>
                        <ProblemViewer problemContent={pointing?.questionContent ?? ''} />
                      </View>
                      <ProblemViewer problemContent={pointing?.commentContent ?? ''} padding={14} />
                    </View>
                  );
                })
              )}
            </ScrollView>
          </Container>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default AllPointingsScreen;
