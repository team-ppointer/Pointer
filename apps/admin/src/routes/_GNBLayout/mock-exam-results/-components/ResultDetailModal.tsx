import { Modal } from '@components';
import { ProblemViewer } from '@repo/pointer-editor-v2';
import { parseEditorContent } from '@utils';
import { ClipboardList, X } from 'lucide-react';
import { components } from '@schema';

import '@repo/pointer-editor-v2/style.css';

type MockExamResultResp = components['schemas']['MockExamResultResp'];

interface ResultDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: MockExamResultResp | null;
  displayName: string;
}

const ResultDetailModal = ({ isOpen, onClose, result, displayName }: ResultDetailModalProps) => {
  if (!result) return null;

  const code = result.type ?? '';
  const incorrects = result.incorrects ?? [];
  const question = result.question ?? null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className='w-[60rem] max-w-[90vw] rounded-2xl bg-white p-8'>
        <div className='mb-6 flex items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
              <ClipboardList className='h-5 w-5 text-white' />
            </div>
            <div>
              <h3 className='text-xl font-bold text-gray-900'>{displayName}</h3>
              <p className='text-xs text-gray-500'>{code}</p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
            <X className='h-4 w-4' />
          </button>
        </div>

        <section className='mb-6'>
          <h4 className='mb-2 text-sm font-bold text-gray-900'>오답 문항</h4>
          {incorrects.length === 0 ? (
            <p className='text-sm text-gray-400'>오답 없음</p>
          ) : (
            <p className='text-sm break-keep text-gray-700'>{incorrects.join(', ')}</p>
          )}
        </section>

        <section>
          <h4 className='mb-2 text-sm font-bold text-gray-900'>학습 고민</h4>
          {question === null ? (
            <p className='text-sm text-gray-400'>학습 고민 미제출</p>
          ) : (
            <div className='max-h-[40rem] overflow-y-auto rounded-xl border border-gray-200 bg-white p-6'>
              <ProblemViewer content={parseEditorContent(question)} padding={0} />
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
};

export default ResultDetailModal;
