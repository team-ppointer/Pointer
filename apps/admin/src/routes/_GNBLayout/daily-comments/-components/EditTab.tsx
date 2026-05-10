import { useCallback, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import {
  AlertCircle,
  Calendar as CalendarIcon,
  NotebookPen,
  Pencil,
  Plus,
  Save,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { ProblemEditor, ProblemViewer, type TiptapPayload } from '@repo/pointer-editor-v2';
import { deleteDailyComment, getDailyComment, putDailyComment, upsertDailyComment } from '@apis';
import { Modal, TwoButtonModalTemplate } from '@components';
import { useInvalidate, useModal, useSelectedStudent } from '@hooks';
import { components } from '@schema';
import {
  extractErrorMessage,
  getEmptyContentString,
  hasEditorContent,
  parseEditorContent,
  serializeEditorPayload,
} from '@utils';
import { toast } from 'react-toastify';

import ExpiryBadge from './ExpiryBadge';

type DailyCommentResp = components['schemas']['DailyCommentResp'];

const todayString = () => dayjs().format('YYYY-MM-DD');

const EditTab = () => {
  const { selectedStudent } = useSelectedStudent();
  const [commentDate, setCommentDate] = useState(() => todayString());
  const [isComposing, setIsComposing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState<string>(() => getEmptyContentString());
  const editorKeyRef = useRef(0);

  const { invalidateDailyComment } = useInvalidate();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const queryEnabled = !!selectedStudent && !!commentDate;
  const { data, isLoading } = getDailyComment(
    {
      studentId: selectedStudent?.id ?? 0,
      commentDate,
    },
    queryEnabled
  );

  const upsertMutation = upsertDailyComment();
  const updateMutation = putDailyComment();
  const deleteMutation = deleteDailyComment();

  const record: DailyCommentResp | null = useMemo(() => {
    const list = data?.data ?? [];
    if (list.length >= 2) {
      console.warn(
        '[daily-comments] Unexpected: GET returned multiple records for (studentId, commentDate). Using first record.',
        { studentId: selectedStudent?.id, commentDate, count: list.length }
      );
    }
    return list[0] ?? null;
  }, [data, selectedStudent?.id, commentDate]);

  const resetComposer = useCallback(() => {
    setEditorContent(getEmptyContentString());
    editorKeyRef.current += 1;
    setIsComposing(false);
    setIsEditing(false);
  }, []);

  const handleEditorChange = useCallback((payload: TiptapPayload) => {
    setEditorContent(serializeEditorPayload(payload));
  }, []);

  const handleStartCompose = () => {
    setEditorContent(getEmptyContentString());
    editorKeyRef.current += 1;
    setIsComposing(true);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    if (!record) return;
    setEditorContent(record.contentJson || getEmptyContentString());
    editorKeyRef.current += 1;
    setIsEditing(true);
    setIsComposing(false);
  };

  const handleCancel = () => {
    resetComposer();
  };

  const handleCreate = async () => {
    if (!selectedStudent || !commentDate) return;
    if (!hasEditorContent(editorContent)) {
      toast.error('본문을 입력해주세요.');
      return;
    }

    try {
      await upsertMutation.mutateAsync({
        body: {
          studentIds: [selectedStudent.id],
          commentDate,
          contentJson: editorContent,
        },
      });
      await invalidateDailyComment();
      resetComposer();
      toast.success('코멘트가 작성되었습니다.');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const handleUpdate = async () => {
    if (!record?.id) return;
    if (!hasEditorContent(editorContent)) {
      toast.error('본문을 입력해주세요.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        params: { path: { id: record.id } },
        body: { contentJson: editorContent },
      });
      await invalidateDailyComment();
      resetComposer();
      toast.success('코멘트가 수정되었습니다.');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!record?.id) return;

    try {
      await deleteMutation.mutateAsync({
        params: { path: { id: record.id } },
      });
      await invalidateDailyComment();
      closeDeleteModal();
      resetComposer();
      toast.success('코멘트가 삭제되었습니다.');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  if (!selectedStudent) {
    return (
      <div className='mb-6 flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-6'>
        <AlertCircle className='mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600' />
        <div>
          <h3 className='mb-1 text-lg font-bold text-amber-900'>학생을 선택해주세요</h3>
          <p className='text-sm text-amber-700'>
            사이드바에서 학생을 선택하시면 해당 학생의 코멘트를 관리할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  const isMutationPending =
    upsertMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className='space-y-6'>
      {/* Top control row */}
      <div className='flex flex-wrap items-end gap-4 rounded-2xl border border-gray-200 bg-white p-6'>
        <div className='flex items-center gap-3'>
          <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
            <User className='h-5 w-5 text-white' />
          </div>
          <div>
            <p className='text-xs font-medium text-gray-500'>대상 학생</p>
            <p className='text-base font-bold text-gray-900'>{selectedStudent.name}</p>
          </div>
        </div>

        <div>
          <label className='mb-2 block text-xs font-semibold text-gray-700'>
            <div className='flex items-center gap-2'>
              <CalendarIcon className='h-3.5 w-3.5 text-gray-500' />
              일자
            </div>
          </label>
          <input
            type='date'
            value={commentDate}
            onChange={(e) => {
              setCommentDate(e.target.value);
              resetComposer();
            }}
            className='focus:border-main focus:ring-main/20 rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-all duration-200 hover:border-gray-300 focus:bg-white focus:ring-2 focus:outline-none'
          />
        </div>
      </div>

      {/* Body */}
      <div className='rounded-2xl border border-gray-200 bg-white p-6'>
        {isLoading ? (
          <div className='flex min-h-[300px] items-center justify-center'>
            <div className='text-sm text-gray-400'>불러오는 중...</div>
          </div>
        ) : isComposing ? (
          /* Compose new */
          <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-bold text-gray-900'>코멘트 작성</h3>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={handleCancel}
                  disabled={isMutationPending}
                  className='flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60'>
                  <X className='h-4 w-4' />
                  취소
                </button>
                <button
                  type='button'
                  onClick={handleCreate}
                  disabled={isMutationPending}
                  className='hover:bg-main/90 bg-main flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60'>
                  <Save className='h-4 w-4' />
                  저장
                </button>
              </div>
            </div>
            <div className='h-[30rem] overflow-y-auto rounded-xl border border-gray-200 bg-white'>
              <ProblemEditor
                key={editorKeyRef.current}
                initialJSON={parseEditorContent(editorContent)}
                onChange={handleEditorChange}
                ocrApiCall={null}
              />
            </div>
          </div>
        ) : isEditing && record ? (
          /* Edit existing */
          <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-bold text-gray-900'>코멘트 수정</h3>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={handleCancel}
                  disabled={isMutationPending}
                  className='flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60'>
                  <X className='h-4 w-4' />
                  취소
                </button>
                <button
                  type='button'
                  onClick={handleUpdate}
                  disabled={isMutationPending}
                  className='hover:bg-main/90 bg-main flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60'>
                  <Save className='h-4 w-4' />
                  저장
                </button>
              </div>
            </div>
            <div className='h-[30rem] overflow-y-auto rounded-xl border border-gray-200 bg-white'>
              <ProblemEditor
                key={editorKeyRef.current}
                initialJSON={parseEditorContent(editorContent)}
                onChange={handleEditorChange}
                ocrApiCall={null}
              />
            </div>
          </div>
        ) : record ? (
          /* Viewer */
          <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex flex-wrap items-center gap-3'>
                <ExpiryBadge expiryAt={record.expiryAt} />
                <div className='text-sm text-gray-500'>
                  마지막 수정자:{' '}
                  <span className='font-semibold text-gray-700'>{record.author?.name ?? '-'}</span>
                </div>
              </div>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={handleStartEdit}
                  disabled={isMutationPending}
                  className='flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition-all duration-200 hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60'>
                  <Pencil className='h-4 w-4' />
                  수정
                </button>
                <button
                  type='button'
                  onClick={openDeleteModal}
                  disabled={isMutationPending}
                  className='flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60'>
                  <Trash2 className='h-4 w-4' />
                  삭제
                </button>
              </div>
            </div>
            <div className='min-h-[20rem] overflow-y-auto rounded-xl border border-gray-200 bg-white p-6'>
              <ProblemViewer content={parseEditorContent(record.contentJson)} padding={0} />
            </div>
          </div>
        ) : (
          /* Empty */
          <div className='flex min-h-[300px] flex-col items-center justify-center gap-4'>
            <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100'>
              <NotebookPen className='h-7 w-7 text-gray-400' />
            </div>
            <div className='text-center'>
              <p className='text-base font-semibold text-gray-700'>
                해당 일자에 작성된 코멘트가 없습니다
              </p>
              <p className='mt-1 text-sm text-gray-500'>
                {dayjs(commentDate).format('YYYY년 M월 D일')} 코멘트를 작성해보세요.
              </p>
            </div>
            <button
              type='button'
              onClick={handleStartCompose}
              disabled={isMutationPending}
              className='hover:bg-main/90 bg-main flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60'>
              <Plus className='h-4 w-4' />
              코멘트 작성
            </button>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text={`${record?.author?.name ?? '-'}님이 작성한 코멘트입니다. 삭제하시겠습니까?`}
          leftButtonText='아니오'
          rightButtonText={deleteMutation.isPending ? '삭제 중...' : '예'}
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={deleteMutation.isPending ? () => undefined : handleDelete}
          variant='danger'
        />
      </Modal>
    </div>
  );
};

export default EditTab;
