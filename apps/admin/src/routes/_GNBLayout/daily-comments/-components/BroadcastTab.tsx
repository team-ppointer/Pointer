import { useCallback, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { Calendar as CalendarIcon, Plus, Send, Users } from 'lucide-react';
import { ProblemEditor, type TiptapPayload } from '@repo/pointer-editor-v2';
import { upsertDailyComment } from '@apis';
import { Modal, StudentSearchModal, Tag, TwoButtonModalTemplate } from '@components';
import { useInvalidate, useModal } from '@hooks';
import { components } from '@schema';
import { getEmptyContentString, parseEditorContent, serializeEditorPayload } from '@utils';
import { toast } from 'react-toastify';

import { extractErrorMessage } from '@/components/conceptGraph/utils';

type StudentResp = components['schemas']['StudentResp'];

const todayString = () => dayjs().format('YYYY-MM-DD');

const hasEditorContent = (serialized: string): boolean => {
  const parsed = parseEditorContent(serialized);
  return (
    parsed?.content?.length > 0 &&
    parsed.content.some(
      (node: { content?: { text?: string }[] }) =>
        node.content && node.content.some((c) => c.text && c.text.trim())
    )
  );
};

const BroadcastTab = () => {
  const [selectedStudents, setSelectedStudents] = useState<StudentResp[]>([]);
  const [commentDate, setCommentDate] = useState(() => todayString());
  const [editorContent, setEditorContent] = useState<string>(() => getEmptyContentString());
  const editorKeyRef = useRef(0);

  const { invalidateDailyComment } = useInvalidate();
  const upsertMutation = upsertDailyComment();

  const {
    isOpen: isStudentModalOpen,
    openModal: openStudentModal,
    closeModal: closeStudentModal,
  } = useModal();
  const {
    isOpen: isConfirmModalOpen,
    openModal: openConfirmModal,
    closeModal: closeConfirmModal,
  } = useModal();

  const handleEditorChange = useCallback((payload: TiptapPayload) => {
    setEditorContent(serializeEditorPayload(payload));
  }, []);

  const handleRemoveStudent = (studentId: number) => {
    setSelectedStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  const isBodyValid = hasEditorContent(editorContent);
  const canSend =
    selectedStudents.length > 0 && isBodyValid && !!commentDate && !upsertMutation.isPending;

  const handleSend = async () => {
    if (!canSend) return;

    try {
      await upsertMutation.mutateAsync({
        body: {
          studentIds: selectedStudents.map((s) => s.id),
          commentDate,
          contentJson: editorContent,
        },
      });
      await invalidateDailyComment();
      const sentCount = selectedStudents.length;
      const sentDate = commentDate;
      setSelectedStudents([]);
      setEditorContent(getEmptyContentString());
      editorKeyRef.current += 1;
      closeConfirmModal();
      toast.success(`${sentCount}명에게 발송되었습니다 · ${sentDate}`);
    } catch (error) {
      closeConfirmModal();
      toast.error(extractErrorMessage(error));
    }
  };

  return (
    <div className='space-y-6'>
      {/* Top control row */}
      <div className='rounded-2xl border border-gray-200 bg-white p-6'>
        <div className='flex items-center gap-3'>
          <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
            <Users className='h-5 w-5 text-white' />
          </div>
          <div className='flex-1'>
            <p className='text-xs font-medium text-gray-500'>대상 학생</p>
            <p className='text-base font-bold text-gray-900'>
              {selectedStudents.length === 0
                ? '학생을 선택해주세요'
                : `${selectedStudents.length}명 선택됨`}
            </p>
          </div>
          <button
            type='button'
            onClick={openStudentModal}
            disabled={upsertMutation.isPending}
            className='flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60'>
            <Plus className='h-4 w-4' />
            학생 선택
          </button>
        </div>

        {selectedStudents.length > 0 && (
          <div className='mt-4 flex flex-wrap gap-2'>
            {selectedStudents.map((student) => (
              <Tag
                key={student.id}
                label={student.name}
                color='dark'
                removable
                onClick={() => handleRemoveStudent(student.id)}
              />
            ))}
          </div>
        )}

        <div className='mt-6'>
          <label className='mb-2 block text-xs font-semibold text-gray-700'>
            <div className='flex items-center gap-2'>
              <CalendarIcon className='h-3.5 w-3.5 text-gray-500' />
              일자
            </div>
          </label>
          <input
            type='date'
            value={commentDate}
            onChange={(e) => setCommentDate(e.target.value)}
            disabled={upsertMutation.isPending}
            className='focus:border-main focus:ring-main/20 rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-all duration-200 hover:border-gray-300 focus:bg-white focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60'
          />
        </div>
      </div>

      {/* Editor */}
      <div className='rounded-2xl border border-gray-200 bg-white p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-bold text-gray-900'>코멘트 본문</h3>
          <button
            type='button'
            onClick={openConfirmModal}
            disabled={!canSend}
            className='hover:bg-main/90 bg-main flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60'>
            <Send className='h-4 w-4' />
            발송
          </button>
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

      {/* Student search modal */}
      <Modal isOpen={isStudentModalOpen} onClose={closeStudentModal}>
        <StudentSearchModal
          selectedStudents={selectedStudents}
          setSelectedStudents={setSelectedStudents}
          onApply={closeStudentModal}
        />
      </Modal>

      {/* Confirm modal */}
      <Modal isOpen={isConfirmModalOpen} onClose={closeConfirmModal}>
        <div className='w-[28rem] p-2'>
          <TwoButtonModalTemplate
            text={`선택한 ${selectedStudents.length}명에게 ${commentDate} 코멘트를 발송합니다. 기존 코멘트가 있다면 덮어씁니다.`}
            leftButtonText='취소'
            rightButtonText='발송'
            handleClickLeftButton={closeConfirmModal}
            handleClickRightButton={handleSend}
          />
        </div>
      </Modal>
    </div>
  );
};

export default BroadcastTab;
