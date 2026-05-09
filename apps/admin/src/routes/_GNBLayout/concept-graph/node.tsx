import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { Button, Header, Modal, TwoButtonModalTemplate } from '@components';
import { deleteNode, getNodeType, getSheetNode } from '@apis';
import { useInvalidate } from '@hooks';
import { InlineProblemViewer } from '@repo/pointer-editor-v2';
import type { ConceptNodeSheetSearchOptions } from '@types';

import '@repo/pointer-editor-v2/style.css';

import type { SearchFilterField, SheetColumn, SheetSortDirection } from '@/components/conceptGraph';
import {
  EditConceptNodeModal,
  PaginationControls,
  RowActions,
  SearchFilterBar,
  SheetTable,
} from '@/components/conceptGraph';
import type { components } from '@/types/api/schema';

type ConceptNodeResp = components['schemas']['ConceptNodeResp'];

type NodeSortKey = NonNullable<ConceptNodeSheetSearchOptions['sort']>;

interface EditState {
  mode: 'create' | 'edit';
  target?: ConceptNodeResp;
}

export const Route = createFileRoute('/_GNBLayout/concept-graph/node')({
  component: RouteComponent,
});

const DEFAULT_SEARCH_OPTIONS: ConceptNodeSheetSearchOptions = {
  page: 0,
  size: 1000,
  sort: 'NAME',
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

const truncatePayload = (payload: ConceptNodeResp['payload']): string => {
  if (!payload) return '';
  try {
    const serialized = JSON.stringify(payload);
    if (serialized.length <= 80) return serialized;
    return `${serialized.slice(0, 80)}…`;
  } catch {
    return '';
  }
};

const formatPayload = (payload: ConceptNodeResp['payload']): string => {
  if (!payload) return '{}';
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return '';
  }
};

function RouteComponent() {
  const { invalidateConceptGraphNodes } = useInvalidate();

  const [searchOptions, setSearchOptions] =
    useState<ConceptNodeSheetSearchOptions>(DEFAULT_SEARCH_OPTIONS);

  const [editState, setEditState] = useState<EditState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConceptNodeResp | null>(null);
  const [payloadPreview, setPayloadPreview] = useState<ConceptNodeResp | null>(null);

  const { data: nodeTypeData } = getNodeType();
  const nodeTypeOptions = useMemo(() => {
    const items = nodeTypeData?.data ?? [];
    return items.map((t) => ({ value: String(t.id ?? ''), label: t.label ?? '' }));
  }, [nodeTypeData]);

  const sheetQuery = getSheetNode(searchOptions);
  const rows = sheetQuery.data?.data ?? [];
  const lastPage = sheetQuery.data?.lastPage ?? 0;

  const deleteNodeMutation = deleteNode();

  const handleSearchChange = (next: Record<string, unknown>) => {
    const name = typeof next.name === 'string' && next.name.trim() ? next.name.trim() : undefined;
    const description =
      typeof next.description === 'string' && next.description.trim()
        ? next.description.trim()
        : undefined;
    const nodeTypeIdRaw =
      typeof next.nodeTypeId === 'string' && next.nodeTypeId.length > 0
        ? Number(next.nodeTypeId)
        : undefined;

    setSearchOptions((prev) => ({
      ...prev,
      page: 0,
      name,
      description,
      nodeTypeId: nodeTypeIdRaw,
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
      sort: key as NodeSortKey,
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
  const openEdit = (target: ConceptNodeResp) => setEditState({ mode: 'edit', target });
  const closeEdit = () => setEditState(null);

  const openDelete = (target: ConceptNodeResp) => setDeleteTarget(target);
  const closeDelete = () => setDeleteTarget(null);

  const closePayloadPreview = () => setPayloadPreview(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleteTarget.id === undefined) {
      closeDelete();
      return;
    }
    try {
      await deleteNodeMutation.mutateAsync({ params: { path: { id: deleteTarget.id } } });
      await invalidateConceptGraphNodes();
      toast.success('삭제되었습니다');
      closeDelete();
    } catch (error) {
      toast.error(extractErrorMessage(error));
      closeDelete();
    }
  };

  const filterFields: SearchFilterField[] = [
    { name: 'name', label: '이름', type: 'text', placeholder: '노드명 검색' },
    { name: 'description', label: '설명', type: 'text', placeholder: '설명 검색' },
    {
      name: 'nodeTypeId',
      label: '타입',
      type: 'select',
      placeholder: '전체',
      options: nodeTypeOptions,
    },
  ];

  const filterValues: Record<string, unknown> = {
    name: searchOptions.name ?? '',
    description: searchOptions.description ?? '',
    nodeTypeId: searchOptions.nodeTypeId !== undefined ? String(searchOptions.nodeTypeId) : '',
  };

  const columns: SheetColumn<ConceptNodeResp>[] = [
    { key: 'NAME', label: '이름', sortable: true, render: (row) => row.name ?? '' },
    {
      key: 'NODE_TYPE',
      label: '타입',
      sortable: true,
      width: '120px',
      render: (row) =>
        row.nodeType?.label ? (
          <span className='bg-main/10 text-main inline-block rounded-md px-1.5 py-0.5 text-xs font-medium'>
            {row.nodeType.label}
          </span>
        ) : (
          ''
        ),
    },
    {
      key: 'DESCRIPTION',
      label: '설명',
      sortable: true,
      render: (row) =>
        row.description ? (
          <InlineProblemViewer maxLine={2}>{row.description}</InlineProblemViewer>
        ) : (
          ''
        ),
    },
    {
      key: 'payload',
      label: 'Payload',
      render: (row) => {
        if (row.nodeType?.code === 'Action') {
          const payload = row.payload as
            | { example?: unknown; pointingExample?: unknown }
            | undefined;
          const example = typeof payload?.example === 'string' ? payload.example : '';
          const pointingExample =
            typeof payload?.pointingExample === 'string' ? payload.pointingExample : '';
          if (!example && !pointingExample) {
            return <span className='text-xs text-gray-400'>-</span>;
          }
          return (
            <div className='max-w-[360px] space-y-1.5 text-xs text-gray-700'>
              {example && (
                <div className='flex items-center gap-2'>
                  <span className='inline-flex shrink-0 items-center rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-gray-600'>
                    예시
                  </span>
                  <InlineProblemViewer maxLine={1} className='flex-1'>
                    {example}
                  </InlineProblemViewer>
                </div>
              )}
              {pointingExample && (
                <div className='flex items-center gap-2'>
                  <span className='inline-flex shrink-0 items-center rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-gray-600'>
                    포인팅
                  </span>
                  <InlineProblemViewer maxLine={1} className='flex-1'>
                    {pointingExample}
                  </InlineProblemViewer>
                </div>
              )}
            </div>
          );
        }
        return (
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              setPayloadPreview(row);
            }}
            className='hover:text-main max-w-[280px] truncate text-left font-mono text-xs text-gray-600 transition-colors'>
            {truncatePayload(row.payload) || '-'}
          </button>
        );
      },
    },
  ];

  const sortState = {
    key: searchOptions.sort ?? 'NAME',
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

      <Header title='개념 노드'>
        <Header.Button Icon={Plus} color='main' onClick={openCreate}>
          노드 추가
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

        <SheetTable<ConceptNodeResp>
          columns={columns}
          rows={rows}
          loading={sheetQuery.isLoading}
          emptyMessage='조건에 맞는 노드가 없습니다.'
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
          <EditConceptNodeModal
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
              ? `노드 '${deleteTarget.name ?? ''}' 을 삭제할까요? 이 노드를 참조하는 엣지가 있으면 함께 영향이 갈 수 있습니다.`
              : ''
          }
          leftButtonText='아니오'
          rightButtonText='예'
          variant='danger'
          handleClickLeftButton={closeDelete}
          handleClickRightButton={handleConfirmDelete}
        />
      </Modal>

      <Modal isOpen={payloadPreview !== null} onClose={closePayloadPreview}>
        {payloadPreview && (
          <div className='w-[560px] rounded-2xl bg-white p-8'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-bold text-gray-900'>
                Payload — {payloadPreview.name ?? ''}
              </h3>
              <button
                type='button'
                onClick={closePayloadPreview}
                aria-label='닫기'
                className='flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'>
                ×
              </button>
            </div>
            <pre className='max-h-[60vh] overflow-auto rounded-xl bg-gray-50 p-4 font-mono text-xs text-gray-800'>
              {formatPayload(payloadPreview.payload)}
            </pre>
            <div className='mt-4 flex justify-end'>
              <Button type='button' variant='light' onClick={closePayloadPreview}>
                닫기
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
