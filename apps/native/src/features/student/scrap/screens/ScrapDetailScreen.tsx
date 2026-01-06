import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  LayoutChangeEvent,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  X,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Save,
  MessageCircleMore,
  Bookmark,
  ChevronRight,
  Undo2,
  Redo2,
  Pencil,
  Type,
} from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  SharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Container, SegmentedControl, TextButton } from '@/components/common';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { useGetHandwriting, useGetScrapDetail, useUpdateHandwriting } from '@/apis';
import { LoadingScreen } from '@/components/common';
import ProblemViewer from '../../problem/components/ProblemViewer';
import { useNoteStore, Note } from '@/features/student/scrap/stores/scrapNoteStore';
import { toAlphabetSequence } from '../utils/formatters/toAlphabetSequence';
import { components } from '@/types/api/schema';
import DrawingCanvas, { DrawingCanvasRef, Stroke, TextItem } from '../utils/skia/drawing';
import { colors } from '@/theme/tokens';
import LottieView from 'lottie-react-native';
import { ChevronDownFilledIcon, PencilFilledIcon } from '@/components/system/icons';
import { IconButton } from '../../problem/components/WritingArea';
import EraserFilledIcon from '@/components/system/icons/EraserFilledIcon';

type ScrapDetailRouteProp = RouteProp<StudentRootStackParamList, 'ScrapContentDetail'>;

const ScrapDetailScreen = () => {
  const route = useRoute<ScrapDetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const { id } = route.params;
  const scrapId = Number(id);

  const { data: scrapDetail, isLoading } = useGetScrapDetail(scrapId, !!id);
  const { data: handwritingData } = useGetHandwriting(scrapId, !!id);
  const { mutate: updateHandwriting, isPending: isSaving } = useUpdateHandwriting();

  const canvasRef = useRef<DrawingCanvasRef>(null);
  const lottieRef = useRef<LottieView>(null);

  const [isEraserMode, setIsEraserMode] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [eraserSize, setEraserSize] = useState(22);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const lastSavedDataRef = useRef<string>('');

  const { openNotes, activeNoteId, setActiveNote, closeNote, reorderNotes } = useNoteStore();
  const [tabLayouts, setTabLayouts] = useState<Record<number, { x: number; width: number }>>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useSharedValue(0);
  const screenWidth = Dimensions.get('window').width;
  // const [expandedSections, setExpandedSections] = useState<Record<string, { comment: boolean }>>(
  //   {}
  // );
  const [selectedFilter, setSelectedFilter] = useState<number>(0); // 0: 전체, 1: 문제, 2+: 포인팅 인덱스
  const [isProblemExpanded, setIsProblemExpanded] = useState(false);
  const [isHoveringProblem, setIsHoveringProblem] = useState(false);

  useEffect(() => {
    if (activeNoteId && activeNoteId !== scrapId) {
      navigation.setParams({ id: String(activeNoteId) });
    }
  }, [activeNoteId, scrapId, navigation]);

  useEffect(() => {
    const playAnimation = () => {
      setTimeout(() => setShowSave(true), 3000);
      lottieRef.current?.reset();
      lottieRef.current?.play();
    };
    const interval = setInterval(playAnimation, 30000);

    return () => clearInterval(interval);
  }, []);

  // undo/redo 상태 변경 핸들러
  const handleHistoryChange = useCallback((canUndoValue: boolean, canRedoValue: boolean) => {
    setCanUndo(canUndoValue);
    setCanRedo(canRedoValue);
    // 변경사항이 있음을 표시
    setHasUnsavedChanges(true);
  }, []);

  // handwriting 데이터를 로드하여 canvas에 설정
  useEffect(() => {
    if (handwritingData?.data && canvasRef.current) {
      try {
        // Base64 디코딩 (React Native에서는 atob 사용)
        const decodedData = decodeURIComponent(escape(atob(handwritingData.data)));
        const data = JSON.parse(decodedData);

        // 이전 형식 호환성: strokes만 있는 경우와 { strokes, texts } 형식 모두 지원
        if (Array.isArray(data)) {
          // 이전 형식: strokes 배열만
          canvasRef.current.setStrokes(data);
          canvasRef.current.setTexts([]);
        } else {
          // 새 형식: { strokes, texts } 객체
          canvasRef.current.setStrokes(data.strokes || []);
          canvasRef.current.setTexts(data.texts || []);
        }

        // 초기 데이터를 저장된 데이터로 설정
        lastSavedDataRef.current = handwritingData.data;
        setHasUnsavedChanges(false);
        // updatedAt 초기화
      } catch (error) {
        console.error('필기 데이터 로드 실패:', error);
      }
    }
  }, [handwritingData]);

  // 저장하기 버튼 핸들러
  const handleSave = useCallback(
    (isAutoSave = false) => {
      const strokes = canvasRef.current?.getStrokes();
      const texts = canvasRef.current?.getTexts();

      try {
        // strokes와 texts를 함께 저장
        const data = {
          strokes: strokes || [],
          texts: texts || [],
        };
        const jsonString = JSON.stringify(data);
        const base64Data = btoa(unescape(encodeURIComponent(jsonString)));

        // 변경사항이 없으면 저장하지 않음
        if (base64Data === lastSavedDataRef.current) {
          if (!isAutoSave) {
            Alert.alert('알림', '변경사항이 없습니다.');
          }
          return;
        }

        updateHandwriting(
          {
            scrapId,
            request: {
              data: base64Data,
            },
          },
          {
            onSuccess: (response) => {
              lastSavedDataRef.current = base64Data;
              setHasUnsavedChanges(false);
              // 응답에서 받은 updatedAt으로 업데이트
              if (response?.updatedAt) {
              }
              if (!isAutoSave) {
                Alert.alert('성공', '필기가 저장되었습니다.');
                setShowSave(true);
                setTimeout(() => setShowSave(false), 2000);
              }
            },
            onError: (error) => {
              console.error('필기 저장 실패:', error);
              if (!isAutoSave) {
                Alert.alert('오류', '필기 저장에 실패했습니다.');
              }
            },
          }
        );
      } catch (error) {
        console.error('필기 데이터 변환 실패:', error);
        if (!isAutoSave) {
          Alert.alert('오류', '필기 데이터 변환에 실패했습니다.');
        }
      }
    },
    [scrapId, updateHandwriting]
  );

  // 10초마다 자동 저장
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && !isSaving) {
        handleSave(true);
      }
    }, 10000); // 10초마다 실행

    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges, isSaving, handleSave]);

  // 포인팅 데이터에 알파벳 레이블 추가 (메모이제이션)
  const pointingsWithLabels = useMemo(() => {
    if (!scrapDetail?.pointings) return [];
    return scrapDetail.pointings.map((pointing, idx) => ({
      ...pointing,
      label: toAlphabetSequence(idx),
    }));
  }, [scrapDetail?.pointings]);

  // 필터 옵션 생성 (scrapDetail이 없어도 Hook은 항상 호출되어야 함)
  const filterOptions = useMemo(() => {
    if (!scrapDetail) return ['전체', '문제'];
    const options = ['스크랩 전체', '문제'];
    if (pointingsWithLabels.length > 0) {
      pointingsWithLabels.forEach((pointing) => {
        options.push(`포인팅 ${pointing.label}`);
      });
    }
    return options;
  }, [scrapDetail, pointingsWithLabels]);

  // 필터에 따른 표시 여부 결정
  const shouldShowProblem = selectedFilter === 0 || selectedFilter === 1;
  const shouldShowPointing = (pointingIndex: number) => {
    if (selectedFilter === 0) return true; // 전체
    if (selectedFilter === 1) return false; // 문제만
    return selectedFilter === pointingIndex + 2; // 특정 포인팅만
  };

  // 표시할 포인팅이 있는지 확인
  const hasVisiblePointings = useMemo(() => {
    if (!scrapDetail?.pointings || scrapDetail.pointings.length === 0) return false;
    if (selectedFilter === 1) return false; // 문제만 선택 시 포인팅 숨김
    if (selectedFilter === 0) return true; // 전체 선택 시 포인팅 표시
    // 특정 포인팅 선택 시 해당 포인팅이 존재하는지 확인
    const pointingIndex = selectedFilter - 2;
    return pointingIndex >= 0 && pointingIndex < scrapDetail.pointings.length;
  }, [scrapDetail?.pointings, selectedFilter]);

  // 스크랩 데이터를 AllPointings에 전달할 형식으로 변환
  const convertScrapToGroup = useCallback(():
    | components['schemas']['PublishProblemGroupResp']
    | null => {
    if (!scrapDetail?.problem) return null;

    // PointingResp를 PointingWithFeedbackResp로 변환
    const pointingsWithFeedback: components['schemas']['PointingWithFeedbackResp'][] =
      scrapDetail.pointings?.map((pointing) => ({
        id: pointing.id,
        no: pointing.no,
        questionContent: pointing.questionContent,
        commentContent: pointing.commentContent,
        concepts: pointing.concepts,
        isUnderstood: undefined, // 스크랩에서는 피드백 정보가 없음
      })) || [];

    // ProblemExtendResp를 ProblemWithStudyInfoResp로 변환
    const problemWithStudyInfo: components['schemas']['ProblemWithStudyInfoResp'] = {
      id: scrapDetail.problem.id,
      problemType: scrapDetail.problem.problemType,
      parentProblem: scrapDetail.problem.parentProblem,
      parentProblemTitle: scrapDetail.problem.parentProblemTitle,
      customId: scrapDetail.problem.customId,
      createType: scrapDetail.problem.createType,
      practiceTest: scrapDetail.problem.practiceTest,
      practiceTestNo: scrapDetail.problem.practiceTestNo,
      problemContent: scrapDetail.problem.problemContent,
      title: scrapDetail.problem.title,
      answerType: scrapDetail.problem.answerType,
      answer: scrapDetail.problem.answer,
      difficulty: scrapDetail.problem.difficulty,
      recommendedTimeSec: scrapDetail.problem.recommendedTimeSec,
      memo: scrapDetail.problem.memo,
      concepts: scrapDetail.problem.concepts,
      mainAnalysisImage: scrapDetail.problem.mainAnalysisImage,
      mainHandAnalysisImage: scrapDetail.problem.mainHandAnalysisImage,
      readingTipContent: scrapDetail.problem.readingTipContent,
      oneStepMoreContent: scrapDetail.problem.oneStepMoreContent,
      pointings: pointingsWithFeedback,
      progress: 'NONE', // 스크랩에서는 진행 상태가 없음
      submitAnswer: 0, // 스크랩에서는 제출 답안이 없음
      isCorrect: false, // 스크랩에서는 정답 여부가 없음
      isDone: false, // 스크랩에서는 완료 여부가 없음
      childProblems: [], // 스크랩에는 childProblems가 없음
    };

    return {
      no: 1, // 스크랩에서는 번호가 없으므로 1로 설정
      problemId: scrapDetail.problem.id,
      progress: 'DONE', // 스크랩된 문제는 완료된 것으로 간주
      problem: problemWithStudyInfo,
      childProblems: [],
    };
  }, [scrapDetail]);

  // 전체보기 버튼 클릭 핸들러
  const handleViewAllPointings = useCallback(() => {
    const group = convertScrapToGroup();
    if (!group) return;

    navigation.navigate('AllPointings', {
      group,
      problemSetTitle: scrapDetail?.name || '스크랩',
    });
  }, [convertScrapToGroup, navigation, scrapDetail?.name]);

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

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F4F7' }}>
      <SafeAreaView edges={['top']} className='bg-gray-800 text-white'>
        <View className='w-full flex-row items-center justify-between bg-gray-800 px-[20px] py-[14px]'>
          {navigation.canGoBack() && (
            <Pressable onPress={() => navigation.goBack()}>
              <View className='items-center justify-center gap-[10px]'>
                <ChevronLeft color={'#FFF'} size={32} />
              </View>
            </Pressable>
          )}
          <View className='flex-row items-center gap-[10px]'>
            {showSave && (
              <LottieView
                style={{ width: 24, height: 24 }}
                source={require('../../../../../assets/lottie/refetch_cw.json')}
                ref={lottieRef}
                onAnimationFinish={() => {
                  setTimeout(() => setShowSave(false), 200);
                }}
                loop={false}
              />
            )}
            <Text className='text-20b text-white'>{scrap.name || '스크랩 상세'}</Text>
            <ChevronDownFilledIcon size={20} color={colors['gray-600']} />
          </View>
          <Pressable>
            <MessageCircleMore size={24} color={'#FFF'} />
          </Pressable>
        </View>
        {openNotes.length > 1 && (
          <View className='flex-row border-b border-gray-300 bg-gray-800'>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              className='flex-row'
              onScroll={(event) => {
                const offsetX = event.nativeEvent.contentOffset.x;
                scrollX.value = offsetX; // 실시간 업데이트
              }}
              scrollEventThrottle={1}>
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
                  scrollViewRef={scrollViewRef as React.RefObject<ScrollView>}
                  scrollX={scrollX}
                  screenWidth={screenWidth}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </SafeAreaView>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <ScrollView
          style={{ width: '60%', backgroundColor: colors['gray-200'] }}
          contentContainerStyle={{ padding: 20, gap: 14 }}>
          <View className='gap-[14px] '>
            <View className='flex-row items-center justify-center gap-2'>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexDirection: 'row', gap: 10 }}>
                {filterOptions.map((option, index) => (
                  <View key={option} className='flex-row items-center gap-2'>
                    <TextButton
                      variant='blue'
                      onPress={() => setSelectedFilter(index)}
                      style={{
                        backgroundColor:
                          selectedFilter === index ? colors['primary-500'] : '#D9E2FF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 34,
                        paddingHorizontal: 8,
                        paddingVertical: 5,
                        borderRadius: 6,
                      }}>
                      <View className='flex-row items-center gap-1'>
                        {index !== 0 && <Bookmark size={16} color={colors['primary-500']} />}
                        <Text
                          className={
                            selectedFilter === index
                              ? 'text-16m text-white'
                              : 'text-16m text-gray-800'
                          }>
                          {option}
                        </Text>
                      </View>
                    </TextButton>
                  </View>
                ))}
              </ScrollView>
              <View className='pl-[6px] pr-[8px]'>
                {scrap.pointings && scrap.pointings.length > 0 && scrap.problem && (
                  <Pressable
                    className='flex-row items-center gap-0.5'
                    onPress={handleViewAllPointings}>
                    <Text className='text-16m text-gray-800'>전체보기</Text>
                    <ChevronRight size={16} color={colors['gray-700']} />
                  </Pressable>
                )}
              </View>
            </View>
            {shouldShowProblem &&
              !(scrap.problem && scrap.problem.problemContent) &&
              scrap.thumbnailUrl && (
                <View className='gap-[6px] rounded-[8px] border border-gray-500 bg-white p-[14px]'>
                  <Text className='text-16b text-black'>문제 본문</Text>
                  <Pressable
                    className='relative'
                    onPress={() => {
                      setIsHoveringProblem(true);

                      setTimeout(() => {
                        setIsHoveringProblem(false);
                      }, 2000);
                    }}>
                    <Image
                      source={{ uri: scrap.thumbnailUrl }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode='cover'
                    />
                    {isHoveringProblem && (
                      <Pressable
                        onPress={() => setIsProblemExpanded(true)}
                        className='absolute right-2 top-2 z-10 rounded-full bg-black/50 p-2'>
                        <Maximize2 size={20} color='#FFFFFF' />
                      </Pressable>
                    )}
                  </Pressable>
                </View>
              )}
            {/* 문제 내용 */}
            {shouldShowProblem && scrap.problem && scrap.problem.problemContent && (
              <View className='gap-[6px] rounded-[8px] border border-gray-500 bg-white p-[14px]'>
                <Text className='text-16b text-black'>문제 본문</Text>
                <Pressable
                  className='relative'
                  onPress={() => {
                    setIsHoveringProblem(true);

                    setTimeout(() => {
                      setIsHoveringProblem(false);
                    }, 2000);
                  }}>
                  <ProblemViewer
                    problemContent={scrap.problem.problemContent}
                    minHeight={200}
                    padding={14}
                  />
                  {isHoveringProblem && (
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
              <>
                {pointingsWithLabels.map((pointing, idx) => {
                  if (!shouldShowPointing(idx)) return null;
                  const sectionKey = `pointing-${pointing.id}`;
                  // const isCommentExpanded = expandedSections[sectionKey]?.comment ?? false;

                  return (
                    <View key={sectionKey} className='rounded-[8px] border border-gray-400'>
                      <View className='flex-row items-center gap-[10px] rounded-t-[8px] bg-white p-[14px]'>
                        <Text className='text-16b text-black'>포인팅 {pointing.label}</Text>
                        <Text className='text-13m text-gray-700'>포인팅 질문</Text>
                      </View>
                      {pointing.questionContent && (
                        <View className='gap-2 border-b border-gray-400 bg-white p-[14px]'>
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
                        <View className='gap-2 rounded-b-[8px] bg-gray-100 p-[14px]'>
                          <Pressable
                            onPress={() => {
                              // setExpandedSections((prev) => ({
                              //   ...prev,
                              //   [sectionKey]: {
                              //     ...prev[sectionKey],
                              //     comment: !isCommentExpanded,
                              //   },
                              // }));
                            }}
                            className='flex-row items-end'>
                            {/* {isCommentExpanded ? (
                              <ChevronUp size={16} color='#6B7280' />
                            ) : (
                              <ChevronDown size={16} color='#6B7280' />
                            )} */}
                          </Pressable>
                          {/* {isCommentExpanded && (
                            <ProblemViewer
                              problemContent={pointing.commentContent}
                              minHeight={100}
                              padding={16}
                            />
                          )} */}
                          <ProblemViewer
                            problemContent={pointing.commentContent}
                            minHeight={100}
                            padding={16}
                          />
                        </View>
                      )}
                    </View>
                  );
                })}
              </>
            )}
          </View>
        </ScrollView>
        <View
          style={{
            width: '60%',
            backgroundColor: 'white',
            borderLeftWidth: 1,
            borderColor: '#D1D5DB',
          }}>
          <View style={{ flex: 1 }}>
            {/* 제어 버튼 */}
            <View className='flex-row items-center gap-[10px] border-b border-gray-400 bg-gray-100 px-[14px] py-[6px]'>
              <View className='flex-row items-center gap-[10px]'>
                <IconButton
                  icon={Undo2}
                  backgroundColor='bg-gray-700'
                  disabledBackgroundColor='bg-gray-100'
                  iconColor='white'
                  onPress={() => canvasRef.current?.undo()}
                  disabled={!canUndo}
                  disabledColor={colors['gray-500']}
                  radius={8}
                  size={36}
                />
                <IconButton
                  icon={Redo2}
                  backgroundColor='bg-gray-700'
                  disabledBackgroundColor='bg-gray-100'
                  iconColor='white'
                  onPress={() => canvasRef.current?.redo()}
                  disabled={!canRedo}
                  disabledColor={colors['gray-500']}
                  size={36}
                  radius={8}
                />
                {/* <Pressable
                  onPress={() => handleSave(false)}
                  disabled={isSaving}
                  className={`flex-1 items-center justify-center rounded-lg py-3 ${
                    isSaving ? 'bg-gray-400' : 'bg-blue-600'
                  }`}>
                  <Text className='text-white'>{isSaving ? '저장 중...' : '저장하기'}</Text>
                </Pressable> */}
              </View>
              <View className='h-[22px] w-[2px] bg-gray-500' />
              <View className='flex-row items-center gap-[10px]'>
                <IconButton
                  icon={PencilFilledIcon}
                  disabled={isTextMode || isEraserMode}
                  backgroundColor='bg-blue-200'
                  disabledBackgroundColor='bg-gray-100'
                  iconColor={colors['primary-500']}
                  disabledColor={colors['gray-700']}
                  onPress={() => {
                    setIsTextMode(false);
                    setIsEraserMode(false);
                  }}
                  size={36}
                  radius={8}
                />
                <IconButton
                  icon={EraserFilledIcon}
                  disabled={!isEraserMode}
                  backgroundColor='bg-blue-200'
                  disabledBackgroundColor='bg-gray-100'
                  iconColor={colors['primary-500']}
                  disabledColor={colors['gray-700']}
                  onPress={() => {
                    setIsEraserMode((prev) => !prev);
                    if (!isEraserMode) {
                      setIsTextMode(false);
                    }
                  }}
                  size={36}
                  radius={8}
                />
                <IconButton
                  icon={Type}
                  disabled={!isTextMode}
                  backgroundColor='bg-blue-200'
                  disabledBackgroundColor='bg-gray-100'
                  iconColor={colors['primary-500']}
                  disabledColor={colors['gray-700']}
                  onPress={() => {
                    setIsTextMode(true);
                    setIsEraserMode(false);
                  }}
                  size={36}
                  radius={8}
                />
              </View>
              <View className='h-[22px] w-[2px] bg-gray-500' />
              <View className='flex-row items-center gap-[10px]'>
                {/* 그리기 크기 선택 (필기 모드일 때만 표시) */}
                {!isTextMode && !isEraserMode && (
                  <View className='flex-row items-center gap-[10px]'>
                    <View className='flex-row items-center gap-2'>
                      {[2, 1.2, 0.7].map((size, index) => (
                        <Pressable
                          key={size}
                          onPress={() => setStrokeWidth(size)}
                          className={`h-[36px] w-[36px] items-center justify-center rounded-[8px] p-[5.6px] ${
                            strokeWidth === size ? 'bg-gray-400' : 'bg-gray-100'
                          }`}>
                          <View className='w-[22px] bg-black' style={{ height: size }} />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                {/* 지우개 크기 선택 (지우개 모드일 때만 표시) */}
                {isEraserMode && (
                  <View className='mb-2'>
                    <View className='flex-row items-center gap-2'>
                      {[22, 14, 8].map((size) => (
                        <Pressable
                          key={size}
                          onPress={() => setEraserSize(size)}
                          className={`h-[36px] w-[36px] items-center justify-center rounded-[8px] p-[5.6px] ${
                            eraserSize === size ? 'bg-gray-400' : 'bg-gray-100'
                          }`}>
                          <View
                            className='border-primary-500 rounded-full border-[2px] bg-white'
                            style={{ width: size, height: size }}
                          />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
            <DrawingCanvas
              ref={canvasRef}
              strokeColor='black'
              strokeWidth={strokeWidth}
              textMode={isTextMode}
              textFontSize={16}
              eraserMode={isEraserMode}
              eraserSize={eraserSize}
              onHistoryChange={handleHistoryChange}
            />
          </View>
        </View>
      </View>

      {/* 문제 확대 모달 */}

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
              {scrap.problem && scrap.problem.problemContent && (
                <ProblemViewer
                  problemContent={scrap.problem.problemContent}
                  minHeight={400}
                  padding={20}
                />
              )}
              {!(scrap.problem && scrap.problem.problemContent) && scrap.thumbnailUrl && (
                <Image
                  source={{ uri: scrap.thumbnailUrl }}
                  style={{ width: '100%', height: 600 }}
                  resizeMode='cover'
                />
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

// DraggableTabProps 인터페이스 수정
interface DraggableTabProps {
  note: Note;
  index: number;
  isActive: boolean;
  onPress: () => void;
  onClose: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
  onDragEnd: (fromIndex: number, toIndex: number) => void;
  tabLayouts: Record<number, { x: number; width: number }>;
  scrollViewRef: React.RefObject<ScrollView>;
  scrollX: SharedValue<number>;
  screenWidth: number;
}

// DraggableTab 컴포넌트 수정
const DraggableTab = ({
  note,
  index,
  isActive,
  onPress,
  onClose,
  onLayout,
  onDragEnd,
  tabLayouts,
  scrollViewRef,
  scrollX,
  screenWidth,
}: DraggableTabProps) => {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const { openNotes } = useNoteStore();

  const autoScroll = useCallback(
    (currentX: number) => {
      if (!scrollViewRef.current) return;

      const currentLayout = tabLayouts[note.id];
      if (!currentLayout) return;

      // 탭의 실제 화면상 위치 (스크롤 오프셋 고려)
      const absoluteX = currentLayout.x - scrollX.value + currentX;
      const tabRight = absoluteX + currentLayout.width;
      const tabLeft = absoluteX;

      const visibleLeft = 0;
      const visibleRight = screenWidth;
      const scrollThreshold = 100;
      const scrollSpeed = 0.4;

      let newScrollX = scrollX.value;
      let shouldScroll = false;

      // 오른쪽으로 스크롤
      if (tabRight > visibleRight - scrollThreshold) {
        const distance = tabRight - (visibleRight - scrollThreshold);
        newScrollX = scrollX.value + distance * scrollSpeed;
        shouldScroll = true;
      }
      // 왼쪽으로 스크롤
      else if (tabLeft < visibleLeft + scrollThreshold) {
        const distance = visibleLeft + scrollThreshold - tabLeft;
        newScrollX = scrollX.value - distance * scrollSpeed;
        shouldScroll = true;
      }

      if (shouldScroll && Math.abs(newScrollX - scrollX.value) > 0.5) {
        scrollViewRef.current.scrollTo({
          x: Math.max(0, newScrollX),
          animated: false,
        });
      }
    },
    [tabLayouts, note.id, scrollViewRef, scrollX, screenWidth]
  );

  const panGesture = Gesture.Pan()
    .enabled(isActive) // 활성 탭일 때만 드래그 가능
    .onStart(() => {
      // 활성 탭이 아니면 드래그 시작하지 않음
      if (!isActive) return;

      startX.value = translateX.value;
      runOnJS(setIsDragging)(true);
    })
    .onUpdate((e) => {
      // 활성 탭이 아니면 업데이트하지 않음
      if (!isActive) return;

      translateX.value = startX.value + e.translationX;

      // 드래그 중 자동 스크롤
      const currentX = startX.value + e.translationX;
      runOnJS(autoScroll)(currentX);
    })
    .onEnd((e) => {
      // 활성 탭이 아니면 종료하지 않음
      if (!isActive) {
        translateX.value = withSpring(0);
        runOnJS(setIsDragging)(false);
        return;
      }

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
        style={[animatedStyle, { height: 34, minWidth: 170, maxWidth: 300 }]}
        className={`flex-row items-center gap-2 border-x-[1px] border-gray-600 px-[10px] ${
          isActive ? 'bg-gray-100' : 'bg-gray-500'
        }`}>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className='rounded-ful items-center justify-center'>
          <X size={16} color={colors['gray-700']} />
        </Pressable>
        <Pressable onPress={onPress} className='flex-1 flex-row items-center justify-center gap-2'>
          <Text
            className={`text-14m text-gray-800`}
            ellipsizeMode='tail'
            numberOfLines={1}
            style={{ flexShrink: 1, textAlign: 'center' }}>
            {note.title}
          </Text>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
};

export default ScrapDetailScreen;
