import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { Button, Header, Modal, Tag, TwoButtonModalTemplate } from '@components';
import { deleteEdge, getEdgeType, getSheetEdge } from '@apis';
import { useInvalidate } from '@hooks';
import type { ConceptEdgeSheetSearchOptions } from '@types';

import type { SearchFilterField, SheetColumn, SheetSortDirection } from '@/components/conceptGraph';
import {
  EditConceptEdgeModal,
  PaginationControls,
  RowActions,
  SearchFilterBar,
  SheetTable,
} from '@/components/conceptGraph';
import type { components } from '@/types/api/schema';

type ConceptEdgeResp = components['schemas']['ConceptEdgeResp'];

type EdgeSortKey = NonNullable<ConceptEdgeSheetSearchOptions['sort']>;

interface EditState {
  mode: 'create' | 'edit';
  target?: ConceptEdgeResp;
}

export const Route = createFileRoute('/_GNBLayout/concept-graph/edge')({
  component: RouteComponent,
});

const DEFAULT_SEARCH_OPTIONS: ConceptEdgeSheetSearchOptions = {
  page: 0,
  size: 1000,
  sort: 'FROM_NAME',
  direction: 'ASC',
};

const extractErrorMessage = (error: unknown): string => {
  const fallback = '요청에 실패했습니다';
  if (!error || typeof error !== 'object') return fallback;
  const responseData = (error as { response?: { data?: { message?: unknown } } }).response?.data
    ?.message;
  if (typeof responseData === 'string' && responseData.length > 0) return responseData;
  const maybeMessage = (error as { message?: unknown }).message;
  if (typeof maybeMessage === 'string' && maybeMessage.length > 0) return maybeMessage;
  return fallback;
};

const formatNode = (node: ConceptEdgeResp['fromNode']): string => {
  if (!node) return '';
  const name = node.name ?? '';
  const typeLabel = node.nodeType?.label;
  return typeLabel ? `${name} (${typeLabel})` : name;
};

function RouteComponent() {
  const { invalidateConceptGraphEdges } = useInvalidate();

  const [searchOptions, setSearchOptions] =
    useState<ConceptEdgeSheetSearchOptions>(DEFAULT_SEARCH_OPTIONS);

  const [editState, setEditState] = useState<EditState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConceptEdgeResp | null>(null);

  const { data: edgeTypeData } = getEdgeType();
  const edgeTypeOptions = useMemo(() => {
    const items = edgeTypeData?.data ?? [];
    return items.map((t) => ({ value: String(t.id ?? ''), label: t.label ?? '' }));
  }, [edgeTypeData]);

  const sheetQuery = getSheetEdge(searchOptions);
  const rows = sheetQuery.data?.data ?? [];
  const lastPage = sheetQuery.data?.lastPage ?? 0;

  const deleteEdgeMutation = deleteEdge();

  const handleSearchChange = (next: Record<string, unknown>) => {
    const fromNodeName =
      typeof next.fromNodeName === 'string' && next.fromNodeName.trim()
        ? next.fromNodeName.trim()
        : undefined;
    const toNodeName =
      typeof next.toNodeName === 'string' && next.toNodeName.trim()
        ? next.toNodeName.trim()
        : undefined;
    const edgeTypeIdRaw =
      typeof next.edgeTypeId === 'string' && next.edgeTypeId.length > 0
        ? Number(next.edgeTypeId)
        : undefined;

    setSearchOptions((prev) => ({
      ...prev,
      page: 0,
      fromNodeName,
      toNodeName,
      edgeTypeId: edgeTypeIdRaw,
    }));
  };

  const handleSearchReset = () => {
    setSearchOptions((prev) => ({
      page: 0,
      size: prev.size,
      sort: prev.sort,
      direction: prev.direction,
    }));
  };

  const handleSortChange = (key: string, direction: SheetSortDirection) => {
    setSearchOptions((prev) => ({
      ...prev,
      sort: key as EdgeSortKey,
      direction,
      page: 0,
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchOptions((prev) => ({ ...prev, page }));
  };

  const handleSizeChange = (size: number) => {
    setSearchOptions((prev) => ({ ...prev, size, page: 0 }));
  };

  const openCreate = () => setEditState({ mode: 'create' });
  const openEdit = (target: ConceptEdgeResp) => setEditState({ mode: 'edit', target });
  const closeEdit = () => setEditState(null);

  const openDelete = (target: ConceptEdgeResp) => setDeleteTarget(target);
  const closeDelete = () => setDeleteTarget(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleteTarget.id === undefined) {
      closeDelete();
      return;
    }
    try {
      await deleteEdgeMutation.mutateAsync({ params: { path: { id: deleteTarget.id } } });
      await invalidateConceptGraphEdges();
      toast.success('삭제되었습니다');
      closeDelete();
    } catch (error) {
      toast.error(extractErrorMessage(error));
      closeDelete();
    }
  };

  const filterFields: SearchFilterField[] = [
    { name: 'fromNodeName', label: 'From', type: 'text', placeholder: 'From 노드명' },
    {
      name: 'edgeTypeId',
      label: '관계',
      type: 'select',
      placeholder: '전체',
      options: edgeTypeOptions,
    },
    { name: 'toNodeName', label: 'To', type: 'text', placeholder: 'To 노드명' },
  ];

  const filterValues: Record<string, unknown> = {
    fromNodeName: searchOptions.fromNodeName ?? '',
    edgeTypeId: searchOptions.edgeTypeId !== undefined ? String(searchOptions.edgeTypeId) : '',
    toNodeName: searchOptions.toNodeName ?? '',
  };

  const columns: SheetColumn<ConceptEdgeResp>[] = [
    {
      key: 'FROM_NAME',
      label: 'From',
      sortable: true,
      render: (row) => formatNode(row.fromNode),
    },
    {
      key: 'EDGE_TYPE',
      label: '관계',
      sortable: true,
      render: (row) => (row.edgeType?.label ? <Tag label={row.edgeType.label} color='dark' /> : ''),
    },
    {
      key: 'TO_NAME',
      label: 'To',
      sortable: true,
      render: (row) => formatNode(row.toNode),
    },
  ];

  const sortState = {
    key: searchOptions.sort ?? 'FROM_NAME',
    direction: (searchOptions.direction ?? 'ASC') as SheetSortDirection,
  };

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

      <Header title='개념 그래프'>
        <Header.Button Icon={Plus} color='main' onClick={openCreate}>
          엣지 추가
        </Header.Button>
      </Header>

      <div className='mx-auto max-w-7xl space-y-4 px-8 py-8'>
        {sheetQuery.isError && (
          <div className='flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700'>
            <span>데이터를 불러오지 못했습니다. 새로고침해주세요.</span>
            <Button
              type='button'
              variant='light'
              sizeType='sm'
              onClick={() => sheetQuery.refetch()}>
              재시도
            </Button>
          </div>
        )}

        <SearchFilterBar
          fields={filterFields}
          values={filterValues}
          onChange={handleSearchChange}
          onReset={handleSearchReset}
        />

        <SheetTable<ConceptEdgeResp>
          columns={columns}
          rows={rows}
          loading={sheetQuery.isLoading}
          emptyMessage='조건에 맞는 엣지가 없습니다.'
          sort={sortState}
          onSortChange={handleSortChange}
          rowKey={(row, idx) => row.id ?? idx}
          actions={(row) => (
            <RowActions onEdit={() => openEdit(row)} onDelete={() => openDelete(row)} />
          )}
        />

        <PaginationControls
          page={searchOptions.page ?? 0}
          lastPage={lastPage}
          size={searchOptions.size ?? 1000}
          onPageChange={handlePageChange}
          onSizeChange={handleSizeChange}
        />
      </div>

      <Modal isOpen={editState !== null} onClose={closeEdit}>
        {editState && (
          <EditConceptEdgeModal
            target={editState.target}
            onClose={closeEdit}
            onSaved={() => undefined}
          />
        )}
      </Modal>

      <Modal isOpen={deleteTarget !== null} onClose={closeDelete}>
        <TwoButtonModalTemplate
          text={
            deleteTarget
              ? `엣지 (${deleteTarget.fromNode?.name ?? ''} → ${deleteTarget.toNode?.name ?? ''}) 을 삭제할까요?`
              : ''
          }
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
