import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  LayoutChangeEvent,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import { StudentRootStackParamList } from '@/navigation/student/types';
import { useGetScrapDetail, useUpdateScrapName } from '@/apis';
import { LoadingScreen } from '@/components/common';
import { useNoteStore } from '@/features/student/scrap/stores/scrapNoteStore';
import { toAlphabetSequence } from '../utils/formatters/toAlphabetSequence';
import DrawingCanvas, { DrawingCanvasRef } from '../utils/skia/drawing';
import { colors } from '@/theme/tokens';

// Components
import { ScrapDetailHeader } from '../components/Header/ScrapDetailHeader';
import { TabNavigator } from '../components/scrap/TabNavigator';
import { FilterBar } from '../components/scrap/FilterBar';
import { ProblemSection } from '../components/scrap/ProblemSection';
import { PointingsList } from '../components/scrap/PointingsList';
import { DrawingToolbar } from '../components/scrap/DrawingToolbar';
import { ProblemExpansionModal } from '../components/scrap/ProblemExpansionModal';

// Hooks
import { useDrawingState } from '../hooks/useDrawingState';
import { useHandwritingManager } from '../hooks/useHandwritingManager';
import { useScrapUIState } from '../hooks/useScrapUIState';

// Utils
import { convertScrapToGroup } from '../utils/scrapTransformers';
import {
  generateFilterOptions,
  shouldShowProblem,
  shouldShowPointing,
  hasVisiblePointings,
} from '../utils/scrapFilters';
import { showToast } from '../components/Notification/Toast';
import { withScrapModals } from '../hoc/withScrapModals';
import { useScrapModal } from '../contexts/ScrapModalsContext';

type ScrapDetailRouteProp = RouteProp<StudentRootStackParamList, 'ScrapContentDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MIN_LEFT_WIDTH = SCREEN_WIDTH * 0.25;
const MIN_RIGHT_WIDTH = SCREEN_WIDTH * 0.25;
const DEFAULT_LEFT_WIDTH = SCREEN_WIDTH * 0.5;
const DRAG_HANDLE_WIDTH = 4;
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
  const { mutateAsync: updateScrapName } = useUpdateScrapName();
  const { openNotes, activeNoteId, setActiveNote, closeNote, reorderNotes, updateNoteTitle } =
    useNoteStore();

  const [scrapName, setScrapName] = useState(scrapDetail?.name || '');

  // scrapDetail이 로드되면 scrapName 동기화
  useEffect(() => {
    if (scrapDetail?.name) {
      setScrapName(scrapDetail.name);
    }
  }, [scrapDetail?.name]);

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

  // refetchScrapDetail을 context에 등록
  useEffect(() => {
    if (refetchScrapDetail) {
      setRefetchScrapDetail(refetchScrapDetail);
    }
  }, [refetchScrapDetail, setRefetchScrapDetail]);

  const handwriting = useHandwritingManager({
    scrapId,
    canvasRef,
    hasUnsavedChanges: drawingState.hasUnsavedChanges,
    onSaveSuccess: () => {
      drawingState.markAsSaved();
      uiState.showSaveIndicator();
      setTimeout(() => uiState.hideSaveIndicator(), 2000);
    },
  });

  // Tab management
  const [tabLayouts, setTabLayouts] = useState<Record<number, { x: number; width: number }>>({});

  // Active note sync
  useEffect(() => {
    if (activeNoteId && activeNoteId !== scrapId) {
      navigation.setParams({ id: String(activeNoteId) });
    }
  }, [activeNoteId, scrapId, navigation]);

  // Save indicator animation interval
  useEffect(() => {
    const interval = setInterval(() => {
      uiState.showSaveIndicator();
      setTimeout(() => uiState.hideSaveIndicator(), 200);
    }, 30000);

    return () => clearInterval(interval);
  }, [uiState]);

  // Derived state - Pointings with labels
  const pointingsWithLabels = useMemo(() => {
    if (!scrapDetail?.pointings) return [];
    return scrapDetail.pointings.map((pointing, idx) => ({
      ...pointing,
      label: toAlphabetSequence(idx),
    }));
  }, [scrapDetail?.pointings]);

  // Filter options
  const filterOptions = useMemo(() => {
    return generateFilterOptions(scrapDetail, pointingsWithLabels);
  }, [scrapDetail, pointingsWithLabels]);

  // Visible content checks
  const showProblem = shouldShowProblem(uiState.selectedFilter);
  const hasPointings = hasVisiblePointings(scrapDetail, uiState.selectedFilter);

  // Handlers
  const handleViewAllPointings = useCallback(() => {
    const group = convertScrapToGroup(scrapDetail!);
    if (!group) return;

    navigation.navigate('AllPointings', {
      group,
      problemSetTitle: scrapDetail?.name || '스크랩',
    });
  }, [scrapDetail, navigation]);

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

  // Animated value를 state로 변환 (380 기준선 근처에서만 업데이트하여 성능 최적화)
  const [currentDrawingWidth, setCurrentDrawingWidth] = useState(
    SCREEN_WIDTH - DEFAULT_LEFT_WIDTH - DRAG_HANDLE_WIDTH
  );

  useAnimatedReaction(
    () => drawingAreaWidth.value,
    (width, prevWidth) => {
      // 380 기준선을 넘나들 때 또는 큰 변화가 있을 때만 업데이트
      const threshold = 380;
      const shouldUpdate =
        prevWidth === null ||
        (width < threshold && prevWidth >= threshold) ||
        (width >= threshold && prevWidth < threshold) ||
        Math.abs(width - (prevWidth || 0)) > 10; // 10px 이상 변화 시

      if (shouldUpdate) {
        runOnJS(setCurrentDrawingWidth)(width);
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

  // Loading state
  if (isLoading || handwriting.isLoading) {
    return <LoadingScreen label='스크랩을 불러오고 있습니다.' />;
  }

  // Error state
  if (!scrapDetail) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>스크랩을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <>
      <View style={{ flex: 1, backgroundColor: '#F2F4F7' }}>
        {/* Header */}
        <SafeAreaView edges={['top']} className='bg-gray-800 text-white'>
          <ScrapDetailHeader
            scrapName={scrapName || scrapDetail.name || '스크랩 상세'}
            onScrapNameChange={handleUpdateScrapName}
            showSave={uiState.showSave}
            onBack={async () => {
              const saved = await handwriting.handleSave(true);
              navigation.goBack();
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
            onTabPress={setActiveNote}
            onTabClose={closeNote}
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
                <FilterBar
                  filterOptions={filterOptions}
                  selectedFilter={uiState.selectedFilter}
                  onFilterChange={uiState.setSelectedFilter}
                  showViewAll={
                    !!scrapDetail.pointings &&
                    scrapDetail.pointings.length > 0 &&
                    !!scrapDetail.problem
                  }
                  onViewAll={handleViewAllPointings}
                />

                {/* Problem Section */}
                {showProblem &&
                  (scrapDetail.problem?.problemContent || scrapDetail.thumbnailUrl) && (
                    <ProblemSection
                      problemContent={scrapDetail.problem?.problemContent}
                      thumbnailUrl={scrapDetail.thumbnailUrl}
                      isHovering={uiState.isHoveringProblem}
                      onHoverStart={handleProblemHover}
                      onExpand={uiState.openProblemModal}
                    />
                  )}
                <View className='h-[1px] w-full bg-gray-400' />
                {/* Pointings List */}
                {hasPointings && (
                  <PointingsList
                    pointingsWithLabels={pointingsWithLabels}
                    shouldShowPointing={(idx) => shouldShowPointing(uiState.selectedFilter, idx)}
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
                  drawingAreaWidth={currentDrawingWidth}
                />
                <DrawingCanvas
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
