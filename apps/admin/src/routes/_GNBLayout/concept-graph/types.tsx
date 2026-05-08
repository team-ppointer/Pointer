import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { Button, Modal, TwoButtonModalTemplate } from '@components';
import {
  deleteActionEdgeType,
  deleteEdgeType,
  deleteNodeType,
  getActionEdgeType,
  getEdgeType,
  getNodeType,
} from '@apis';
import { useInvalidate } from '@hooks';

import type { SheetColumn, TypeCodeKind, TypeCodeTarget } from '@/components/conceptGraph';
import {
  ConceptGraphTabs,
  EditTypeCodeModal,
  RowActions,
  SheetTable,
} from '@/components/conceptGraph';
import type { components } from '@/types/api/schema';

type NodeTypeCodeResp = components['schemas']['NodeTypeCodeResp'];
type EdgeTypeCodeResp = components['schemas']['EdgeTypeCodeResp'];
type ActionEdgeTypeCodeResp = components['schemas']['ActionEdgeTypeCodeResp'];

type TypeCodeRow = NodeTypeCodeResp | EdgeTypeCodeResp | ActionEdgeTypeCodeResp;

type EditState = {
  kind: TypeCodeKind;
  mode: 'create' | 'edit';
  target?: TypeCodeTarget;
};

type DeleteState = {
  kind: TypeCodeKind;
  target: TypeCodeTarget;
};

export const Route = createFileRoute('/_GNBLayout/concept-graph/types')({
  component: RouteComponent,
});

const extractErrorMessage = (error: unknown): string => {
  const fallback = '요청에 실패했습니다';
  if (!error || typeof error !== 'object') return fallback;
  const maybeMessage = (error as { message?: unknown }).message;
  if (typeof maybeMessage === 'string' && maybeMessage.length > 0) return maybeMessage;
  const responseData = (error as { response?: { data?: { message?: unknown } } }).response?.data
    ?.message;
  if (typeof responseData === 'string' && responseData.length > 0) return responseData;
  return fallback;
};

interface SectionProps {
  title: string;
  caption?: string;
  rows: TypeCodeRow[] | undefined;
  loading: boolean;
  onCreate: () => void;
  onEdit: (row: TypeCodeRow) => void;
  onDelete: (row: TypeCodeRow) => void;
}

const TYPE_COLUMNS: SheetColumn<TypeCodeRow>[] = [
  { key: 'id', label: 'ID', width: '80px', render: (row) => row.id ?? '' },
  { key: 'code', label: '코드', render: (row) => row.code ?? '' },
  { key: 'label', label: '라벨', render: (row) => row.label ?? '' },
  { key: 'description', label: '설명', render: (row) => row.description ?? '' },
];

const TypeSection = ({
  title,
  caption,
  rows,
  loading,
  onCreate,
  onEdit,
  onDelete,
}: SectionProps) => {
  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-bold text-gray-900'>{title}</h2>
          {caption && <p className='mt-1 text-xs text-gray-500'>{caption}</p>}
        </div>
        <Button type='button' variant='dark' sizeType='sm' onClick={onCreate}>
          <Plus className='h-4 w-4' />새 타입
        </Button>
      </div>
      <SheetTable<TypeCodeRow>
        columns={TYPE_COLUMNS}
        rows={rows ?? []}
        loading={loading}
        emptyMessage='등록된 타입이 없습니다.'
        rowKey={(row, idx) => row.id ?? idx}
        actions={(row) => <RowActions onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />}
      />
    </section>
  );
};

function RouteComponent() {
  const { invalidateConceptGraphTypes } = useInvalidate();

  const { data: nodeTypeData, isLoading: isNodeLoading } = getNodeType();
  const { data: edgeTypeData, isLoading: isEdgeLoading } = getEdgeType();
  const { data: actionEdgeTypeData, isLoading: isActionLoading } = getActionEdgeType();

  const nodeTypes = useMemo<TypeCodeRow[]>(() => nodeTypeData?.data ?? [], [nodeTypeData]);
  const edgeTypes = useMemo<TypeCodeRow[]>(() => edgeTypeData?.data ?? [], [edgeTypeData]);
  const actionEdgeTypes = useMemo<TypeCodeRow[]>(
    () => actionEdgeTypeData?.data ?? [],
    [actionEdgeTypeData]
  );

  const [editState, setEditState] = useState<EditState | null>(null);
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);

  const deleteNodeTypeMutation = deleteNodeType();
  const deleteEdgeTypeMutation = deleteEdgeType();
  const deleteActionEdgeTypeMutation = deleteActionEdgeType();

  const openCreate = (kind: TypeCodeKind) => {
    setEditState({ kind, mode: 'create' });
  };

  const openEdit = (kind: TypeCodeKind, target: TypeCodeRow) => {
    setEditState({ kind, mode: 'edit', target });
  };

  const closeEdit = () => setEditState(null);

  const openDelete = (kind: TypeCodeKind, target: TypeCodeRow) => {
    setDeleteState({ kind, target });
  };

  const closeDelete = () => setDeleteState(null);

  const handleConfirmDelete = async () => {
    if (!deleteState || deleteState.target.id === undefined) {
      closeDelete();
      return;
    }
    const id = deleteState.target.id;
    try {
      if (deleteState.kind === 'node') {
        await deleteNodeTypeMutation.mutateAsync({ params: { path: { id } } });
      } else if (deleteState.kind === 'edge') {
        await deleteEdgeTypeMutation.mutateAsync({ params: { path: { id } } });
      } else {
        await deleteActionEdgeTypeMutation.mutateAsync({ params: { path: { id } } });
      }
      await invalidateConceptGraphTypes();
      toast.success('삭제되었습니다');
      closeDelete();
    } catch (error) {
      toast.error(extractErrorMessage(error));
      closeDelete();
    }
  };

  const deleteLabel = deleteState?.target.label ?? '';
  const deleteText = deleteState
    ? `[타입 삭제] '${deleteLabel}' 타입을 삭제할까요? 이 타입을 사용하는 노드/엣지가 있으면 삭제가 거부될 수 있습니다.`
    : '';

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
      <ConceptGraphTabs />
      <div className='space-y-10 p-8'>
        <TypeSection
          title='노드 타입'
          rows={nodeTypes}
          loading={isNodeLoading}
          onCreate={() => openCreate('node')}
          onEdit={(row) => openEdit('node', row)}
          onDelete={(row) => openDelete('node', row)}
        />
        <TypeSection
          title='엣지 타입'
          rows={edgeTypes}
          loading={isEdgeLoading}
          onCreate={() => openCreate('edge')}
          onEdit={(row) => openEdit('edge', row)}
          onDelete={(row) => openDelete('edge', row)}
        />
        <TypeSection
          title='액션 엣지 타입'
          caption='code 가 액션 그래프 시트의 컬럼 정렬 키로 사용됩니다 (오름차순).'
          rows={actionEdgeTypes}
          loading={isActionLoading}
          onCreate={() => openCreate('actionEdge')}
          onEdit={(row) => openEdit('actionEdge', row)}
          onDelete={(row) => openDelete('actionEdge', row)}
        />
      </div>

      <Modal isOpen={editState !== null} onClose={closeEdit}>
        {editState && (
          <EditTypeCodeModal
            kind={editState.kind}
            target={editState.target}
            onClose={closeEdit}
            onSaved={() => undefined}
          />
        )}
      </Modal>

      <Modal isOpen={deleteState !== null} onClose={closeDelete}>
        <TwoButtonModalTemplate
          text={deleteText}
          leftButtonText='아니오'
          rightButtonText='예'
          variant='danger'
          handleClickLeftButton={closeDelete}
          handleClickRightButton={handleConfirmDelete}
        />
      </Modal>
    </div>
  );
}
