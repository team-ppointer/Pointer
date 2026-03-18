import { ProblemViewer } from '@repo/pointer-editor-v2';

interface ProblemPreviewProps {
  title: string;
  memo: string;
  problemContent: string;
}

const ProblemPreview = ({ title, memo, problemContent }: ProblemPreviewProps) => {
  return (
    <div className='group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-sm'>
      {/* Image Section */}

      {/* Content Section */}
      <div className='flex flex-1 flex-col justify-center gap-0.5 border-b border-gray-200 p-4'>
        <p className='line-clamp-2 text-sm font-semibold text-gray-900'>{title || '제목 없음'}</p>
        <p className='line-clamp-2 text-xs text-gray-600'>{memo}</p>
      </div>
      <div className='relative h-60 overflow-hidden bg-gray-50'>
        <ProblemViewer content={JSON.parse(problemContent)} padding={22} />
      </div>
    </div>
  );
};

export default ProblemPreview;
