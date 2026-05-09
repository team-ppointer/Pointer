import { Button, Input } from '@components';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Network, X } from 'lucide-react';
import { getNodeType, postNode, putNode } from '@apis';
import { useInvalidate } from '@hooks';
import { getEmptyContentString } from '@utils';

import { EditorField } from '@/components/problem';
import type { components } from '@/types/api/schema';

type ConceptNodeResp = components['schemas']['ConceptNodeResp'];

interface Props {
  target?: ConceptNodeResp;
  onClose: () => void;
  onSaved: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(100, '100자 이하로 입력해주세요'),
  nodeTypeId: z.string().min(1, '타입을 선택해주세요'),
  description: z.string().optional(),
  payload: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (!val || val.trim().length === 0) return;
      try {
        JSON.parse(val);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'JSON 형식이 올바르지 않습니다';
        ctx.addIssue({ code: z.ZodIssueCode.custom, message });
      }
    }),
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

const EditConceptNodeModal = ({ target, onClose, onSaved }: Props) => {
  const isEditMode = Boolean(target);
  const { invalidateConceptGraphNodes } = useInvalidate();

  const { data: nodeTypeData } = getNodeType();
  const nodeTypeOptions = useMemo(() => nodeTypeData?.data ?? [], [nodeTypeData]);

  const postNodeMutation = postNode();
  const putNodeMutation = putNode();

  const defaultPayload = useMemo(() => {
    if (!target?.payload) return '';
    try {
      return JSON.stringify(target.payload, null, 2);
    } catch {
      return '';
    }
  }, [target]);

  const defaultDescription = useMemo(() => {
    return target?.description && target.description.length > 0
      ? target.description
      : getEmptyContentString();
  }, [target]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: target?.name ?? '',
      nodeTypeId: target?.nodeType?.id !== undefined ? String(target.nodeType.id) : '',
      description: defaultDescription,
      payload: defaultPayload,
    },
  });

  useEffect(() => {
    reset({
      name: target?.name ?? '',
      nodeTypeId: target?.nodeType?.id !== undefined ? String(target.nodeType.id) : '',
      description: defaultDescription,
      payload: defaultPayload,
    });
  }, [target, reset, defaultPayload, defaultDescription]);

  const onSubmit = async (values: FormValues) => {
    const trimmedName = values.name.trim();
    const rawDescription = values.description ?? '';
    const description =
      rawDescription.length > 0 && rawDescription !== getEmptyContentString()
        ? rawDescription
        : undefined;

    let payload: { [key: string]: Record<string, never> } | undefined;
    if (values.payload && values.payload.trim().length > 0) {
      try {
        payload = JSON.parse(values.payload);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '잘못된 JSON 입니다');
        return;
      }
    }

    const body = {
      name: trimmedName,
      nodeTypeId: Number(values.nodeTypeId),
      description,
      payload,
    };

    try {
      if (target?.id !== undefined) {
        await putNodeMutation.mutateAsync({
          params: { path: { id: target.id } },
          body,
        });
      } else {
        await postNodeMutation.mutateAsync({ body });
      }
      await invalidateConceptGraphNodes();
      toast.success('저장되었습니다');
      onSaved();
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const title = isEditMode ? '노드 수정' : '노드 추가';

  return (
    <div className='w-[560px] rounded-2xl bg-white p-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30'>
            <Network className='h-5 w-5 text-white' />
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
          <label className='text-sm font-semibold text-gray-700'>이름</label>
          <Input
            placeholder='노드 이름'
            autoFocus
            {...register('name')}
            className={errors.name ? 'border-red-300 focus:border-red-500' : ''}
          />
          {errors.name && <p className='text-xs font-medium text-red-500'>{errors.name.message}</p>}
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-semibold text-gray-700'>타입</label>
          <select
            {...register('nodeTypeId')}
            className={`focus:border-main focus:ring-main/20 h-12 w-full rounded-xl border px-4 text-sm transition-all duration-200 focus:bg-white focus:ring-2 focus:outline-none ${
              errors.nodeTypeId ? 'border-red-300 focus:border-red-500' : 'border-gray-200'
            }`}>
            <option value=''>타입을 선택하세요</option>
            {nodeTypeOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.nodeTypeId && (
            <p className='text-xs font-medium text-red-500'>{errors.nodeTypeId.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-semibold text-gray-700'>설명</label>
          <div className='focus-within:border-main rounded-xl border border-gray-200'>
            <EditorField control={control} name='description' />
          </div>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-semibold text-gray-700'>Payload (JSON)</label>
          <textarea
            placeholder='{"any": "json"}'
            rows={6}
            spellCheck={false}
            {...register('payload')}
            className={`focus:border-main focus:ring-main/20 w-full resize-y rounded-xl border px-4 py-3 font-mono text-xs transition-all duration-200 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:outline-none ${
              errors.payload ? 'border-red-300 focus:border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.payload && (
            <p className='text-xs font-medium text-red-500'>{errors.payload.message}</p>
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

export default EditConceptNodeModal;
