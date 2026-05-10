import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Plus } from 'lucide-react';
import { Slide, ToastContainer } from 'react-toastify';
import { Header, Modal } from '@components';
import { getMockExamTypes } from '@apis';
import { useModal } from '@hooks';

import TypeFormModal from './-components/TypeFormModal';
import TypeDeleteModal from './-components/TypeDeleteModal';

import { RowActions, SheetTable } from '@/components/conceptGraph';
import type { SheetColumn } from '@/components/conceptGraph';
import type { components } from '@/types/api/schema';

type MockExamType = components['schemas']['MockExamTypeResp'];

type TypeStatus = 'before' | 'active' | 'after';

export const Route = createFileRoute('/_GNBLayout/mock-exam-types/')({
  component: RouteComponent,
});

const getTypeStatus = (today: string, start?: string, end?: string): TypeStatus => {
  if (!start || !end) return 'before';
  if (today < start) return 'before';
  if (today > end) return 'after';
  return 'active';
};

const STATUS_BADGE: Record<TypeStatus, { label: string; className: string }> = {
  before: {
    label: '예정',
    className: 'bg-gray-100 text-gray-600',
  },
  active: {
    label: '활성',
    className: 'bg-main/10 text-main',
  },
  after: {
    label: '종료',
    className: 'bg-gray-100 text-gray-500',
  },
};

function RouteComponent() {
  const today = dayjs().format('YYYY-MM-DD');

  const { data, isLoading } = getMockExamTypes();

  const sortedRows = useMemo<MockExamType[]>(() => {
    const rows = data?.data ?? [];
    return [...rows].sort((a, b) => {
      const aStart = a.startDate ?? '';
      const bStart = b.startDate ?? '';
      if (aStart === bStart) return 0;
      return aStart < bStart ? 1 : -1;
    });
  }, [data]);

  const { isOpen: isFormOpen, openModal: openFormModal, closeModal: closeFormModal } = useModal();
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const [editTarget, setEditTarget] = useState<MockExamType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MockExamType | null>(null);

  const handleOpenCreate = () => {
    setEditTarget(null);
    openFormModal();
  };

  const handleOpenEdit = (row: MockExamType) => {
    setEditTarget(row);
    openFormModal();
  };

  const handleCloseForm = () => {
    closeFormModal();
    setEditTarget(null);
  };

  const handleOpenDelete = (row: MockExamType) => {
    setDeleteTarget(row);
    openDeleteModal();
  };

  const handleCloseDelete = () => {
    closeDeleteModal();
    setDeleteTarget(null);
  };

  const columns: SheetColumn<MockExamType>[] = [
    {
      key: 'code',
      label: '코드',
      width: '160px',
      render: (row) => <span className='font-mono text-xs text-gray-500'>{row.code ?? ''}</span>,
    },
    {
      key: 'displayName',
      label: '표시명',
      render: (row) => <span className='font-semibold text-gray-900'>{row.displayName ?? ''}</span>,
    },
    {
      key: 'startDate',
      label: '시작일',
      width: '140px',
      render: (row) => row.startDate ?? '',
    },
    {
      key: 'endDate',
      label: '종료일',
      width: '140px',
      render: (row) => row.endDate ?? '',
    },
    {
      key: 'status',
      label: '상태',
      width: '120px',
      render: (row) => {
        const status = getTypeStatus(today, row.startDate, row.endDate);
        const badge = STATUS_BADGE[status];
        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
            {badge.label}
          </span>
        );
      },
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <ToastContainer
        position='top-center'
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        draggable
        pauseOnHover
        theme='light'
        transition={Slide}
      />
      <Header title='모의고사 타입 관리'>
        <Header.Button Icon={Plus} color='main' onClick={handleOpenCreate}>
          타입 추가
        </Header.Button>
      </Header>

      <div className='mx-auto max-w-7xl px-8 py-8'>
        <SheetTable<MockExamType>
          columns={columns}
          rows={sortedRows}
          loading={isLoading}
          emptyMessage='등록된 모의고사 타입이 없습니다.'
          rowKey={(row, idx) => row.id ?? idx}
          actions={(row) => (
            <RowActions onEdit={() => handleOpenEdit(row)} onDelete={() => handleOpenDelete(row)} />
          )}
        />
      </div>

      <Modal isOpen={isFormOpen} onClose={handleCloseForm}>
        {isFormOpen && (
          <TypeFormModal
            mode={editTarget ? 'edit' : 'create'}
            target={editTarget ?? undefined}
            onClose={handleCloseForm}
          />
        )}
      </Modal>

      <TypeDeleteModal isOpen={isDeleteOpen} target={deleteTarget} onClose={handleCloseDelete} />
    </div>
  );
}
