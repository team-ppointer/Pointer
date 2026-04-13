import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import { XIcon } from 'lucide-react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo } from 'react';

import { type StudentRootStackParamList } from '@navigation/student/types';
import { ContentInset, Header } from '@components/common';
import {
  selectGroup,
  selectInitialized,
  selectPublishAt,
  selectPublishId,
  selectProblemSetTitle,
  useProblemSessionStore,
} from '@stores/problemSessionStore';
import useInvalidateStudyData from '@hooks/useInvalidateStudyData';

import BottomActionBar from '../components/BottomActionBar';
import { PointerContentView } from '../components/PointerContentView';
import { pointingFeedbackQueue } from '../services';
import {
  buildAnalysisOverviewSections,
  joinPointingsForAnalysis,
} from '../transforms/contentRendererTransforms';

const AnalysisScreen = ({
  navigation,
}: Partial<NativeStackScreenProps<StudentRootStackParamList, 'Analysis'>>) => {
  const insets = useSafeAreaInsets();

  const group = useProblemSessionStore(selectGroup);
  const initialized = useProblemSessionStore(selectInitialized);
  const publishId = useProblemSessionStore(selectPublishId);
  const publishAt = useProblemSessionStore(selectPublishAt);
  const problemSetTitle = useProblemSessionStore(selectProblemSetTitle);
  const resetSession = useProblemSessionStore((state) => state.reset);
  const { invalidateStudyData } = useInvalidateStudyData();

  const problemSubtitle = useMemo(() => {
    if (!group) {
      return '';
    }
    return `문제 ${group.no}번`;
  }, [group]);

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
    if (!group) {
      redirectToHome();
    }
  }, [group, initialized, redirectToHome]);

  const handleClose = useCallback(() => {
    goHome();
  }, [goHome]);

  const handlePrimaryAction = useCallback(() => {
    goHome();
  }, [goHome]);

  const queueSnapshot = pointingFeedbackQueue.snapshot();
  const joined = useMemo(() => (group ? joinPointingsForAnalysis(group) : []), [group]);
  const sections = useMemo(
    () =>
      group
        ? buildAnalysisOverviewSections({
            problem: group.problem,
            joined,
            pendingQueueEntries: queueSnapshot,
          })
        : [],
    [group, joined, queueSnapshot]
  );
  const initMessage = useMemo(
    () => ({ type: 'init' as const, mode: 'overview' as const, sections }),
    [sections]
  );

  const primaryButtonLabel = '학습 완료';

  return (
    <View className='flex-1'>
      <SafeAreaView className='flex-1' edges={['top']}>
        <Header
          title={problemSetTitle}
          subtitle={problemSubtitle}
          right={<Header.IconButton icon={XIcon} onPress={handleClose} />}
        />
        <View className='flex-1 overflow-hidden'>
          <ContentInset className='flex-1 flex-col gap-[20px] pb-[32px] pt-[20px]'>
            <PointerContentView initMessage={initMessage} />
          </ContentInset>
        </View>
        <BottomActionBar bottomInset={insets.bottom}>
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
