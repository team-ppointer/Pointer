import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useRef } from 'react';
import { XIcon } from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { client } from '@apis/client';
import {
  ContentInset,
  Header,
  PointerContentView,
  type PointerContentViewHandle,
} from '@components/common';
import { type StudentRootStackParamList } from '@navigation/student/types';
import { type components } from '@schema';
import { useToggleScrapFromPointing } from '@apis/student';

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

  const leftSections = useMemo(() => (group ? buildAllPointingsLeftSections(group) : []), [group]);
  const joined = useMemo(() => (group ? joinPointingsForAnalysis(group) : []), [group]);

  // 모든 문제(main + children)의 pointing scrap 상태를 한 번에 fetch.
  // route params 의 pointing.isScrapped 는 진입 시점 snapshot 이라 toggle 후
  // 재진입하면 stale → 이 query 가 mount 시 fresh 데이터를 제공한다.
  const allProblemIds = useMemo(() => {
    if (!group) return [];
    return [group.problem.id, ...(group.childProblems ?? []).map((c) => c.id)];
  }, [group]);

  const queryClient = useQueryClient();
  const { data: freshScrapIds } = useQuery({
    queryKey: ['allPointingsScrapStatus', ...allProblemIds],
    queryFn: async () => {
      const results = await Promise.all(
        allProblemIds.map((id) =>
          client.GET('/api/student/scrap/by-problem/{problemId}', {
            params: { path: { problemId: id } },
          })
        )
      );
      const ids = new Set<number>();
      for (const res of results) {
        if (res.error || !res.data) {
          // 하나라도 실패하면 불완전한 Set 을 반환하지 않고 throw →
          // useQuery error 상태 → freshScrapIds undefined → pointing.isScrapped fallback
          throw new Error('Failed to fetch scrap status for one or more problems');
        }
        for (const id of (res.data as { scrappedPointingIds?: number[] }).scrappedPointingIds ??
          []) {
          ids.add(id);
        }
      }
      return ids;
    },
    enabled: allProblemIds.length > 0,
  });

  // query 결과 있으면 우선, 로딩 중에는 route params fallback
  const scrappedPointingIds = useMemo(() => {
    if (freshScrapIds) return freshScrapIds;
    const ids = new Set<number>();
    for (const { pointing } of joined) {
      if (pointing.isScrapped) ids.add(pointing.id);
    }
    return ids;
  }, [freshScrapIds, joined]);
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
          onSuccess: (data) => {
            // mutationFn 이 client.POST 의 data 만 destructure 하므로,
            // 서버 에러 시 data 가 undefined 로 resolve 될 수 있음 (throw 안 함).
            if (!data) {
              rightRef.current?.sendBookmarkResult({
                sectionId,
                bookmarked,
                requestId,
                success: false,
              });
              return;
            }
            rightRef.current?.sendBookmarkResult({
              sectionId,
              bookmarked,
              requestId,
              success: true,
            });
            void queryClient.invalidateQueries({
              queryKey: ['allPointingsScrapStatus'],
            });
          },
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
    [toggleScrap, queryClient]
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
