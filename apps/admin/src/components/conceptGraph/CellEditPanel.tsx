import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button, Modal, TwoButtonModalTemplate } from '@components';
import { getSheetNode, putSheetActionEdgeCell } from '@apis';
import { useInvalidate } from '@hooks';

import type { components } from '@/types/api/schema';

type ConceptNodeResp = components['schemas']['ConceptNodeResp'];
type ActionEdgeTypeCodeResp = components['schemas']['ActionEdgeTypeCodeResp'];

interface CellEditPanelProps {
  open: boolean;
  actionNode: ConceptNodeResp;
  role: ActionEdgeTypeCodeResp;
  currentNodes: ConceptNodeResp[];
  onClose: () => void;
  onSaved: () => void;
}

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

const sameIdSet = (a: ConceptNodeResp[], b: ConceptNodeResp[]): boolean => {
  if (a.length !== b.length) return false;
  const idsA = new Set(a.map((n) => n.id));
  for (const n of b) {
    if (!idsA.has(n.id)) return false;
  }
  return true;
};

const formatNodeLabel = (node: ConceptNodeResp): string => {
  const name = node.name ?? '';
  const typeLabel = node.nodeType?.label;
  return typeLabel ? `${name} (${typeLabel})` : name;
};

const CellEditPanel = ({
  open,
  actionNode,
  role,
  currentNodes,
  onClose,
  onSaved,
}: CellEditPanelProps) => {
  const { invalidateConceptGraphActionEdges } = useInvalidate();

  const [selectedNodes, setSelectedNodes] = useState<ConceptNodeResp[]>(currentNodes);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

  const putCellMutation = putSheetActionEdgeCell();

  useEffect(() => {
    if (open) {
      setSelectedNodes(currentNodes);
      setQuery('');
      setDebouncedQuery('');
      setConfirmCloseOpen(false);
    }
  }, [open, currentNodes]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 200);
    return () => clearTimeout(timer);
  }, [query]);

  const isDirty = useMemo(
    () => !sameIdSet(selectedNodes, currentNodes),
    [selectedNodes, currentNodes]
  );

  const sheetQuery = getSheetNode({
    page: 0,
    size: 50,
    name: debouncedQuery.length > 0 ? debouncedQuery : undefined,
  });

  const candidates: ConceptNodeResp[] = sheetQuery.data?.data ?? [];

  const filtered = useMemo(() => {
    const selectedIds = new Set(selectedNodes.map((n) => n.id));
    return candidates.filter((c) => c.id !== undefined && !selectedIds.has(c.id));
  }, [candidates, selectedNodes]);

  const requestClose = () => {
    if (isDirty) {
      setConfirmCloseOpen(true);
      return;
    }
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        requestClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, isDirty]);

  const handleAdd = (node: ConceptNodeResp) => {
    if (node.id === undefined) return;
    if (selectedNodes.some((n) => n.id === node.id)) return;
    setSelectedNodes((prev) => [...prev, node]);
  };

  const handleRemove = (id: number | undefined) => {
    if (id === undefined) return;
    setSelectedNodes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleReset = () => {
    setSelectedNodes(currentNodes);
  };

  const handleSave = async () => {
    if (actionNode.id === undefined || role.id === undefined) return;
    try {
      await putCellMutation.mutateAsync({
        params: {
          query: { actionNodeId: actionNode.id, roleId: role.id },
        },
        body: {
          conceptNodeIds: selectedNodes
            .map((n) => n.id)
            .filter((id): id is number => id !== undefined),
        },
      });
      await invalidateConceptGraphActionEdges();
      toast.success('저장되었습니다');
      onSaved();
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  if (!open) return null;

  return (
    <>
      <div className='fixed inset-0 z-40 bg-black/30' onClick={requestClose} aria-hidden='true' />
      <aside
        className='fixed inset-y-0 right-0 z-50 flex w-[480px] flex-col bg-white shadow-xl'
        role='dialog'
        aria-label='셀 편집'>
        <div className='flex items-start justify-between border-b border-gray-100 px-6 py-5'>
          <div className='min-w-0'>
            <p className='text-xs font-semibold tracking-wider text-gray-500 uppercase'>셀 편집</p>
            <h2 className='mt-1 truncate text-lg font-bold text-gray-900'>
              {actionNode.name ?? ''} <span className='text-gray-400'>→</span>{' '}
              <span className='text-main'>{role.label ?? ''}</span>
            </h2>
            {actionNode.nodeType?.label && (
              <p className='mt-1 text-xs text-gray-500'>{actionNode.nodeType.label}</p>
            )}
          </div>
          <button
            type='button'
            onClick={requestClose}
            aria-label='닫기'
            className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'>
            <X className='h-5 w-5' />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto px-6 py-5'>
          <section className='mb-6'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='text-sm font-semibold text-gray-700'>선택된 노드</h3>
              <span className='text-xs font-medium text-gray-400'>{selectedNodes.length}개</span>
            </div>
            {selectedNodes.length === 0 ? (
              <div className='rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-xs text-gray-400'>
                선택된 노드가 없습니다. 저장 시 셀이 비워집니다.
              </div>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {selectedNodes.map((node) => (
                  <span
                    key={node.id}
                    className='bg-main/10 text-main inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium'>
                    <span className='max-w-[200px] truncate'>{formatNodeLabel(node)}</span>
                    <button
                      type='button'
                      onClick={() => handleRemove(node.id)}
                      aria-label='제거'
                      className='hover:bg-main/20 flex h-4 w-4 items-center justify-center rounded-full'>
                      <X className='h-3 w-3' />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className='mb-2 text-sm font-semibold text-gray-700'>노드 검색</h3>
            <div className='relative mb-3'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='노드명 검색...'
                className='focus:border-main h-10 w-full rounded-xl border border-gray-200 bg-white pr-3 pl-9 text-sm placeholder-gray-400 focus:outline-none'
              />
            </div>
            <div className='max-h-[40vh] overflow-y-auto rounded-xl border border-gray-200'>
              {sheetQuery.isLoading ? (
                <div className='py-6 text-center text-sm text-gray-400'>불러오는 중...</div>
              ) : filtered.length === 0 ? (
                <div className='py-6 text-center text-sm text-gray-400'>
                  일치하는 노드가 없습니다.
                </div>
              ) : (
                <ul className='divide-y divide-gray-100'>
                  {filtered.map((node) => (
                    <li
                      key={node.id}
                      className='flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-gray-50'>
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-medium text-gray-800'>
                          {node.name ?? ''}
                        </p>
                        {node.nodeType?.label && (
                          <p className='mt-0.5 text-xs text-gray-500'>{node.nodeType.label}</p>
                        )}
                      </div>
                      <button
                        type='button'
                        onClick={() => handleAdd(node)}
                        className='hover:bg-main/10 hover:text-main flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700'>
                        <Plus className='h-3.5 w-3.5' />
                        추가
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <div className='flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4'>
          <Button
            type='button'
            variant='light'
            onClick={handleReset}
            disabled={putCellMutation.isPending || !isDirty}>
            초기화
          </Button>
          <Button
            type='button'
            variant='dark'
            onClick={handleSave}
            disabled={putCellMutation.isPending}>
            저장
          </Button>
        </div>
      </aside>

      <Modal isOpen={confirmCloseOpen} onClose={() => setConfirmCloseOpen(false)}>
        <TwoButtonModalTemplate
          text='변경사항이 저장되지 않았습니다. 그래도 닫을까요?'
          leftButtonText='취소'
          rightButtonText='닫기'
          variant='danger'
          handleClickLeftButton={() => setConfirmCloseOpen(false)}
          handleClickRightButton={() => {
            setConfirmCloseOpen(false);
            onClose();
          }}
        />
      </Modal>
    </>
  );
};

export default CellEditPanel;
