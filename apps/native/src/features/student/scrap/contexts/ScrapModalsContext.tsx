import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { SelectedItem } from '../utils/reducer';

interface ScrapModalsContextValue {
  // CreateFolderModal 상태
  isCreateFolderModalVisible: boolean;
  openCreateFolderModal: () => void;
  closeCreateFolderModal: () => void;

  // MoveScrapModal 상태
  isMoveScrapModalVisible: boolean;
  moveScrapModalProps: {
    currentFolderId?: number;
    selectedItems: SelectedItem[];
  };
  openMoveScrapModal: (props: { currentFolderId?: number; selectedItems: SelectedItem[] }) => void;
  closeMoveScrapModal: () => void;

  // LoadQnaImageModal 상태
  isLoadQnaImageModalVisible: boolean;
  openLoadQnaImageModal: () => void;
  closeLoadQnaImageModal: () => void;

  // 폴더 목록 refetch 함수
  refetchFolders?: () => void;
  setRefetchFolders: (refetch: () => void) => void;

  // 스크랩 목록 refetch 함수
  refetchScraps?: () => void;
  setRefetchScraps: (refetch: () => void) => void;

  // 스크랩 상세 정보 refetch 함수
  refetchScrapDetail?: () => void;
  setRefetchScrapDetail: (refetch: () => void) => void;
}

// Backward compatibility
export type ScrapModalContextValue = ScrapModalsContextValue;

const ScrapModalsContext = createContext<ScrapModalsContextValue | undefined>(undefined);

// Backward compatibility
const ScrapModalContext = ScrapModalsContext;

export const useScrapModals = () => {
  const context = useContext(ScrapModalsContext);
  if (!context) {
    throw new Error('useScrapModals must be used within ScrapModalsProvider');
  }
  return context;
};

// Backward compatibility
export const useScrapModal = useScrapModals;

interface ScrapModalsProviderProps {
  children: ReactNode;
}

export const ScrapModalsProvider = ({ children }: ScrapModalsProviderProps) => {
  const [isCreateFolderModalVisible, setIsCreateFolderModalVisible] = useState(false);
  const [isMoveScrapModalVisible, setIsMoveScrapModalVisible] = useState(false);
  const [isLoadQnaImageModalVisible, setIsLoadQnaImageModalVisible] = useState(false);
  const [moveScrapModalProps, setMoveScrapModalProps] = useState<{
    currentFolderId?: number;
    selectedItems: SelectedItem[];
  }>({
    selectedItems: [],
  });
  const [refetchFolders, setRefetchFoldersState] = useState<(() => void) | undefined>(undefined);
  const [refetchScraps, setRefetchScrapsState] = useState<(() => void) | undefined>(undefined);
  const [refetchScrapDetail, setRefetchScrapDetailState] = useState<(() => void) | undefined>(
    undefined
  );

  const openCreateFolderModal = useCallback(() => {
    setIsCreateFolderModalVisible(true);
  }, []);

  const closeCreateFolderModal = useCallback(() => {
    setIsCreateFolderModalVisible(false);
  }, []);

  const openMoveScrapModal = useCallback(
    (props: { currentFolderId?: number; selectedItems: SelectedItem[] }) => {
      setMoveScrapModalProps(props);
      setIsMoveScrapModalVisible(true);
    },
    []
  );

  const closeMoveScrapModal = useCallback(() => {
    setIsMoveScrapModalVisible(false);
  }, []);

  const openLoadQnaImageModal = useCallback(() => {
    setIsLoadQnaImageModalVisible(true);
  }, []);

  const closeLoadQnaImageModal = useCallback(() => {
    setIsLoadQnaImageModalVisible(false);
  }, []);

  const setRefetchFolders = useCallback((refetch: () => void) => {
    setRefetchFoldersState(() => refetch);
  }, []);

  const setRefetchScraps = useCallback((refetch: () => void) => {
    setRefetchScrapsState(() => refetch);
  }, []);

  const setRefetchScrapDetail = useCallback((refetch: () => void) => {
    setRefetchScrapDetailState(() => refetch);
  }, []);

  const value: ScrapModalContextValue = {
    isCreateFolderModalVisible,
    openCreateFolderModal,
    closeCreateFolderModal,
    isMoveScrapModalVisible,
    moveScrapModalProps,
    openMoveScrapModal,
    closeMoveScrapModal,
    isLoadQnaImageModalVisible,
    openLoadQnaImageModal,
    closeLoadQnaImageModal,
    refetchFolders,
    setRefetchFolders,
    refetchScraps,
    setRefetchScraps,
    refetchScrapDetail,
    setRefetchScrapDetail,
  };

  return <ScrapModalsContext.Provider value={value}>{children}</ScrapModalsContext.Provider>;
};

// Backward compatibility
export const ScrapModalProvider = ScrapModalsProvider;
