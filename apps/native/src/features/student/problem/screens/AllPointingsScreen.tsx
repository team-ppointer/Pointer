import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Text, View } from 'react-native';
import { AnimatedPressable, Container, SegmentedControl } from '@components/common';
import { StudentRootStackParamList } from '@navigation/student/types';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '@/theme/tokens';
import { ChevronLeftIcon, MessageCircleMoreIcon } from 'lucide-react-native';
import { components } from '@schema';
import ProblemViewer from '../components/ProblemViewer';
import { formatPublishDateLabel } from '../utils/formatters';

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

  const headerTitle = group ? `${group.no}번 포인팅 전체보기` : '포인팅 전체보기';

  const handleClose = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  return (
    <View className='flex-1'>
      <SafeAreaView className='flex-1' edges={['top']}>
        <View className='h-[66px] flex-row items-center justify-between gap-[10px] px-[20px] py-[14px]'>
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
          <Container className='py-[10px]'>
            <SegmentedControl
              options={tabItems.map((item) => item.label)}
              selectedIndex={selectedTab}
              onChange={setSelectedTab}
            />
          </Container>
        ) : null}
        <ScrollView>
          <Container className='flex-1 pb-[32px]'>
            {currentProblem ? (
              <View className='my-[10px] overflow-hidden rounded-[8px] bg-white'>
                <ProblemViewer
                  problemContent={currentProblem.problemContent ?? ''}
                  minHeight={200}
                  padding={20}
                />
              </View>
            ) : (
              <View className='my-[10px] min-h-[160px] items-center justify-center rounded-[8px] border border-dashed border-gray-400 bg-white px-[16px] py-[24px]'>
                <Text className='text-14r text-gray-600'>불러온 포인팅 정보가 없어요.</Text>
              </View>
            )}

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
                    className='mt-[10px] flex flex-col rounded-[8px] border border-gray-400 bg-gray-200'>
                    <View className='flex-row gap-[10px] rounded-[8px] border-b border-gray-400 bg-white px-[12px] py-[14px]'>
                      <View className='h-[32px] w-[32px] items-center justify-center'>
                        <Text className='text-32b text-primary-500 leading-[35px]'>
                          {badgeLabel}
                        </Text>
                      </View>
                      <View className='flex-1'>
                        <View className='flex-row items-center gap-[6px]'>
                          <Text className='text-13b text-gray-900'>포인팅</Text>
                          <View className='h-[12px] w-[2px] bg-gray-400' />
                          <Text className='text-13m text-gray-900'>{currentDescription}</Text>
                        </View>
                        <ProblemViewer problemContent={pointing.questionContent ?? ''} />
                      </View>
                    </View>
                    <View className='ml-[42px] px-[12px] py-[14px]'>
                      <ProblemViewer problemContent={pointing.commentContent ?? ''} />
                    </View>
                  </View>
                );
              })
            )}
          </Container>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default AllPointingsScreen;
