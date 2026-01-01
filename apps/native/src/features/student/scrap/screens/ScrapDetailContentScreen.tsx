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
import { ChevronLeft, X, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react-native';
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
import { useNoteStore, Note } from '@/stores/scrapNoteStore';
import { toAlphabetSequence } from '../utils/formatters/toAlphabetSequence';
import { components } from '@/types/api/schema';
import DrawingCanvas, { DrawingCanvasRef, Stroke, TextItem } from '../utils/skia/drawing';

type ScrapDetailContentRouteProp = RouteProp<StudentRootStackParamList, 'ScrapContentDetail'>;

const ScrapContentDetailScreen = () => {
  const route = useRoute<ScrapDetailContentRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const { id } = route.params;
  const scrapId = Number(id);

  const { data: scrapDetail, isLoading } = useGetScrapDetail(scrapId, !!id);
  const { data: handwritingData } = useGetHandwriting(scrapId, !!id);
  const { mutate: updateHandwriting, isPending: isSaving } = useUpdateHandwriting();

  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [eraserSize, setEraserSize] = useState(6);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const { openNotes, activeNoteId, setActiveNote, closeNote, reorderNotes } = useNoteStore();
  const [tabLayouts, setTabLayouts] = useState<Record<number, { x: number; width: number }>>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useSharedValue(0);
  const screenWidth = Dimensions.get('window').width;
  const [expandedSections, setExpandedSections] = useState<Record<string, { comment: boolean }>>(
    {}
  );
  const [selectedFilter, setSelectedFilter] = useState<number>(0); // 0: 전체, 1: 문제, 2+: 포인팅 인덱스
  const [isProblemExpanded, setIsProblemExpanded] = useState(false);
  const [isHoveringProblem, setIsHoveringProblem] = useState(false);

  useEffect(() => {
    if (activeNoteId && activeNoteId !== scrapId) {
      navigation.setParams({ id: String(activeNoteId) });
    }
  }, [activeNoteId, scrapId, navigation]);

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

        // 로드 후 undo/redo 상태 업데이트
        setTimeout(() => {
          if (canvasRef.current) {
            setCanUndo(canvasRef.current.canUndo());
            setCanRedo(canvasRef.current.canRedo());
          }
        }, 0);
      } catch (error) {
        console.error('필기 데이터 로드 실패:', error);
      }
    }
  }, [handwritingData]);

  // 초기 undo/redo 상태 확인
  useEffect(() => {
    const checkHistory = () => {
      if (canvasRef.current) {
        setCanUndo(canvasRef.current.canUndo());
        setCanRedo(canvasRef.current.canRedo());
      }
    };

    // 초기 확인
    checkHistory();

    // 주기적으로 확인 (상태 변경 감지)
    const interval = setInterval(checkHistory, 100);

    return () => clearInterval(interval);
  }, []);

  // 저장하기 버튼 핸들러
  const handleSave = useCallback(() => {
    const strokes = canvasRef.current?.getStrokes();
    const texts = canvasRef.current?.getTexts();

    if ((!strokes || strokes.length === 0) && (!texts || texts.length === 0)) {
      Alert.alert('알림', '저장할 필기 내용이 없습니다.');
      return;
    }

    try {
      // strokes와 texts를 함께 저장
      const data = {
        strokes: strokes || [],
        texts: texts || [],
      };
      const jsonString = JSON.stringify(data);
      const base64Data = btoa(unescape(encodeURIComponent(jsonString)));

      updateHandwriting(
        {
          scrapId,
          request: {
            data: base64Data,
          },
        },
        {
          onSuccess: () => {
            Alert.alert('성공', '필기가 저장되었습니다.');
          },
          onError: (error) => {
            console.error('필기 저장 실패:', error);
            Alert.alert('오류', '필기 저장에 실패했습니다.');
          },
        }
      );
    } catch (error) {
      console.error('필기 데이터 변환 실패:', error);
      Alert.alert('오류', '필기 데이터 변환에 실패했습니다.');
    }
  }, [scrapId, updateHandwriting]);

  // 필터 옵션 생성 (scrapDetail이 없어도 Hook은 항상 호출되어야 함)
  const filterOptions = useMemo(() => {
    if (!scrapDetail) return ['전체', '문제'];
    const options = ['전체', '문제'];
    if (scrapDetail.pointings && scrapDetail.pointings.length > 0) {
      scrapDetail.pointings.forEach((_, idx) => {
        options.push(`포인팅 ${toAlphabetSequence(idx)}`);
      });
    }
    return options;
  }, [scrapDetail?.pointings]);

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
          <Text className='text-17m text-gray-900'>{handwritingData?.updatedAt}</Text>
          <View className='h-[48px] w-[48px]' />
        </Container>
        {openNotes.length > 1 && (
          <View className='flex-row border-b border-gray-300 bg-gray-50'>
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
            {shouldShowProblem &&
              !(scrap.problem && scrap.problem.problemContent) &&
              scrap.thumbnailUrl && (
                <View className='gap-4 rounded-lg bg-white p-4'>
                  <Text className='text-16b text-[#1E1E21]'>문제 내용</Text>
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
              <View className='gap-4 rounded-lg bg-white p-4'>
                <Text className='text-16b text-[#1E1E21]'>문제 내용</Text>
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
                    padding={20}
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
        <View
          style={{
            width: '40%',
            backgroundColor: 'white',
            borderLeftWidth: 1,
            borderColor: '#D1D5DB',
          }}>
          <View style={{ flex: 1 }}>
            <DrawingCanvas
              ref={canvasRef}
              strokeColor='black'
              strokeWidth={strokeWidth}
              textMode={isTextMode}
              textFontSize={16}
              eraserMode={isEraserMode}
              eraserSize={eraserSize}
              onChange={() => {
                // 상태 변경 시 undo/redo 가능 여부 업데이트
                setTimeout(() => {
                  if (canvasRef.current) {
                    setCanUndo(canvasRef.current.canUndo());
                    setCanRedo(canvasRef.current.canRedo());
                  }
                }, 0);
              }}
            />
          </View>

          {/* 하단 제어 버튼 */}
          <View className='border-t border-gray-200 p-4'>
            <View className='mb-2 flex-row gap-2'>
              <Pressable
                onPress={() => {
                  setIsTextMode(false);
                  setIsEraserMode(false);
                }}
                className={`flex-1 items-center justify-center rounded-lg py-3 ${
                  !isTextMode && !isEraserMode ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                <Text className={!isTextMode && !isEraserMode ? 'text-white' : 'text-gray-700'}>
                  필기
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIsTextMode(true);
                  setIsEraserMode(false);
                }}
                className={`flex-1 items-center justify-center rounded-lg py-3 ${
                  isTextMode && !isEraserMode ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                <Text className={isTextMode && !isEraserMode ? 'text-white' : 'text-gray-700'}>
                  텍스트
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIsEraserMode((prev) => !prev);
                  if (!isEraserMode) {
                    setIsTextMode(false);
                  }
                }}
                className={`flex-1 items-center justify-center rounded-lg py-3 ${
                  isEraserMode ? 'bg-red-500' : 'bg-gray-200'
                }`}>
                <Text className={isEraserMode ? 'text-white' : 'text-gray-700'}>지우개</Text>
              </Pressable>
            </View>

            {/* 그리기 크기 선택 (필기 모드일 때만 표시) */}
            {!isTextMode && !isEraserMode && (
              <View className='mb-2'>
                <Text className='text-12m mb-2 text-gray-600'>그리기 크기</Text>
                <View className='flex-row gap-2'>
                  {[1.5, 2, 4].map((size) => (
                    <Pressable
                      key={size}
                      onPress={() => setStrokeWidth(size)}
                      className={`flex-1 items-center justify-center rounded-lg py-2 ${
                        strokeWidth === size ? 'bg-blue-500' : 'bg-gray-200'
                      }`}>
                      <Text className={strokeWidth === size ? 'text-white' : 'text-gray-700'}>
                        {size}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* 지우개 크기 선택 (지우개 모드일 때만 표시) */}
            {isEraserMode && (
              <View className='mb-2'>
                <Text className='text-12m mb-2 text-gray-600'>지우개 크기</Text>
                <View className='flex-row gap-2'>
                  {[6, 12, 20].map((size) => (
                    <Pressable
                      key={size}
                      onPress={() => setEraserSize(size)}
                      className={`flex-1 items-center justify-center rounded-lg py-2 ${
                        eraserSize === size ? 'bg-red-500' : 'bg-gray-200'
                      }`}>
                      <Text className={eraserSize === size ? 'text-white' : 'text-gray-700'}>
                        {size}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <View className='flex-row gap-2'>
              <Pressable
                onPress={() => {
                  canvasRef.current?.undo();
                  // undo 후 상태 업데이트
                  setTimeout(() => {
                    if (canvasRef.current) {
                      setCanUndo(canvasRef.current.canUndo());
                      setCanRedo(canvasRef.current.canRedo());
                    }
                  }, 0);
                }}
                disabled={!canUndo}
                className={`flex-1 items-center justify-center rounded-lg py-3 ${
                  canUndo ? 'bg-gray-200' : 'bg-gray-100'
                }`}>
                <Text className={canUndo ? 'text-gray-700' : 'text-gray-400'}>undo</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  canvasRef.current?.redo();
                  // redo 후 상태 업데이트
                  setTimeout(() => {
                    if (canvasRef.current) {
                      setCanUndo(canvasRef.current.canUndo());
                      setCanRedo(canvasRef.current.canRedo());
                    }
                  }, 0);
                }}
                disabled={!canRedo}
                className={`flex-1 items-center justify-center rounded-lg py-3 ${
                  canRedo ? 'bg-gray-200' : 'bg-gray-100'
                }`}>
                <Text className={canRedo ? 'text-gray-700' : 'text-gray-400'}>redo</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                className={`flex-1 items-center justify-center rounded-lg py-3 ${
                  isSaving ? 'bg-gray-400' : 'bg-blue-600'
                }`}>
                <Text className='text-white'>{isSaving ? '저장 중...' : '저장하기'}</Text>
              </Pressable>
            </View>
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
        style={[animatedStyle, { flex: 1, minWidth: 150, maxWidth: 300 }]}
        className={`flex-row items-center gap-2 border-b-2 px-4 py-2 ${
          isActive ? 'border-blue-500 bg-white' : 'border-transparent bg-gray-50'
        }`}>
        <Pressable onPress={onPress} className='flex-1 flex-row items-center gap-2'>
          <Text
            className={`text-14m ${isActive ? 'text-gray-900' : 'text-gray-600'}`}
            ellipsizeMode='tail'
            numberOfLines={1}
            style={{ flexShrink: 1, textAlign: 'center' }}>
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
