import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Plus, Search, Sparkles, X } from 'lucide-react';
import { Button } from '@components';
import { getActionEdgeType, getNodeType, getSheetNode, putSheetActionEdgeCell } from '@apis';
import { useInvalidate } from '@hooks';

import NodeSearchSelect from './NodeSearchSelect';

import type { components } from '@/types/api/schema';

type ConceptNodeResp = components['schemas']['ConceptNodeResp'];

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

const ACTION_NODE_TYPE_CODE = 'ACTION';

const formSchema = z.object({
  actionNodeId: z.string().min(1, '액션 노드를 선택해주세요'),
  roleId: z.string().min(1, 'role 을 선택해주세요'),
});

type FormValues = z.infer<typeof formSchema>;

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

const formatNodeLabel = (node: ConceptNodeResp): string => {
  const name = node.name ?? '';
  const typeLabel = node.nodeType?.label;
  return typeLabel ? `${name} (${typeLabel})` : name;
};

const AddActionRowModal = ({ onClose, onSaved }: Props) => {
  const { invalidateConceptGraphActionEdges } = useInvalidate();

  const { data: actionEdgeTypeData } = getActionEdgeType();
  const roleOptions = useMemo(() => actionEdgeTypeData?.data ?? [], [actionEdgeTypeData]);

  const { data: nodeTypeData } = getNodeType();
  const actionNodeTypeId = useMemo(() => {
    const match = nodeTypeData?.data.find((t) => t.code === ACTION_NODE_TYPE_CODE);
    return match?.id;
  }, [nodeTypeData]);

  const putCellMutation = putSheetActionEdgeCell();

  const [actionNodeCache, setActionNodeCache] = useState<ConceptNodeResp | undefined>(undefined);
  const [selectedNodes, setSelectedNodes] = useState<ConceptNodeResp[]>([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      actionNodeId: '',
      roleId: '',
    },
  });

  const actionNodeId = watch('actionNodeId');
  const actionValueNum = actionNodeId ? Number(actionNodeId) : undefined;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 200);
    return () => clearTimeout(timer);
  }, [query]);

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

  const handleAdd = (node: ConceptNodeResp) => {
    if (node.id === undefined) return;
    if (selectedNodes.some((n) => n.id === node.id)) return;
    setSelectedNodes((prev) => [...prev, node]);
  };

  const handleRemove = (id: number | undefined) => {
    if (id === undefined) return;
    setSelectedNodes((prev) => prev.filter((n) => n.id !== id));
  };

  const onSubmit = async (values: FormValues) => {
    const actionId = Number(values.actionNodeId);
    const roleId = Number(values.roleId);
    const conceptNodeIds = selectedNodes
      .map((n) => n.id)
      .filter((id): id is number => id !== undefined);

    try {
      await putCellMutation.mutateAsync({
        params: {
          query: { actionNodeId: actionId, roleId },
        },
        body: { conceptNodeIds },
      });
      await invalidateConceptGraphActionEdges();
      toast.success('저장되었습니다');
      onSaved();
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  return (
    <div className='w-[560px] rounded-2xl bg-white p-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30'>
            <Sparkles className='h-5 w-5 text-white' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900'>액션 노드 행 추가</h2>
        </div>
        <button
          type='button'
          onClick={onClose}
          aria-label='닫기'
          className='flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'>
          <X className='h-5 w-5' />
        </button>
      </div>

      <form className='space-y-5' onSubmit={handleSubmit(onSubmit)}>
        <input type='hidden' {...register('actionNodeId')} />

        {nodeTypeData && actionNodeTypeId === undefined && (
          <div className='rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800'>
            <code className='font-mono'>{ACTION_NODE_TYPE_CODE}</code> 코드의 노드 타입이 없습니다.
            먼저 <strong>타입 관리</strong> 탭에서 액션 노드 타입을 추가해주세요.
          </div>
        )}

        <div className='space-y-2'>
          <label className='text-sm font-semibold text-gray-700'>액션 노드</label>
          <NodeSearchSelect
            value={actionValueNum}
            onChange={(id, node) => {
              setValue('actionNodeId', id !== undefined ? String(id) : '', {
                shouldValidate: true,
              });
              setActionNodeCache(node);
            }}
            initialNode={actionNodeCache}
            placeholder='액션 노드 선택'
            hasError={Boolean(errors.actionNodeId)}
            nodeTypeId={actionNodeTypeId}
            disabled={actionNodeTypeId === undefined}
          />
          {errors.actionNodeId && (
            <p className='text-xs font-medium text-red-500'>{errors.actionNodeId.message}</p>
          )}
          <p className='text-xs text-gray-500'>
            <code className='font-mono'>{ACTION_NODE_TYPE_CODE}</code> 타입의 노드만 후보로
            표시됩니다.
          </p>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-semibold text-gray-700'>Role</label>
          <select
            {...register('roleId')}
            className={`focus:border-main focus:ring-main/20 h-12 w-full rounded-xl border px-4 text-sm transition-all duration-200 focus:bg-white focus:ring-2 focus:outline-none ${
              errors.roleId ? 'border-red-300 focus:border-red-500' : 'border-gray-200'
            }`}>
            <option value=''>role 을 선택하세요</option>
            {roleOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.roleId && (
            <p className='text-xs font-medium text-red-500'>{errors.roleId.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <label className='text-sm font-semibold text-gray-700'>Concept 노드 선택</label>
            <span className='text-xs font-medium text-gray-400'>{selectedNodes.length}개</span>
          </div>

          {selectedNodes.length > 0 && (
            <div className='flex flex-wrap gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3'>
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

          <div className='relative'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='노드명 검색...'
              className='focus:border-main h-10 w-full rounded-xl border border-gray-200 bg-white pr-3 pl-9 text-sm placeholder-gray-400 focus:outline-none'
            />
          </div>

          <div className='max-h-[240px] overflow-y-auto rounded-xl border border-gray-200'>
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

          <p className='text-xs text-gray-500'>
            최소 1개 이상의 conceptNode 를 선택해야 시트에 새 행이 노출됩니다.
          </p>
        </div>

        <div className='flex justify-end gap-3 pt-2'>
          <Button type='button' variant='light' onClick={onClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button
            type='submit'
            variant='dark'
            disabled={isSubmitting || actionNodeTypeId === undefined}>
            등록하기
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddActionRowModal;
