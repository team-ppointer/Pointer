import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  type LayoutChangeEvent,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { type RouteProp, useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useDerivedValue,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useQueryClient } from '@tanstack/react-query';

import { toAlphabetSequence } from '../utils/formatters/toAlphabetSequence';
import DrawingCanvas, { type DrawingCanvasRef } from '../utils/skia/drawing';
import { ScrapDetailHeader } from '../components/Header/ScrapDetailHeader';
import { TabNavigator } from '../components/scrap/TabNavigator';
import { FilterBar } from '../components/scrap/FilterBar';
import { ProblemSection } from '../components/scrap/ProblemSection';
import { AnalysisSection } from '../components/scrap/AnalysisSection';
import { PointingsList } from '../components/scrap/PointingsList';
import { DrawingToolbar } from '../components/scrap/DrawingToolbar';
import { ProblemExpansionModal } from '../components/scrap/ProblemExpansionModal';
import { useDrawingState } from '../hooks/useDrawingState';
import { useHandwritingManager } from '../hooks/useHandwritingManager';
import { useScrapUIState } from '../hooks/useScrapUIState';
import { convertScrapToGroup, mergeTipTapDocs } from '../utils/scrapTransformers';
import {
  generateFilterOptions,
  shouldShowProblem,
  shouldShowPointing,
  hasVisiblePointings,
  shouldShowAnalysisSection,
} from '../utils/scrapFilters';
import { showToast } from '../components/Notification/Toast';
import { withScrapModals } from '../hoc/withScrapModals';
import { useScrapModal } from '../contexts/ScrapModalsContext';
import { useRecentScrapStore } from '../stores/recentScrapStore';
import { ExplanationSection } from '../components/scrap/ExplanationSection';

import { colors } from '@/theme/tokens';
import { useNoteStore } from '@/features/student/scrap/stores/scrapNoteStore';
import { LoadingScreen } from '@/components/common';
import {
  TanstackQueryClient,
  useGetScrapDetail,
  useUpdateScrapName,
  useGetEntireProblemPointing,
  useGetEntireProblem,
} from '@/apis';
import { type StudentRootStackParamList } from '@/navigation/student/types';

type ScrapDetailRouteProp = RouteProp<StudentRootStackParamList, 'ScrapContentDetail'>;

const DRAG_HANDLE_WIDTH = 6;
const DIVIDER_WIDTH = 8;
const DRAG_HANDLE_GAP = 10;

const ScrapDetailScreen = () => {
  const route = useRoute<ScrapDetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const { id } = route.params;
  const scrapId = Number(id);

  // API & Store
  const {
    data: scrapDetail,
    isLoading,
    refetch: refetchScrapDetail,
  } = useGetScrapDetail(scrapId, !!id);

  const { data: entireProblemPointing, refetch: refetchEntireProblemPointing } =
    useGetEntireProblemPointing(scrapDetail?.problem?.id as number, !!scrapDetail?.problem?.id);

  const { data: entireProblem, refetch: refetchEntireProblem } = useGetEntireProblem(
    scrapDetail?.problem?.id as number,
    !!scrapDetail?.problem?.id
  );

  const addScrapId = useRecentScrapStore((state) => state.addScrapId);
  const { mutateAsync: updateScrapName } = useUpdateScrapName();
  const { openNotes, activeNoteId, setActiveNote, closeNote, reorderNotes, updateNoteTitle } =
    useNoteStore();

  const [_scrapName, setScrapName] = useState<string | undefined>();
  const scrapName = _scrapName ?? scrapDetail?.name ?? '';
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (scrapDetail) {
      addScrapId(scrapDetail.id);
    }
  }, [scrapDetail, addScrapId]);

  // scrapId 변경 시 로컬 오버라이드 리셋
  useEffect(() => {
    setScrapName(undefined);
  }, [scrapId]);

  useEffect(() => {
    if (scrapDetail?.name) {
      updateNoteTitle(scrapId, scrapDetail.name);
    }
  }, [scrapDetail?.name, scrapId, updateNoteTitle]);

  const handleUpdateScrapName = async (name: string) => {
    if (!name.trim()) {
      showToast('error', '이름을 입력해주세요.');
      return;
    }

    try {
      await updateScrapName({
        scrapId,
        request: { name: name.trim() },
      });
      const trimmedName = name.trim();
      setScrapName(trimmedName);
      // 탭의 제목도 업데이트
      updateNoteTitle(scrapId, trimmedName);
      showToast('success', '이름이 변경되었습니다.');
    } catch (error) {
      showToast('error', '이름 변경에 실패했습니다.');
    }
  };

  // Refs
  const canvasRef = useRef<DrawingCanvasRef>(null);

  // Custom Hooks
  const drawingState = useDrawingState();
  const uiState = useScrapUIState();
  const { openMoveScrapModal, setRefetchScrapDetail } = useScrapModal();

  // 화면 크기에 따라 분할 영역 비율 결정
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const MIN_LEFT_WIDTH = SCREEN_WIDTH * 0.25;
  const MIN_RIGHT_WIDTH = SCREEN_WIDTH * 0.25;
  const DEFAULT_LEFT_WIDTH = SCREEN_WIDTH * 0.5;

  useEffect(() => {
    if (refetchScrapDetail) {
      setRefetchScrapDetail(refetchScrapDetail);
    }
  }, [refetchScrapDetail, setRefetchScrapDetail]);

  useEffect(() => {
    if (scrapDetail?.problem?.id) {
      refetchEntireProblemPointing();
      refetchEntireProblem();
    }
  }, [scrapDetail?.problem?.id, refetchEntireProblemPointing, refetchEntireProblem]);

  useFocusEffect(
    useCallback(() => {
      if (activeNoteId !== scrapId) {
        return;
      }
      refetchScrapDetail();
    }, [refetchScrapDetail, activeNoteId, scrapId])
  );

  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions(
          'get',
          '/api/student/scrap/{scrapId}/handwriting',
          { params: { path: { scrapId } } }
        ).queryKey,
      });
    };
  }, [scrapId, queryClient]);

  const handwriting = useHandwritingManager({
    scrapId,
    canvasRef,
    hasUnsavedChanges: drawingState.hasUnsavedChanges,
    onSaveSuccess: () => {
      drawingState.markAsSaved();
    },
  });

  // Tab management
  const [tabLayouts, setTabLayouts] = useState<Record<number, { x: number; width: number }>>({});

  // Active note sync
  useEffect(() => {
    if (activeNoteId && activeNoteId !== scrapId) {
      try {
        navigation.setParams({ id: String(activeNoteId) });
      } catch (error) {
        showToast('error', '스크랩 상세 페이지 이동에 실패했습니다.');
      }
    }
  }, [activeNoteId, scrapId, navigation]);

  // scrapId 변경 시 모든 state 초기화
  useEffect(() => {
    // 저장 중이면 초기화 지연 (데이터 유실 방지)
    if (handwriting.isSaving) {
      // 저장이 완료될 때까지 대기
      const checkSaveComplete = setInterval(() => {
        if (!handwriting.isSaving) {
          clearInterval(checkSaveComplete);
          // 저장 완료 후 초기화
          drawingState.reset();
          uiState.reset();
          canvasRef.current?.clear();
          setTabLayouts({});
        }
      }, 100); // 100ms마다 체크

      return () => clearInterval(checkSaveComplete);
    }

    // 저장 중이 아니면 즉시 초기화
    // Drawing state 초기화
    drawingState.reset();
    // UI state 초기화
    uiState.reset();
    // Canvas 초기화
    canvasRef.current?.clear();
    // Tab layouts 초기화
    setTabLayouts({});
  }, [scrapId]);

  // Save indicator animation interval
  const indicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      uiState.showSaveIndicator();
      // Clear previous timeout if exists
      if (indicatorTimeoutRef.current) {
        clearTimeout(indicatorTimeoutRef.current);
      }
      indicatorTimeoutRef.current = setTimeout(() => {
        uiState.hideSaveIndicator();
        indicatorTimeoutRef.current = null;
      }, 2000);
    }, 30000);

    return () => {
      clearInterval(interval);
      if (indicatorTimeoutRef.current) {
        clearTimeout(indicatorTimeoutRef.current);
      }
    };
  }, [scrapId]);

  // Derived state - Pointings with labels
  const pointingsWithLabels = useMemo(() => {
    if (!scrapDetail?.pointings) return [];
    return scrapDetail.pointings.map((pointing) => ({
      ...pointing,
      label: toAlphabetSequence(pointing.no - 1),
    }));
  }, [scrapDetail?.pointings]);

  // Filter options
  const filterOptions = useMemo(() => {
    return generateFilterOptions(scrapDetail, pointingsWithLabels);
  }, [scrapDetail, pointingsWithLabels]);

  // Visible content checks
  const showProblem = shouldShowProblem(uiState.selectedFilter);
  const hasPointings = hasVisiblePointings(scrapDetail, uiState.selectedFilter);
  const hasReadingTip = shouldShowAnalysisSection(
    uiState.selectedFilter,
    'readingTip',
    pointingsWithLabels.length,
    scrapDetail
  );
  const hasOneStepMore = shouldShowAnalysisSection(
    uiState.selectedFilter,
    'oneStepMore',
    pointingsWithLabels.length,
    scrapDetail
  );

  const showExplanation = uiState.selectedFilter === 0;
  const hasExplanation = !!(
    scrapDetail?.pointings && scrapDetail.pointings.some((pointing) => pointing.commentContent)
  );

  // Handlers
  const handleViewAllPointings = useCallback(() => {
    const group = convertScrapToGroup(entireProblem?.data || [], entireProblemPointing?.data || []);
    if (!group) return;

    navigation.navigate('AllPointings', {
      group,
      // problemSetTitle: scrapDetail?.name || '스크랩',
      // publishAt: scrapDetail?.createdAt,
    });
  }, [navigation, entireProblemPointing, entireProblem]);

  const handleTabLayout = useCallback((noteId: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts((prev) => ({ ...prev, [noteId]: { x, width } }));
  }, []);

  const handleProblemHover = useCallback(() => {
    uiState.setHoveringProblem(true);
    setTimeout(() => {
      uiState.setHoveringProblem(false);
    }, 2000);
  }, [uiState]);

  // Split view state
  const leftWidth = useSharedValue(DEFAULT_LEFT_WIDTH);
  const startX = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const ANIMATION_CONFIG = { damping: 25, stiffness: 300, mass: 0.8 };
  const VELOCITY_THRESHOLD = 800;

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = leftWidth.value;
      isDragging.value = true;
    })
    .onUpdate((event) => {
      const newWidth = startX.value + event.translationX;
      const maxLeftWidth = SCREEN_WIDTH - MIN_RIGHT_WIDTH;
      leftWidth.value = Math.max(MIN_LEFT_WIDTH, Math.min(newWidth, maxLeftWidth));
    })
    // .onEnd((event) => {
    //   isDragging.value = false;
    //   const velocity = event.velocityX;
    //   const maxLeftWidth = SCREEN_WIDTH - MIN_RIGHT_WIDTH;
    //   let targetWidth;

    //   if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
    //     targetWidth = velocity > 0 ? DEFAULT_LEFT_WIDTH : MIN_LEFT_WIDTH;
    //   } else {
    //     const distances = [
    //       {
    //         w: MIN_LEFT_WIDTH,
    //         d: Math.abs(leftWidth.value - MIN_LEFT_WIDTH),
    //       },
    //       {
    //         w: DEFAULT_LEFT_WIDTH,
    //         d: Math.abs(leftWidth.value - DEFAULT_LEFT_WIDTH),
    //       },
    //       {
    //         w: maxLeftWidth,
    //         d: Math.abs(leftWidth.value - maxLeftWidth),
    //       },
    //     ];
    //     targetWidth = distances.sort((a, b) => a.d - b.d)[0].w;
    //   }

    //   leftWidth.value = withSpring(targetWidth, ANIMATION_CONFIG);
    .onEnd(() => {
      isDragging.value = false;
      // 스냅 없이 현재 위치 유지
    });

  const leftSectionAnimatedStyle = useAnimatedStyle(() => ({
    width: leftWidth.value,
  }));

  const rightSectionAnimatedStyle = useAnimatedStyle(() => ({
    width: SCREEN_WIDTH - leftWidth.value - DRAG_HANDLE_WIDTH,
  }));

  // Drawing area width 계산
  const drawingAreaWidth = useDerivedValue(() => {
    return SCREEN_WIDTH - leftWidth.value - DRAG_HANDLE_WIDTH;
  });

  // 드로잉 영역 너비가 380 미만인지 여부 (boolean만 React로 전달하여 리렌더링 최소화)
  const isNarrowDrawing = useDerivedValue(() => drawingAreaWidth.value < 380);
  const [isNarrow, setIsNarrow] = useState(
    SCREEN_WIDTH - DEFAULT_LEFT_WIDTH - DRAG_HANDLE_WIDTH < 380
  );

  useAnimatedReaction(
    () => isNarrowDrawing.value,
    (narrow, prevNarrow) => {
      if (narrow !== prevNarrow) {
        runOnJS(setIsNarrow)(narrow);
      }
    }
  );

  const dragHandleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withSpring(isDragging.value ? 1 : 0.6, ANIMATION_CONFIG),
    transform: [
      {
        scale: withSpring(isDragging.value ? 1.1 : 1, ANIMATION_CONFIG),
      },
    ],
  }));

  const dividerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withSpring(isDragging.value ? 1 : 0.4, ANIMATION_CONFIG),
  }));

  const dragHandleContainerAnimatedStyle = useAnimatedStyle(() => ({
    left: leftWidth.value,
  }));

  // 화면 회전 등으로 전체 너비가 줄어들었을 때,
  // 드로잉 영역(right section)이 최소 25% 이상 되도록 leftWidth를 보정
  useEffect(() => {
    if (!SCREEN_WIDTH) return;

    const maxLeftWidth = SCREEN_WIDTH - MIN_RIGHT_WIDTH;

    if (leftWidth.value > maxLeftWidth) {
      leftWidth.value = maxLeftWidth;
    }
  }, [SCREEN_WIDTH, MIN_RIGHT_WIDTH, leftWidth]);

  // Loading state
  if (isLoading || handwriting.isLoading) {
    return <LoadingScreen label='스크랩을 불러오고 있습니다.' />;
  }

  // Error state
  if (!scrapDetail) {
    return (
      <View className='flex-1 items-center justify-center gap-[12px]'>
        <Text>스크랩을 찾을 수 없습니다.</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          className='rounded bg-gray-300 px-[16px] py-[8px]'>
          <Text>뒤로가기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <View style={{ flex: 1, backgroundColor: '#F2F4F7' }}>
        {/* Header */}
        <SafeAreaView edges={['top']} className='bg-gray-800 text-white'>
          <ScrapDetailHeader
            key={`scrap-detail-header-${scrapId}`}
            scrapName={scrapName || scrapDetail.name || '스크랩 상세'}
            onScrapNameChange={handleUpdateScrapName}
            showSave={uiState.showSave}
            onBack={async () => {
              const saved = await handwriting.handleSave(true, scrapId);
              if (saved) {
                navigation.goBack();
              }
            }}
            canGoBack={navigation.canGoBack()}
            onMoveFolderPress={() => {
              openMoveScrapModal({
                currentFolderId: scrapDetail?.folder?.id,
                selectedItems: [{ id: scrapId, type: 'SCRAP' }],
              });
            }}
          />
          <TabNavigator
            openNotes={openNotes}
            activeNoteId={activeNoteId}
            onTabPress={async (noteId) => {
              if (noteId === activeNoteId) return;
              // 저장 중이면 탭 전환 방지
              if (handwriting.isSaving) return;
              const saved = await handwriting.handleSave(true, scrapId);
              if (!saved) return;
              setActiveNote(noteId);
            }}
            onTabClose={async (noteId) => {
              if (noteId === activeNoteId) {
                // 저장 중이면 탭 닫기 방지
                if (handwriting.isSaving) return;
                const saved = await handwriting.handleSave(true, scrapId);
                if (!saved) return;
              }
              closeNote(noteId);
            }}
            onReorder={reorderNotes}
            tabLayouts={tabLayouts}
            onTabLayout={handleTabLayout}
          />
        </SafeAreaView>

        {/* Main Content */}
        <View style={{ flex: 1, flexDirection: 'row', position: 'relative' }}>
          {/* Left: Content Area */}
          <Animated.View style={[leftSectionAnimatedStyle]}>
            <ScrollView
              style={{ flex: 1, backgroundColor: colors['gray-200'] }}
              contentContainerStyle={{ padding: 20, gap: 14 }}>
              <View className='gap-[14px]'>
                {/* Filter Bar */}

                {scrapDetail.problem?.problemContent && (
                  <FilterBar
                    filterOptions={filterOptions}
                    selectedFilter={uiState.selectedFilter}
                    onFilterChange={uiState.setSelectedFilter}
                    showViewAll={
                      (!!scrapDetail.problem &&
                        ((scrapDetail.problem?.readingTipContent &&
                          scrapDetail.problem?.readingTipContent.length > 0) ||
                          (scrapDetail.problem?.oneStepMoreContent &&
                            scrapDetail.problem?.oneStepMoreContent.length > 0))) ||
                      (!!scrapDetail.pointings && scrapDetail.pointings.length > 0)
                    }
                    onViewAll={handleViewAllPointings}
                  />
                )}

                {/* Problem Section */}
                {showProblem &&
                  (scrapDetail.problem?.problemContent || scrapDetail.thumbnailUrl) && (
                    <ProblemSection
                      key={`problem-${scrapId}`}
                      problemContent={scrapDetail.problem?.problemContent}
                      thumbnailUrl={scrapDetail.thumbnailUrl}
                      isHovering={uiState.isHoveringProblem}
                      onHoverStart={handleProblemHover}
                      onExpand={uiState.openProblemModal}
                    />
                  )}

                {hasExplanation && showExplanation && (
                  <ExplanationSection
                    explanation={
                      // (scrapDetail.pointings || [])
                      //   .map((pointing) => pointing.commentContent)
                      //   .filter(
                      //     (content): content is string =>
                      //       typeof content === 'string' && content.trim().length > 0
                      //   )
                      //   .join('\n') || ''
                      // scrapDetail.pointings[0]?.commentContent || ''
                      mergeTipTapDocs(
                        (entireProblemPointing?.data || []).map(
                          (pointing) => pointing.commentContent
                        ),
                        false
                      ) || ''
                    }
                    title='해설'
                  />
                )}
                {/* TODO: 포인팅 목록에서 해설 표시 (임시로 문항 표시) */}

                {hasPointings && <View className='h-[1px] w-full bg-gray-400' />}

                {/* Pointings List */}
                {hasPointings && (
                  <PointingsList
                    pointingsWithLabels={pointingsWithLabels}
                    shouldShowPointing={(idx) => shouldShowPointing(uiState.selectedFilter, idx)}
                  />
                )}

                {hasPointings && <View className='h-[1px] w-full bg-gray-400' />}

                {/* AnalysisSection */}
                {hasReadingTip && (
                  <AnalysisSection
                    label='문제를 읽어내려갈 때'
                    content={scrapDetail.problem?.readingTipContent || ''}
                    isScraped={scrapDetail.isReadingTipScrapped || undefined}
                  />
                )}
                {hasOneStepMore && (
                  <AnalysisSection
                    label='한 걸음 더'
                    content={scrapDetail.problem?.oneStepMoreContent || ''}
                    isScraped={scrapDetail.isOneStepMoreScrapped || undefined}
                  />
                )}
              </View>
            </ScrollView>
          </Animated.View>

          {/* Center: Splitter Area */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.dragHandleContainer, dragHandleContainerAnimatedStyle]}>
              <Animated.View style={[styles.divider, dividerAnimatedStyle]} />
              <Animated.View style={[styles.dragHandle, dragHandleAnimatedStyle]} />
            </Animated.View>
          </GestureDetector>

          {/* Right: Drawing Area */}
          <Animated.View
            style={[
              rightSectionAnimatedStyle,
              {
                backgroundColor: 'white',
              },
            ]}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={0}>
              <View style={{ flex: 1 }}>
                <DrawingToolbar
                  canUndo={drawingState.canUndo}
                  canRedo={drawingState.canRedo}
                  onUndo={() => canvasRef.current?.undo()}
                  onRedo={() => canvasRef.current?.redo()}
                  isEraserMode={drawingState.isEraserMode}
                  isTextMode={drawingState.isTextMode}
                  onPenModePress={drawingState.setPenMode}
                  onEraserModePress={() => {
                    if (drawingState.isEraserMode) {
                      drawingState.setPenMode();
                    } else {
                      drawingState.setEraserMode();
                    }
                  }}
                  onTextModePress={drawingState.setTextMode}
                  strokeWidth={drawingState.strokeWidth}
                  eraserSize={drawingState.eraserSize}
                  onStrokeWidthChange={drawingState.setStrokeWidth}
                  onEraserSizeChange={drawingState.setEraserSize}
                  isNarrow={isNarrow}
                />
                <DrawingCanvas
                  key={`drawing-canvas-${scrapId}`}
                  ref={canvasRef}
                  strokeColor='#1E1E21'
                  strokeWidth={drawingState.strokeWidth}
                  textMode={drawingState.isTextMode}
                  eraserMode={drawingState.isEraserMode}
                  eraserSize={drawingState.eraserSize}
                  onHistoryChange={drawingState.setHistoryState}
                />
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </View>
      {/* Problem Expansion Modal */}
      <ProblemExpansionModal
        visible={uiState.isProblemExpanded}
        onClose={uiState.closeProblemModal}
        problemContent={scrapDetail.problem?.problemContent}
        thumbnailUrl={scrapDetail.thumbnailUrl}
      />
    </>
  );
};

const styles = StyleSheet.create({
  dragHandleContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: DRAG_HANDLE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDEEF2',
    zIndex: 1000,
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: DIVIDER_WIDTH,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderStyle: 'solid',
    borderColor: '#DFE2E7',
    paddingTop: DRAG_HANDLE_GAP,
    paddingBottom: DRAG_HANDLE_GAP,
    alignItems: 'center',
  },
  dragHandle: {
    width: 4,
    height: 32,
    backgroundColor: '#9CA3AF',
    borderRadius: 20,
    position: 'absolute',
  },
});

export default withScrapModals(ScrapDetailScreen);
