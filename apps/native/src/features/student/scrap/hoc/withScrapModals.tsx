import React from 'react';
import { ScrapModalProvider } from '../contexts/ScrapModalsContext';
import { MoveScrapModal } from '../components/Modal/MoveScrapModal';
import { CreateFolderModal } from '../components/Modal/CreateFolderModal';

/**
 * 스크랩 모달들을 자동으로 추가하는 HOC (Higher-Order Component)
 *
 * ScrapModalProvider와 CreateFolderModal, MoveScrapModal을 자동으로 감싸줍니다.
 *
 * @param Component - 감쌀 컴포넌트
 * @returns 모달이 추가된 컴포넌트
 *
 * @example
 * const ScrapScreen = () => {
 *   return <ScrapScreenContent />;
 * };
 *
 * export default withScrapModals(ScrapScreen);
 */
export const withScrapModals = <P extends object>(Component: React.ComponentType<P>) => {
  const WrappedComponent = (props: P) => {
    return (
      <ScrapModalProvider>
        <Component {...props} />
        <CreateFolderModal />
        <MoveScrapModal />
      </ScrapModalProvider>
    );
  };

  WrappedComponent.displayName = `withScrapModals(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
};
