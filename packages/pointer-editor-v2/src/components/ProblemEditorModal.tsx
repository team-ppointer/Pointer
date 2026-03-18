import '../index.css';
import './ProblemEditorModal.scss';
import { PointerEditor, type TiptapPayload } from '../editor';

export const ProblemEditorModal = ({
  initialJSON,
  onChange,
  onClose,
  onSave,
  isOpen,
  onAnimationEnd,
  useContainerPortal = true,
  ocrApiCall = null,
}: {
  initialJSON?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  onChange: (payload: TiptapPayload) => void;
  onClose: () => void;
  onSave: () => void;
  isOpen: boolean;
  onAnimationEnd: () => void;
  useContainerPortal?: boolean;
  ocrApiCall?: ((data: any) => Promise<any>) | null; // eslint-disable-line @typescript-eslint/no-explicit-any
}) => {
  return (
    <>
      <div
        onClick={onClose}
        onAnimationEnd={onAnimationEnd}
        className={`fixed inset-0 flex h-full w-full items-center justify-center bg-black/30 backdrop-blur-[5px] pointer-editor-root pointer-editor-modal-container ${isOpen ? 'modal-open' : 'modal-close'}`}>
        <div
          onClick={(e) => e.stopPropagation()}
          className={`max-h-[672px] flex h-full w-full max-w-[672px] flex-col rounded-[16px] bg-white shadow-2xl pointer-editor-modal-content ${isOpen ? 'modal-open' : 'modal-close'}`}>
          <div className='flex items-center justify-between p-[32px]'>
            <div className='text-[20px] font-semibold text-gray-900'>에디터</div>
            <button onClick={onClose} className='cursor-pointer rounded-full bg-white px-[8px] py-[8px] text-gray-500 transition-all! duration-200 hover:bg-gray-100'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <path d='M18 6 6 18' />
                <path d='m6 6 12 12' />
              </svg>
            </button>
          </div>
          <div className='flex-1 overflow-y-auto'>
            <PointerEditor
              initialJSON={initialJSON}
              onChange={onChange}
              useContainerPortal={useContainerPortal}
              ocrApiCall={ocrApiCall}
            />
          </div>
          <div className='flex justify-end gap-[12px] border-t border-gray-200 p-[32px]'>
            <button onClick={onClose} className='cursor-pointer rounded-full border border-gray-200 bg-white px-[16px] py-[8px] text-gray-900 transition-all! duration-200 hover:bg-gray-100'>
              취소
            </button>
            <button onClick={onSave} className='cursor-pointer rounded-full bg-blue-600 px-[16px] py-[8px] text-white transition-all! duration-200 hover:bg-blue-700'>
              저장
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
