import { Button } from '@components';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { GitBranch, X } from 'lucide-react';
import { getEdgeType, postEdge, putEdge } from '@apis';
import { useInvalidate } from '@hooks';

import NodeSearchSelect from './NodeSearchSelect';
import { extractErrorMessage } from './utils';

import type { components } from '@/types/api/schema';

type ConceptEdgeResp = components['schemas']['ConceptEdgeResp'];
type ConceptNodeResp = components['schemas']['ConceptNodeResp'];

interface Props {
  target?: ConceptEdgeResp;
  onClose: () => void;
  onSaved: () => void;
}

const formSchema = z
  .object({
    fromNodeId: z.string().min(1, 'From 노드를 선택해주세요'),
    edgeTypeId: z.string().min(1, '관계를 선택해주세요'),
    toNodeId: z.string().min(1, 'To 노드를 선택해주세요'),
  })
  .refine((data) => data.fromNodeId !== data.toNodeId, {
    message: 'From 노드와 To 노드는 달라야 합니다.',
    path: ['toNodeId'],
  });

type FormValues = z.infer<typeof formSchema>;

const EditConceptEdgeModal = ({ target, onClose, onSaved }: Props) => {
  const isEditMode = Boolean(target);
  const { invalidateConceptGraphEdges } = useInvalidate();

  const { data: edgeTypeData } = getEdgeType();
  const edgeTypeOptions = useMemo(() => edgeTypeData?.data ?? [], [edgeTypeData]);

  const postEdgeMutation = postEdge();
  const putEdgeMutation = putEdge();

  const [fromNodeCache, setFromNodeCache] = useState<ConceptNodeResp | undefined>(target?.fromNode);
  const [toNodeCache, setToNodeCache] = useState<ConceptNodeResp | undefined>(target?.toNode);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromNodeId: target?.fromNode?.id !== undefined ? String(target.fromNode.id) : '',
      edgeTypeId: target?.edgeType?.id !== undefined ? String(target.edgeType.id) : '',
      toNodeId: target?.toNode?.id !== undefined ? String(target.toNode.id) : '',
    },
  });

  useEffect(() => {
    reset({
      fromNodeId: target?.fromNode?.id !== undefined ? String(target.fromNode.id) : '',
      edgeTypeId: target?.edgeType?.id !== undefined ? String(target.edgeType.id) : '',
      toNodeId: target?.toNode?.id !== undefined ? String(target.toNode.id) : '',
    });
    setFromNodeCache(target?.fromNode);
    setToNodeCache(target?.toNode);
  }, [target, reset]);

  const fromNodeId = watch('fromNodeId');
  const toNodeId = watch('toNodeId');

  const fromValueNum = fromNodeId ? Number(fromNodeId) : undefined;
  const toValueNum = toNodeId ? Number(toNodeId) : undefined;

  const onSubmit = async (values: FormValues) => {
    const body = {
      fromNodeId: Number(values.fromNodeId),
      edgeTypeId: Number(values.edgeTypeId),
      toNodeId: Number(values.toNodeId),
    };

    try {
      if (target?.id !== undefined) {
        await putEdgeMutation.mutateAsync({
          params: { path: { id: target.id } },
          body,
        });
      } else {
        await postEdgeMutation.mutateAsync({ body });
      }
      await invalidateConceptGraphEdges();
      toast.success('저장되었습니다');
      onSaved();
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const title = isEditMode ? '엣지 수정' : '엣지 추가';

  return (
    <div className='w-[560px] rounded-2xl bg-white p-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30'>
            <GitBranch className='h-5 w-5 text-white' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900'>{title}</h2>
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
        <input type='hidden' {...register('fromNodeId')} />
        <input type='hidden' {...register('toNodeId')} />

        <div className='space-y-2'>
          <label className='text-sm font-semibold text-gray-700'>From 노드</label>
          <NodeSearchSelect
            value={fromValueNum}
            onChange={(id, node) => {
              setValue('fromNodeId', id !== undefined ? String(id) : '', { shouldValidate: true });
              setFromNodeCache(node);
            }}
            initialNode={fromNodeCache}
            placeholder='From 노드 선택'
            excludeIds={toValueNum !== undefined ? [toValueNum] : undefined}
            hasError={Boolean(errors.fromNodeId)}
          />
          {errors.fromNodeId && (
            <p className='text-xs font-medium text-red-500'>{errors.fromNodeId.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-semibold text-gray-700'>관계</label>
          <select
            {...register('edgeTypeId')}
            className={`focus:border-main focus:ring-main/20 h-12 w-full rounded-xl border px-4 text-sm transition-all duration-200 focus:bg-white focus:ring-2 focus:outline-none ${
              errors.edgeTypeId ? 'border-red-300 focus:border-red-500' : 'border-gray-200'
            }`}>
            <option value=''>관계를 선택하세요</option>
            {edgeTypeOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.edgeTypeId && (
            <p className='text-xs font-medium text-red-500'>{errors.edgeTypeId.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-semibold text-gray-700'>To 노드</label>
          <NodeSearchSelect
            value={toValueNum}
            onChange={(id, node) => {
              setValue('toNodeId', id !== undefined ? String(id) : '', { shouldValidate: true });
              setToNodeCache(node);
            }}
            initialNode={toNodeCache}
            placeholder='To 노드 선택'
            excludeIds={fromValueNum !== undefined ? [fromValueNum] : undefined}
            hasError={Boolean(errors.toNodeId)}
          />
          {errors.toNodeId && (
            <p className='text-xs font-medium text-red-500'>{errors.toNodeId.message}</p>
          )}
        </div>

        <div className='flex justify-end gap-3 pt-2'>
          <Button type='button' variant='light' onClick={onClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button type='submit' variant='dark' disabled={isSubmitting}>
            {isEditMode ? '수정 완료' : '등록하기'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditConceptEdgeModal;
