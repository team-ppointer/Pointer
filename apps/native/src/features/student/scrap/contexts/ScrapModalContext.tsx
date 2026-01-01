import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { SelectedItem } from '../utils/reducer';

interface ScrapModalContextValue {
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

  // 폴더 목록 refetch 함수
  refetchFolders?: () => void;
  setRefetchFolders: (refetch: () => void) => void;

  // 스크랩 목록 refetch 함수
  refetchScraps?: () => void;
  setRefetchScraps: (refetch: () => void) => void;
}

const ScrapModalContext = createContext<ScrapModalContextValue | undefined>(undefined);

export const useScrapModal = () => {
  const context = useContext(ScrapModalContext);
  if (!context) {
    throw new Error('useScrapModal must be used within ScrapModalProvider');
  }
  return context;
};

interface ScrapModalProviderProps {
  children: ReactNode;
}

export const ScrapModalProvider = ({ children }: ScrapModalProviderProps) => {
  const [isCreateFolderModalVisible, setIsCreateFolderModalVisible] = useState(false);
  const [isMoveScrapModalVisible, setIsMoveScrapModalVisible] = useState(false);
  const [moveScrapModalProps, setMoveScrapModalProps] = useState<{
    currentFolderId?: number;
    selectedItems: SelectedItem[];
  }>({
    selectedItems: [],
  });
  const [refetchFolders, setRefetchFoldersState] = useState<(() => void) | undefined>(undefined);
  const [refetchScraps, setRefetchScrapsState] = useState<(() => void) | undefined>(undefined);

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

  const setRefetchFolders = useCallback((refetch: () => void) => {
    setRefetchFoldersState(() => refetch);
  }, []);

  const setRefetchScraps = useCallback((refetch: () => void) => {
    setRefetchScrapsState(() => refetch);
  }, []);

  const value: ScrapModalContextValue = {
    isCreateFolderModalVisible,
    openCreateFolderModal,
    closeCreateFolderModal,
    isMoveScrapModalVisible,
    moveScrapModalProps,
    openMoveScrapModal,
    closeMoveScrapModal,
    refetchFolders,
    setRefetchFolders,
    refetchScraps,
    setRefetchScraps,
  };

  return <ScrapModalContext.Provider value={value}>{children}</ScrapModalContext.Provider>;
};
