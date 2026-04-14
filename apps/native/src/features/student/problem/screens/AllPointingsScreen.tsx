import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useRef } from 'react';
import { XIcon } from 'lucide-react-native';

import { ContentInset, Header } from '@components/common';
import { type StudentRootStackParamList } from '@navigation/student/types';
import { type components } from '@schema';
import { useGetScrapStatusById, useToggleScrapFromPointing } from '@apis/student';

import {
  PointerContentView,
  type PointerContentViewHandle,
} from '../components/PointerContentView';
import {
  buildAllPointingsLeftSections,
  buildAllPointingsRightSections,
  joinPointingsForAnalysis,
} from '../transforms/contentRendererTransforms';
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

type AllPointingsRouteParams = {
  group: PublishProblemGroupResp;
  publishAt?: string;
  problemSetTitle?: string;
};

const AllPointingsScreen = (props: AllPointingsScreenProps) => {
  const { navigation, route } = props;

  const params = route?.params as AllPointingsRouteParams | undefined;
  const group = params?.group;
  const publishAt = params?.publishAt;

  const publishDateLabel = useMemo(() => formatPublishDateLabel(publishAt), [publishAt]);

  const headerTitle = group?.no != null ? `문제 ${group.no}번 포인팅 전체보기` : '포인팅 전체보기';

  const handleClose = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  const groupProblemId = group?.problem?.id ?? 0;
  const { data: scrapStatus } = useGetScrapStatusById(groupProblemId, !!groupProblemId);

  const scrappedPointingIds = useMemo(
    () => new Set(scrapStatus?.scrappedPointingIds ?? []),
    [scrapStatus]
  );

  const leftSections = useMemo(() => (group ? buildAllPointingsLeftSections(group) : []), [group]);
  const joined = useMemo(() => (group ? joinPointingsForAnalysis(group) : []), [group]);
  const rightSections = useMemo(
    () => buildAllPointingsRightSections({ joined, scrappedPointingIds }),
    [joined, scrappedPointingIds]
  );

  const leftInit = useMemo(
    () => ({
      type: 'init' as const,
      mode: 'overview' as const,
      variant: 'pointing' as const,
      sections: leftSections,
    }),
    [leftSections]
  );
  const rightInit = useMemo(
    () => ({
      type: 'init' as const,
      mode: 'overview' as const,
      variant: 'pointing' as const,
      sections: rightSections,
    }),
    [rightSections]
  );

  const rightRef = useRef<PointerContentViewHandle>(null);
  const toggleScrap = useToggleScrapFromPointing();

  const handleBookmark = useCallback(
    (sectionId: string, bookmarked: boolean, requestId: number) => {
      const match = /^pointing:(\d+)$/.exec(sectionId);
      if (!match) {
        rightRef.current?.sendBookmarkResult({ sectionId, bookmarked, requestId, success: false });
        return;
      }
      const pointingId = Number(match[1]);
      toggleScrap.mutate(
        { pointingId },
        {
          onSuccess: () =>
            rightRef.current?.sendBookmarkResult({
              sectionId,
              bookmarked,
              requestId,
              success: true,
            }),
          onError: () =>
            rightRef.current?.sendBookmarkResult({
              sectionId,
              bookmarked,
              requestId,
              success: false,
            }),
        }
      );
    },
    [toggleScrap]
  );

  if (!params) {
    return (
      <View className='flex-1'>
        <SafeAreaView className='flex-1' edges={['top', 'bottom']}>
          <Header
            title='포인팅 전체보기'
            right={<Header.IconButton icon={XIcon} onPress={() => navigation.goBack()} />}
          />
          <View className='flex-1 items-center justify-center px-[24px]'>
            <Text className='typo-body-1-medium text-gray-600'>
              포인팅 정보를 불러올 수 없어요.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-white'>
      <SafeAreaView className='flex-1' edges={['top']}>
        <Header
          title={headerTitle}
          subtitle={publishDateLabel ?? undefined}
          right={<Header.IconButton icon={XIcon} onPress={handleClose} />}
        />
        <View className='flex-1 overflow-hidden pt-[20px]'>
          <ContentInset className='flex-1 flex-row'>
            <View className='-ml-[20px] flex-1'>
              <PointerContentView initMessage={leftInit} />
            </View>
            <View className='w-px bg-gray-500' />
            <View className='-mr-[20px] flex-1'>
              <PointerContentView
                ref={rightRef}
                initMessage={rightInit}
                onBookmark={handleBookmark}
              />
            </View>
          </ContentInset>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default AllPointingsScreen;
