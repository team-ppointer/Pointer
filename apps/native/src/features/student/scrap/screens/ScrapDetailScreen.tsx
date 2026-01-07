import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, ScrollView, LayoutChangeEvent } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { useGetScrapDetail, useUpdateScrapName } from '@/apis';
import { LoadingScreen } from '@/components/common';
import { useNoteStore } from '@/features/student/scrap/stores/scrapNoteStore';
import { toAlphabetSequence } from '../utils/formatters/toAlphabetSequence';
import DrawingCanvas, { DrawingCanvasRef } from '../utils/skia/drawing';
import { colors } from '@/theme/tokens';

// Components
import { ScrapDetailHeader } from '../components/scrap/ScrapDetailHeader';
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
    <View style={{ flex: 1, backgroundColor: '#F2F4F7' }}>
      {/* Header */}
      <SafeAreaView edges={['top']} className='bg-gray-800 text-white'>
        <ScrapDetailHeader
          scrapName={scrapName || scrapDetail.name || '스크랩 상세'}
          onScrapNameChange={handleUpdateScrapName}
          showSave={uiState.showSave}
          onBack={() => navigation.goBack()}
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
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Left: Content Area */}
        <ScrollView
          style={{ width: '60%', backgroundColor: colors['gray-200'] }}
          contentContainerStyle={{ padding: 20, gap: 14 }}>
          <View className='gap-[14px]'>
            {/* Filter Bar */}
            <FilterBar
              filterOptions={filterOptions}
              selectedFilter={uiState.selectedFilter}
              onFilterChange={uiState.setSelectedFilter}
              showViewAll={
                !!scrapDetail.pointings && scrapDetail.pointings.length > 0 && !!scrapDetail.problem
              }
              onViewAll={handleViewAllPointings}
            />

            {/* Problem Section */}
            {showProblem && (scrapDetail.problem?.problemContent || scrapDetail.thumbnailUrl) && (
              <ProblemSection
                problemContent={scrapDetail.problem?.problemContent}
                thumbnailUrl={scrapDetail.thumbnailUrl}
                isHovering={uiState.isHoveringProblem}
                onHoverStart={handleProblemHover}
                onExpand={uiState.openProblemModal}
              />
            )}

            {/* Pointings List */}
            {hasPointings && (
              <PointingsList
                pointingsWithLabels={pointingsWithLabels}
                shouldShowPointing={(idx) => shouldShowPointing(uiState.selectedFilter, idx)}
              />
            )}
          </View>
        </ScrollView>

        {/* Right: Drawing Area */}
        <View
          style={{
            width: '60%',
            backgroundColor: 'white',
            borderLeftWidth: 1,
            borderColor: '#D1D5DB',
          }}>
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
            />
            <DrawingCanvas
              ref={canvasRef}
              strokeColor='black'
              strokeWidth={drawingState.strokeWidth}
              textMode={drawingState.isTextMode}
              textFontSize={16}
              eraserMode={drawingState.isEraserMode}
              eraserSize={drawingState.eraserSize}
              onHistoryChange={drawingState.setHistoryState}
            />
          </View>
        </View>
      </View>

      {/* Problem Expansion Modal */}
      <ProblemExpansionModal
        visible={uiState.isProblemExpanded}
        onClose={uiState.closeProblemModal}
        problemContent={scrapDetail.problem?.problemContent}
        thumbnailUrl={scrapDetail.thumbnailUrl}
      />
    </View>
  );
};

export default withScrapModals(ScrapDetailScreen);
