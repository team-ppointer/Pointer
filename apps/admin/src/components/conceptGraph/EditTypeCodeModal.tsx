import { Button, Input } from '@components';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Tag as TagIcon, X } from 'lucide-react';
import {
  postNodeType,
  putNodeType,
  postEdgeType,
  putEdgeType,
  postActionEdgeType,
  putActionEdgeType,
} from '@apis';
import { useInvalidate } from '@hooks';

import type { components } from '@/types/api/schema';

type NodeTypeCodeResp = components['schemas']['NodeTypeCodeResp'];
type EdgeTypeCodeResp = components['schemas']['EdgeTypeCodeResp'];
type ActionEdgeTypeCodeResp = components['schemas']['ActionEdgeTypeCodeResp'];

export type TypeCodeKind = 'node' | 'edge' | 'actionEdge';
export type TypeCodeTarget = NodeTypeCodeResp | EdgeTypeCodeResp | ActionEdgeTypeCodeResp;

interface Props {
  kind: TypeCodeKind;
  target?: TypeCodeTarget;
  onClose: () => void;
  onSaved: () => void;
}

const KIND_LABEL: Record<TypeCodeKind, string> = {
  node: '노드 타입',
  edge: '엣지 타입',
  actionEdge: '액션 엣지 타입',
};

const formSchema = z.object({
  code: z.string().min(1, '코드를 입력해주세요'),
  label: z.string().min(1, '라벨을 입력해주세요'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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

const EditTypeCodeModal = ({ kind, target, onClose, onSaved }: Props) => {
  const isEditMode = Boolean(target);
  const { invalidateConceptGraphTypes } = useInvalidate();

  const postNodeTypeMutation = postNodeType();
  const putNodeTypeMutation = putNodeType();
  const postEdgeTypeMutation = postEdgeType();
  const putEdgeTypeMutation = putEdgeType();
  const postActionEdgeTypeMutation = postActionEdgeType();
  const putActionEdgeTypeMutation = putActionEdgeType();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: target?.code ?? '',
      label: target?.label ?? '',
      description: target?.description ?? '',
    },
  });

  useEffect(() => {
    reset({
      code: target?.code ?? '',
      label: target?.label ?? '',
      description: target?.description ?? '',
    });
  }, [target, reset]);

  const handleSuccess = async () => {
    await invalidateConceptGraphTypes();
    toast.success('저장되었습니다');
    onSaved();
    onClose();
  };

  const handleError = (error: unknown) => {
    toast.error(extractErrorMessage(error));
  };

  const onSubmit = async (values: FormValues) => {
    const body = {
      code: values.code.trim(),
      label: values.label.trim(),
      description: values.description?.trim() ? values.description.trim() : undefined,
    };

    try {
      if (kind === 'node') {
        if (target?.id !== undefined) {
          await putNodeTypeMutation.mutateAsync({
            params: { path: { id: target.id } },
            body,
          });
        } else {
          await postNodeTypeMutation.mutateAsync({ body });
        }
      } else if (kind === 'edge') {
        if (target?.id !== undefined) {
          await putEdgeTypeMutation.mutateAsync({
            params: { path: { id: target.id } },
            body,
          });
        } else {
          await postEdgeTypeMutation.mutateAsync({ body });
        }
      } else {
        if (target?.id !== undefined) {
          await putActionEdgeTypeMutation.mutateAsync({
            params: { path: { id: target.id } },
            body,
          });
        } else {
          await postActionEdgeTypeMutation.mutateAsync({ body });
        }
      }
      await handleSuccess();
    } catch (error) {
      handleError(error);
    }
  };

  const title = `${KIND_LABEL[kind]} ${isEditMode ? '수정' : '새로 만들기'}`;

  return (
    <div className='w-[520px] rounded-2xl bg-white p-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30'>
            <TagIcon className='h-5 w-5 text-white' />
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
        <div className='space-y-2'>
          <label className='text-sm font-semibold text-gray-700'>코드</label>
          <Input
            placeholder='예: ACTION'
            autoFocus
            {...register('code')}
            className={errors.code ? 'border-red-300 focus:border-red-500' : ''}
          />
          {errors.code && <p className='text-xs font-medium text-red-500'>{errors.code.message}</p>}
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-semibold text-gray-700'>라벨</label>
          <Input
            placeholder='사용자에게 노출될 이름'
            {...register('label')}
            className={errors.label ? 'border-red-300 focus:border-red-500' : ''}
          />
          {errors.label && (
            <p className='text-xs font-medium text-red-500'>{errors.label.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-semibold text-gray-700'>설명</label>
          <textarea
            placeholder='타입 설명 (선택)'
            rows={3}
            {...register('description')}
            className='focus:border-main focus:ring-main/20 w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all duration-200 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:outline-none'
          />
        </div>

        {kind === 'actionEdge' && (
          <p className='text-xs text-gray-500'>
            code 가 액션 그래프 시트의 컬럼 정렬 키로 사용됩니다 (오름차순).
          </p>
        )}

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

export default EditTypeCodeModal;
