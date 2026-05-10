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

import { ACTION_NODE_TYPE_CODE } from './constants';
import { extractErrorMessage } from './utils';

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
  example: z.string().optional(),
  pointingExample: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// 레거시 plain text 를 TipTap doc JSON 문자열로 감싼다. 줄바꿈은 paragraph 단위로 보존.
const wrapPlainTextAsEditorString = (raw: string): string =>
  JSON.stringify({
    type: 'doc',
    content: raw.split('\n').map((line) => ({
      type: 'paragraph',
      ...(line.length > 0 ? { content: [{ type: 'text', text: line }] } : {}),
    })),
  });

// EditorField 는 TipTap JSON 직렬화 문자열만 정상 파싱한다. plain text 는 빈 문서로
// fallback 되어 저장 시 데이터가 유실될 수 있으므로 사전에 정규화한다.
const toEditorString = (raw?: string | null): string => {
  if (!raw || raw.length === 0) return getEmptyContentString();
  try {
    JSON.parse(raw);
    return raw;
  } catch {
    return wrapPlainTextAsEditorString(raw);
  }
};

const extractPayloadEditorString = (raw: unknown): string => {
  if (typeof raw === 'string') return toEditorString(raw);
  if (raw && typeof raw === 'object') {
    // EditorField 가 정상 파싱하려면 TipTap 의 doc 노드 모양이어야 한다.
    // 그 외 모양의 객체는 invalid 한 레거시 데이터로 보고 plain text 로 wrap.
    const obj = raw as { type?: string };
    try {
      if (obj.type === 'doc') return JSON.stringify(raw);
      return wrapPlainTextAsEditorString(JSON.stringify(raw));
    } catch {
      return getEmptyContentString();
    }
  }
  return getEmptyContentString();
};

const EditConceptNodeModal = ({ target, onClose, onSaved }: Props) => {
  const isEditMode = Boolean(target);
  const { invalidateConceptGraphNodes } = useInvalidate();

  const { data: nodeTypeData } = getNodeType();
  const nodeTypeOptions = useMemo(() => nodeTypeData?.data ?? [], [nodeTypeData]);

  const postNodeMutation = postNode();
  const putNodeMutation = putNode();

  const defaultDescription = useMemo(() => toEditorString(target?.description), [target]);

  const defaultExample = useMemo(
    () =>
      extractPayloadEditorString((target?.payload as Record<string, unknown> | undefined)?.example),
    [target]
  );
  const defaultPointingExample = useMemo(
    () =>
      extractPayloadEditorString(
        (target?.payload as Record<string, unknown> | undefined)?.pointingExample
      ),
    [target]
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: target?.name ?? '',
      nodeTypeId: target?.nodeType?.id !== undefined ? String(target.nodeType.id) : '',
      description: defaultDescription,
      example: defaultExample,
      pointingExample: defaultPointingExample,
    },
  });

  useEffect(() => {
    reset({
      name: target?.name ?? '',
      nodeTypeId: target?.nodeType?.id !== undefined ? String(target.nodeType.id) : '',
      description: defaultDescription,
      example: defaultExample,
      pointingExample: defaultPointingExample,
    });
  }, [target, reset, defaultDescription, defaultExample, defaultPointingExample]);

  const selectedNodeTypeId = watch('nodeTypeId');
  const isActionType = useMemo(() => {
    if (!selectedNodeTypeId) return false;
    const id = Number(selectedNodeTypeId);
    return nodeTypeOptions.some((t) => t.id === id && t.code === ACTION_NODE_TYPE_CODE);
  }, [selectedNodeTypeId, nodeTypeOptions]);

  const onSubmit = async (values: FormValues) => {
    const trimmedName = values.name.trim();
    const rawDescription = values.description ?? '';
    const description =
      rawDescription.length > 0 && rawDescription !== getEmptyContentString()
        ? rawDescription
        : undefined;

    let payload: { [key: string]: Record<string, never> } | undefined;
    if (isActionType) {
      const example = values.example ?? '';
      const pointingExample = values.pointingExample ?? '';
      const actionPayload: Record<string, string> = {};
      if (example.length > 0 && example !== getEmptyContentString()) {
        actionPayload.example = example;
      }
      if (pointingExample.length > 0 && pointingExample !== getEmptyContentString()) {
        actionPayload.pointingExample = pointingExample;
      }
      payload =
        Object.keys(actionPayload).length > 0
          ? (actionPayload as unknown as { [key: string]: Record<string, never> })
          : undefined;
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
    <div className='w-[860px] rounded-2xl bg-white p-8'>
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

        {isActionType && (
          <>
            <div className='space-y-2'>
              <label className='text-sm font-semibold text-gray-700'>예시</label>
              <div className='focus-within:border-main rounded-xl border border-gray-200'>
                <EditorField control={control} name='example' />
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-semibold text-gray-700'>포인팅 예시</label>
              <div className='focus-within:border-main rounded-xl border border-gray-200'>
                <EditorField control={control} name='pointingExample' />
              </div>
            </div>
          </>
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

export default EditConceptNodeModal;
