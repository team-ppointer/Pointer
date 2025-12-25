import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { LoadQnaImageScreenModal } from './FullScreenModal';
import { Container } from '@/components/common';
import SortDropdown from './SortDropdown';
import type { UISortKey, SortOrder } from '../../utils/types';

interface LoadQnaImageModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoadQnaImageModal = ({
  visible,
  onClose,
  onSuccess,
}: LoadQnaImageModalProps) => {
  const [sortKey, setSortKey] = useState<UISortKey>('DATE');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');

  // 모달이 닫힐 때 상태 초기화 (필요한 경우)
  useEffect(() => {
    if (!visible) {
      // 필요시 상태 초기화
    }
  }, [visible]);

  const handleCancel = () => {
    onClose();
  };

  const handleClose = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <LoadQnaImageScreenModal
      visible={visible}
      onCancel={handleCancel}
      onClose={handleClose}>
      <Container className='items-end gap-[10px] py-[10px]'>
        <SortDropdown
          colors={{
            text: '#FFFFFF',
            border: '#6B6F77',
            checkIcon: '#FFFFFF',
            focusBackground: '#6B6F77',
            background: '#6B6F77',
            itemBackground: '#9FA4AE',
          }}
          ordertype={'IMAGE'}
          orderValue={sortKey}
          setOrderValue={setSortKey}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
      </Container>
    </LoadQnaImageScreenModal>
  );
};

