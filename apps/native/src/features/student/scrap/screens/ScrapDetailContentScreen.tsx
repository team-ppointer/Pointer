import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  LayoutChangeEvent,
  Modal,
  Dimensions,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, X, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Container, SegmentedControl, TextButton } from '@/components/common';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { useGetScrapDetail } from '@/apis';
import { LoadingScreen } from '@/components/common';
import ProblemViewer from '../../problem/components/ProblemViewer';
import { useNoteStore, Note } from '@/stores/scrapNoteStore';
import { toAlphabetSequence } from '../utils/toAlphabetSequence';
import { components } from '@/types/api/schema';

type ScrapDetailContentRouteProp = RouteProp<StudentRootStackParamList, 'ScrapContentDetail'>;

const ScrapContentDetailScreen = () => {
  const route = useRoute<ScrapDetailContentRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const { id } = route.params;

  const { data: scrapDetail, isLoading } = useGetScrapDetail(Number(id));

  const { openNotes, activeNoteId, setActiveNote, closeNote, reorderNotes } = useNoteStore();
  const [tabLayouts, setTabLayouts] = useState<Record<number, { x: number; width: number }>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, { comment: boolean }>>(
    {}
  );
  const [selectedFilter, setSelectedFilter] = useState<number>(0); // 0: 전체, 1: 문제, 2+: 포인팅 인덱스
  const [isProblemExpanded, setIsProblemExpanded] = useState(false);
  const [isHoveringProblem, setIsHoveringProblem] = useState(false);

  useEffect(() => {
    if (activeNoteId && activeNoteId !== Number(id)) {
      navigation.setParams({ id: String(activeNoteId) });
    }
  }, [activeNoteId, id, navigation]);

  if (isLoading) {
    return <LoadingScreen label='스크랩을 불러오고 있습니다.' />;
  }

  if (!scrapDetail) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>스크랩을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const scrap = scrapDetail;

  // 필터 옵션 생성
  const filterOptions = useMemo(() => {
    const options = ['전체', '문제'];
    if (scrap.pointings && scrap.pointings.length > 0) {
      scrap.pointings.forEach((_, idx) => {
        options.push(`포인팅 ${toAlphabetSequence(idx)}`);
      });
    }
    return options;
  }, [scrap.pointings]);

  // 필터에 따른 표시 여부 결정
  const shouldShowProblem = selectedFilter === 0 || selectedFilter === 1;
  const shouldShowPointing = (pointingIndex: number) => {
    if (selectedFilter === 0) return true; // 전체
    if (selectedFilter === 1) return false; // 문제만
    return selectedFilter === pointingIndex + 2; // 특정 포인팅만
  };

  // 표시할 포인팅이 있는지 확인
  const hasVisiblePointings = useMemo(() => {
    if (!scrap.pointings || scrap.pointings.length === 0) return false;
    if (selectedFilter === 1) return false; // 문제만 선택 시 포인팅 숨김
    if (selectedFilter === 0) return true; // 전체 선택 시 포인팅 표시
    // 특정 포인팅 선택 시 해당 포인팅이 존재하는지 확인
    const pointingIndex = selectedFilter - 2;
    return pointingIndex >= 0 && pointingIndex < scrap.pointings.length;
  }, [scrap.pointings, selectedFilter]);

  // 스크랩 데이터를 AllPointings에 전달할 형식으로 변환
  const convertScrapToGroup = useCallback(():
    | components['schemas']['PublishProblemGroupResp']
    | null => {
    if (!scrap.problem) return null;

    // PointingResp를 PointingWithFeedbackResp로 변환
    const pointingsWithFeedback: components['schemas']['PointingWithFeedbackResp'][] =
      scrap.pointings?.map((pointing) => ({
        id: pointing.id,
        no: pointing.no,
        questionContent: pointing.questionContent,
        commentContent: pointing.commentContent,
        concepts: pointing.concepts,
        isUnderstood: undefined, // 스크랩에서는 피드백 정보가 없음
      })) || [];

    // ProblemExtendResp를 ProblemWithStudyInfoResp로 변환
    const problemWithStudyInfo: components['schemas']['ProblemWithStudyInfoResp'] = {
      id: scrap.problem.id,
      problemType: scrap.problem.problemType,
      parentProblem: scrap.problem.parentProblem,
      parentProblemTitle: scrap.problem.parentProblemTitle,
      customId: scrap.problem.customId,
      createType: scrap.problem.createType,
      practiceTest: scrap.problem.practiceTest,
      practiceTestNo: scrap.problem.practiceTestNo,
      problemContent: scrap.problem.problemContent,
      title: scrap.problem.title,
      answerType: scrap.problem.answerType,
      answer: scrap.problem.answer,
      difficulty: scrap.problem.difficulty,
      recommendedTimeSec: scrap.problem.recommendedTimeSec,
      memo: scrap.problem.memo,
      concepts: scrap.problem.concepts,
      mainAnalysisImage: scrap.problem.mainAnalysisImage,
      mainHandAnalysisImage: scrap.problem.mainHandAnalysisImage,
      readingTipContent: scrap.problem.readingTipContent,
      oneStepMoreContent: scrap.problem.oneStepMoreContent,
      pointings: pointingsWithFeedback,
      progress: 'NONE', // 스크랩에서는 진행 상태가 없음
      submitAnswer: 0, // 스크랩에서는 제출 답안이 없음
      isCorrect: false, // 스크랩에서는 정답 여부가 없음
      isDone: false, // 스크랩에서는 완료 여부가 없음
      childProblems: [], // 스크랩에는 childProblems가 없음
    };

    return {
      no: 1, // 스크랩에서는 번호가 없으므로 1로 설정
      problemId: scrap.problem.id,
      progress: 'DONE', // 스크랩된 문제는 완료된 것으로 간주
      problem: problemWithStudyInfo,
      childProblems: [],
    };
  }, [scrap]);

  // 전체보기 버튼 클릭 핸들러
  const handleViewAllPointings = useCallback(() => {
    const group = convertScrapToGroup();
    if (!group) return;

    navigation.navigate('AllPointings', {
      group,
      problemSetTitle: scrap.name || '스크랩',
    });
  }, [convertScrapToGroup, navigation, scrap.name]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F4F7' }}>
      <SafeAreaView edges={['top']} className='bg-gray-100'>
        <Container className='flex-row items-center justify-between bg-gray-100 py-[14px]'>
          {navigation.canGoBack() && (
            <Pressable
              onPress={() => navigation.goBack()}
              className='p-2 md:right-[48px] lg:right-[96px]'>
              <View className='items-center justify-center gap-[10px]'>
                <ChevronLeft className='text-black' size={32} />
              </View>
            </Pressable>
          )}
          <Text className='text-20b text-gray-900'>{scrap.name || '스크랩 상세'}</Text>
          <View className='h-[48px] w-[48px]' />
        </Container>
        {openNotes.length > 0 && (
          <View className='flex-row border-b border-gray-300 bg-gray-50'>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className='flex-row'>
              {openNotes.map((note, index) => (
                <DraggableTab
                  key={note.id}
                  note={note}
                  index={index}
                  isActive={note.id === activeNoteId}
                  onPress={() => setActiveNote(note.id)}
                  onClose={() => closeNote(note.id)}
                  onLayout={(event: LayoutChangeEvent) => {
                    const { x, width } = event.nativeEvent.layout;
                    setTabLayouts((prev) => ({ ...prev, [note.id]: { x, width } }));
                  }}
                  onDragEnd={(fromIndex, toIndex) => {
                    reorderNotes(fromIndex, toIndex);
                  }}
                  tabLayouts={tabLayouts}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </SafeAreaView>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <ScrollView style={{ flex: 1 }} className='p-4'>
          <View className='gap-6'>
            {/* 필터 버튼 및 전체보기 */}
            {filterOptions.length > 0 && (
              <View className='gap-3 rounded-lg bg-white p-4'>
                <SegmentedControl
                  options={filterOptions}
                  selectedIndex={selectedFilter}
                  onChange={setSelectedFilter}
                />
                {scrap.pointings && scrap.pointings.length > 0 && scrap.problem && (
                  <View className='items-end'>
                    <TextButton variant='outline' onPress={handleViewAllPointings}>
                      전체보기
                    </TextButton>
                  </View>
                )}
              </View>
            )}
            {/* 문제 내용 */}
            {shouldShowProblem && scrap.problem && scrap.problem.problemContent && (
              <View className='gap-4 rounded-lg bg-white p-4'>
                <Text className='text-16b text-[#1E1E21]'>문제 내용</Text>
                <Pressable className='relative' onPress={() => setIsHoveringProblem(true)}>
                  <ProblemViewer
                    problemContent={scrap.problem.problemContent}
                    minHeight={200}
                    padding={20}
                  />
                  {isHoveringProblem != true && (
                    <Pressable
                      onPress={() => setIsProblemExpanded(true)}
                      className='absolute right-2 top-2 z-10 rounded-full bg-black/50 p-2'>
                      <Maximize2 size={20} color='#FFFFFF' />
                    </Pressable>
                  )}
                </Pressable>
              </View>
            )}
            {/* 포인팅 */}
            {hasVisiblePointings && (
              <View className='gap-4 rounded-lg bg-white p-4'>
                <Text className='text-16b text-[#1E1E21]'>포인팅</Text>
                <View className='gap-4'>
                  {scrap.pointings.map((pointing, idx) => {
                    if (!shouldShowPointing(idx)) return null;
                    const sectionKey = `pointing-${pointing.id}`;
                    const isCommentExpanded = expandedSections[sectionKey]?.comment ?? false;

                    return (
                      <View key={pointing.id} className='gap-3 rounded-lg bg-gray-100 p-4'>
                        <View className='flex-row items-center gap-[10px]'>
                          <Text className='text-16sb text-black'>
                            포인팅 {toAlphabetSequence(idx)}
                          </Text>
                          <Text className='text-14m text-gray-500'>포인팅 질문</Text>
                        </View>
                        {pointing.questionContent && (
                          <View className='gap-2'>
                            <ProblemViewer problemContent={pointing.questionContent} padding={16} />
                          </View>
                        )}
                        {pointing.concepts && pointing.concepts.length > 0 && (
                          <View className='flex-row flex-wrap gap-1'>
                            {pointing.concepts.map((concept) => (
                              <View key={concept.id} className='rounded-full bg-blue-100 px-2 py-1'>
                                <Text className='text-12r text-blue-700'>{concept.name}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                        {pointing.commentContent && (
                          <View className='gap-2'>
                            <Pressable
                              onPress={() => {
                                setExpandedSections((prev) => ({
                                  ...prev,
                                  [sectionKey]: {
                                    ...prev[sectionKey],
                                    comment: !isCommentExpanded,
                                  },
                                }));
                              }}
                              className='flex-row items-end'>
                              {isCommentExpanded ? (
                                <ChevronUp size={16} color='#6B7280' />
                              ) : (
                                <ChevronDown size={16} color='#6B7280' />
                              )}
                            </Pressable>
                            {isCommentExpanded && (
                              <ProblemViewer
                                problemContent={pointing.commentContent}
                                minHeight={100}
                                padding={16}
                              />
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
        <View style={{ flex: 1, backgroundColor: '#F2F4F7' }} />
      </View>

      {/* 문제 확대 모달 */}
      {scrap.problem && scrap.problem.problemContent && (
        <Modal
          visible={isProblemExpanded}
          transparent={true}
          animationType='fade'
          onRequestClose={() => setIsProblemExpanded(false)}>
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => setIsProblemExpanded(false)}>
            <Pressable
              style={{
                width: Dimensions.get('window').width * 0.8,
                height: Dimensions.get('window').height * 0.8,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                padding: 20,
              }}
              onPress={(e) => e.stopPropagation()}>
              <View className='mb-4 flex-row items-center justify-between'>
                <Text className='text-18b text-[#1E1E21]'>문제 내용</Text>
                <Pressable
                  onPress={() => {
                    setIsProblemExpanded(false);
                    setIsHoveringProblem(false);
                  }}
                  className='rounded-full bg-gray-200 p-2'>
                  <X size={20} color='#3E3F45' />
                </Pressable>
              </View>
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
                <ProblemViewer
                  problemContent={scrap.problem.problemContent}
                  minHeight={400}
                  padding={20}
                />
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

interface DraggableTabProps {
  note: Note;
  index: number;
  isActive: boolean;
  onPress: () => void;
  onClose: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
  onDragEnd: (fromIndex: number, toIndex: number) => void;
  tabLayouts: Record<number, { x: number; width: number }>;
}

const DraggableTab = ({
  note,
  index,
  isActive,
  onPress,
  onClose,
  onLayout,
  onDragEnd,
  tabLayouts,
}: DraggableTabProps) => {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const { openNotes } = useNoteStore();

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      runOnJS(setIsDragging)(true);
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
    })
    .onEnd((e) => {
      const finalX = startX.value + e.translationX;
      const currentLayout = tabLayouts[note.id];

      if (!currentLayout) {
        translateX.value = withSpring(0);
        runOnJS(setIsDragging)(false);
        return;
      }

      // 드래그된 위치를 기반으로 새로운 인덱스 계산
      const newPosition = currentLayout.x + finalX;
      let newIndex = index;

      // 다른 탭들의 위치와 비교하여 새로운 인덱스 결정
      openNotes.forEach((otherNote, otherIndex) => {
        const otherLayout = tabLayouts[otherNote.id];
        if (otherLayout && otherIndex !== index) {
          const otherCenter = otherLayout.x + otherLayout.width / 2;
          const currentCenter = currentLayout.x + currentLayout.width / 2 + finalX;

          if (otherIndex < index && currentCenter < otherCenter) {
            newIndex = Math.min(newIndex, otherIndex);
          } else if (otherIndex > index && currentCenter > otherCenter) {
            newIndex = Math.max(newIndex, otherIndex + 1);
          }
        }
      });

      newIndex = Math.max(0, Math.min(newIndex, openNotes.length - 1));

      if (newIndex !== index) {
        runOnJS(onDragEnd)(index, newIndex);
      }

      translateX.value = withSpring(0);
      runOnJS(setIsDragging)(false);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        onLayout={onLayout}
        style={animatedStyle}
        className={`flex-row items-center gap-2 border-b-2 px-4 py-2 ${
          isActive ? 'border-blue-500 bg-white' : 'border-transparent bg-gray-50'
        }`}>
        <Pressable onPress={onPress} className='flex-1 flex-row items-center gap-2'>
          <Text
            className={`text-14m ${isActive ? 'text-gray-900' : 'text-gray-600'}`}
            numberOfLines={1}
            style={{ maxWidth: 120 }}>
            {note.title}
          </Text>
        </Pressable>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className='items-center justify-center rounded-full bg-gray-300 p-0.5'>
          <X size={14} color='#3E3F45' />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
};

export default ScrapContentDetailScreen;
