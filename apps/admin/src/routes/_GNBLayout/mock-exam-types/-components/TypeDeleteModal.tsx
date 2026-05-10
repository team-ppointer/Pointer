import { toast } from 'react-toastify';
import { Modal, TwoButtonModalTemplate } from '@components';
import { deleteMockExamType } from '@apis';
import { useInvalidate } from '@hooks';
import { extractErrorMessage } from '@utils';

import type { components } from '@/types/api/schema';

type MockExamType = components['schemas']['MockExamTypeResp'];

interface Props {
  isOpen: boolean;
  target: MockExamType | null;
  onClose: () => void;
}

const TypeDeleteModal = ({ isOpen, target, onClose }: Props) => {
  const { invalidateMockExamTypes, invalidateMockExamResults } = useInvalidate();
  const deleteMutation = deleteMockExamType();

  const handleConfirm = async () => {
    if (!target || target.id === undefined) {
      onClose();
      return;
    }

    const codeLabel = target.code ?? target.type ?? '';
    try {
      await deleteMutation.mutateAsync({ params: { path: { id: target.id } } });
      await Promise.all([invalidateMockExamTypes(), invalidateMockExamResults()]);
      toast.success(`${target.displayName ?? codeLabel ?? ''} 삭제됨`);
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const codeLabel = target ? (target.code ?? target.type ?? '') : '';

  return (
    <Modal isOpen={isOpen && !!target} onClose={onClose}>
      {target && (
        <TwoButtonModalTemplate
          text={`${target.displayName ?? ''}(${codeLabel}) 타입을 삭제합니다. 이 타입으로 제출된 학생 응시 결과 데이터는 그대로 유지되지만, 결과 화면에서 타입명 매핑이 끊겨 코드(${codeLabel})로만 표시될 수 있습니다.`}
          leftButtonText='취소'
          rightButtonText={deleteMutation.isPending ? '삭제 중...' : '삭제'}
          variant='danger'
          handleClickLeftButton={onClose}
          handleClickRightButton={handleConfirm}
          rightButtonDisabled={deleteMutation.isPending}
        />
      )}
    </Modal>
  );
};

export default TypeDeleteModal;
