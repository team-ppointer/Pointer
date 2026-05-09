import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { Button, Modal, TwoButtonModalTemplate } from '@components';
import { getSheetActionEdge, putSheetActionEdgeCell } from '@apis';
import { useInvalidate } from '@hooks';
import type { ActionGraphSheetSearchOptions } from '@types';

import type { SearchFilterField } from '@/components/conceptGraph';
import {
  AddActionRowModal,
  CellEditPanel,
  PaginationControls,
  SearchFilterBar,
} from '@/components/conceptGraph';
import type { components } from '@/types/api/schema';

type ConceptNodeResp = components['schemas']['ConceptNodeResp'];
type ActionEdgeTypeCodeResp = components['schemas']['ActionEdgeTypeCodeResp'];
type Row = components['schemas']['Row'];

interface EditingCell {
  actionNode: ConceptNodeResp;
  role: ActionEdgeTypeCodeResp;
  currentNodes: ConceptNodeResp[];
}

export const Route = createFileRoute('/_GNBLayout/concept-graph/action-edge')({
  component: RouteComponent,
});

const DEFAULT_SEARCH_OPTIONS: ActionGraphSheetSearchOptions = {
  page: 0,
  size: 1000,
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

const formatActionNodeLabel = (node: ConceptNodeResp | undefined): string => {
  if (!node) return '';
  const name = node.name ?? '';
  const typeLabel = node.nodeType?.label;
  return typeLabel ? `${name} (${typeLabel})` : name;
};

const MAX_VISIBLE_CHIPS = 5;

function RouteComponent() {
  const { invalidateConceptGraphActionEdges } = useInvalidate();

  const [searchOptions, setSearchOptions] =
    useState<ActionGraphSheetSearchOptions>(DEFAULT_SEARCH_OPTIONS);

  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [isAddRowOpen, setIsAddRowOpen] = useState(false);
  const [deleteRowTarget, setDeleteRowTarget] = useState<Row | null>(null);
  const [isDeletingRow, setIsDeletingRow] = useState(false);

  const sheetQuery = getSheetActionEdge(searchOptions);
  const sheetData = sheetQuery.data?.data;
  const columns: ActionEdgeTypeCodeResp[] = sheetData?.columns ?? [];
  const rows: Row[] = sheetData?.rows ?? [];
  const lastPage = sheetQuery.data?.lastPage ?? 0;

  const putCellMutation = putSheetActionEdgeCell();

  const handleSearchChange = (next: Record<string, unknown>) => {
    const actionNodeName =
      typeof next.actionNodeName === 'string' && next.actionNodeName.trim()
        ? next.actionNodeName.trim()
        : undefined;
    setSearchOptions((prev) => ({
      ...prev,
      page: 0,
      actionNodeName,
    }));
  };

  const handleSearchReset = () => {
    setSearchOptions((prev) => ({
      page: 0,
      size: prev.size,
      direction: prev.direction,
    }));
  };

  const toggleDirection = () => {
    setSearchOptions((prev) => ({
      ...prev,
      direction: prev.direction === 'ASC' ? 'DESC' : 'ASC',
      page: 0,
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchOptions((prev) => ({ ...prev, page }));
  };

  const handleSizeChange = (size: number) => {
    setSearchOptions((prev) => ({ ...prev, size, page: 0 }));
  };

  const openCellEdit = (
    actionNode: ConceptNodeResp,
    role: ActionEdgeTypeCodeResp,
    currentNodes: ConceptNodeResp[]
  ) => {
    setEditingCell({ actionNode, role, currentNodes });
  };
  const closeCellEdit = () => setEditingCell(null);

  const openDeleteRow = (row: Row) => setDeleteRowTarget(row);
  const closeDeleteRow = () => {
    if (isDeletingRow) return;
    setDeleteRowTarget(null);
  };

  const handleConfirmDeleteRow = async () => {
    if (!deleteRowTarget) return;
    const actionNode = deleteRowTarget.actionNode;
    if (!actionNode || actionNode.id === undefined) {
      setDeleteRowTarget(null);
      return;
    }
    setIsDeletingRow(true);
    try {
      await Promise.all(
        columns
          .filter((col) => col.id !== undefined)
          .map((col) =>
            putCellMutation.mutateAsync({
              params: {
                query: { actionNodeId: actionNode.id as number, roleId: col.id as number },
              },
              body: { conceptNodeIds: [] },
            })
          )
      );
      await invalidateConceptGraphActionEdges();
      toast.success('삭제되었습니다');
      setDeleteRowTarget(null);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsDeletingRow(false);
    }
  };

  const filterFields: SearchFilterField[] = [
    {
      name: 'actionNodeName',
      label: 'Action 노드',
      type: 'text',
      placeholder: '액션 노드명 검색',
    },
  ];

  const filterValues: Record<string, unknown> = {
    actionNodeName: searchOptions.actionNodeName ?? '',
  };

  const direction = searchOptions.direction ?? 'ASC';

  const isLoading = sheetQuery.isLoading;
  const showEmpty = !isLoading && rows.length === 0;

  const renderRow = (row: Row, idx: number) => {
    const actionNode = row.actionNode;
    const cells = row.cells ?? [];
    const rowKey = actionNode?.id ?? idx;

    return (
      <tr key={rowKey} className='group hover:bg-main/5 transition-colors'>
        <td className='group-hover:bg-main/5 sticky left-0 z-10 max-w-[240px] truncate border-r border-gray-100 bg-white px-4 py-3 align-middle text-sm font-medium text-gray-800'>
          <div className='flex items-center justify-between gap-2'>
            <span className='truncate'>{formatActionNodeLabel(actionNode)}</span>
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                openDeleteRow(row);
              }}
              aria-label='행 삭제'
              className='hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors group-hover:flex hover:bg-red-50 hover:text-red-600'>
              <Trash2 className='h-3.5 w-3.5' />
            </button>
          </div>
        </td>
        {columns.map((col, colIdx) => {
          const cell = cells[colIdx];
          const cellRoleCode = cell?.roleCode;
          const colCode = col.code;
          if (cell && colCode !== undefined && cellRoleCode !== colCode) {
            console.warn(
              `[action-edge sheet] roleCode mismatch at row ${rowKey} col ${colIdx}: cell.roleCode=${cellRoleCode} columns.code=${colCode}`
            );
            return (
              <td
                key={col.id ?? colIdx}
                className='border-l border-gray-100 px-4 py-3 align-middle text-sm text-gray-300'>
                ⚠
              </td>
            );
          }

          const conceptNodes = cell?.conceptNodes ?? [];
          const visible = conceptNodes.slice(0, MAX_VISIBLE_CHIPS);
          const overflow = conceptNodes.length - visible.length;

          if (!actionNode) return null;

          const handleCellClick = () => {
            openCellEdit(actionNode, col, conceptNodes);
          };

          return (
            <td
              key={col.id ?? colIdx}
              onClick={handleCellClick}
              className='hover:bg-main/10 cursor-pointer border-l border-gray-100 px-4 py-3 align-middle text-sm transition-colors'>
              {conceptNodes.length === 0 ? (
                <span className='text-sm font-medium text-gray-300'>-</span>
              ) : (
                <div className='flex flex-wrap gap-1'>
                  {visible.map((node) => (
                    <div
                      key={node.id}
                      className='inline-flex max-w-[160px] items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700'>
                      <span className='truncate'>{node.name ?? ''}</span>
                    </div>
                  ))}
                  {overflow > 0 && (
                    <div className='inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700'>
                      +{overflow}
                    </div>
                  )}
                </div>
              )}
            </td>
          );
        })}
      </tr>
    );
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

      <div className='space-y-4 p-8'>
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

        <div className='flex items-end justify-between gap-3'>
          <div className='flex flex-1 items-end gap-3'>
            <div className='flex-1'>
              <SearchFilterBar
                fields={filterFields}
                values={filterValues}
                onChange={handleSearchChange}
                onReset={handleSearchReset}
              />
            </div>
            <button
              type='button'
              onClick={toggleDirection}
              className='focus:border-main flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 focus:outline-none'
              aria-label='정렬 방향 토글'>
              {direction === 'ASC' ? (
                <ArrowUp className='h-4 w-4' />
              ) : (
                <ArrowDown className='h-4 w-4' />
              )}
              <span>이름 {direction}</span>
            </button>
          </div>
          <Button type='button' variant='dark' sizeType='sm' onClick={() => setIsAddRowOpen(true)}>
            <Plus className='h-4 w-4' />
            액션 노드 행 추가
          </Button>
        </div>

        <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white'>
          <div className='overflow-x-auto'>
            <table className='w-full table-auto text-sm'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='sticky left-0 z-20 min-w-[220px] border-r border-gray-100 bg-gray-50 px-4 py-3 text-left text-xs font-bold tracking-wider whitespace-nowrap text-gray-600 uppercase'>
                    액션 노드
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.id ?? col.code}
                      className='min-w-[160px] border-l border-gray-100 px-4 py-3 text-left text-xs font-bold tracking-wider whitespace-nowrap text-gray-600 uppercase'>
                      {col.label ?? col.code ?? ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`}>
                      <td className='border-r border-gray-100 px-4 py-4'>
                        <div className='h-3 w-32 animate-pulse rounded bg-gray-100' />
                      </td>
                      {columns.length === 0 ? (
                        <td className='px-4 py-4'>
                          <div className='h-3 w-24 animate-pulse rounded bg-gray-100' />
                        </td>
                      ) : (
                        columns.map((col, colIdx) => (
                          <td key={col.id ?? colIdx} className='border-l border-gray-100 px-4 py-4'>
                            <div className='h-3 w-24 animate-pulse rounded bg-gray-100' />
                          </td>
                        ))
                      )}
                    </tr>
                  ))
                ) : showEmpty ? (
                  <tr>
                    <td
                      colSpan={Math.max(1, columns.length + 1)}
                      className='px-4 py-16 text-center text-sm font-medium text-gray-400'>
                      조건에 맞는 액션 그래프 행이 없습니다.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => renderRow(row, idx))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <PaginationControls
          page={searchOptions.page ?? 0}
          lastPage={lastPage}
          size={searchOptions.size ?? 1000}
          onPageChange={handlePageChange}
          onSizeChange={handleSizeChange}
        />
      </div>

      {editingCell && (
        <CellEditPanel
          open={true}
          actionNode={editingCell.actionNode}
          role={editingCell.role}
          currentNodes={editingCell.currentNodes}
          onClose={closeCellEdit}
          onSaved={() => undefined}
        />
      )}

      <Modal isOpen={isAddRowOpen} onClose={() => setIsAddRowOpen(false)}>
        {isAddRowOpen && (
          <AddActionRowModal onClose={() => setIsAddRowOpen(false)} onSaved={() => undefined} />
        )}
      </Modal>

      <Modal isOpen={deleteRowTarget !== null} onClose={closeDeleteRow}>
        <TwoButtonModalTemplate
          text={
            deleteRowTarget
              ? `액션 노드 '${deleteRowTarget.actionNode?.name ?? ''}' 의 모든 셀을 비웁니다. 그러면 시트에서 행이 사라집니다. 진행할까요?`
              : ''
          }
          leftButtonText='아니오'
          rightButtonText='예'
          variant='danger'
          handleClickLeftButton={closeDeleteRow}
          handleClickRightButton={handleConfirmDeleteRow}
        />
      </Modal>
    </div>
  );
}
