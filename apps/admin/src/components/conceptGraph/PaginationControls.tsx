import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  page: number;
  lastPage: number;
  size: number;
  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
  pageSizes?: number[];
}

const DEFAULT_PAGE_SIZES = [50, 100, 500, 1000];

const PaginationControls = ({
  page,
  lastPage,
  size,
  onPageChange,
  onSizeChange,
  pageSizes = DEFAULT_PAGE_SIZES,
}: PaginationControlsProps) => {
  const isFirst = page <= 0;
  const isLast = page >= lastPage;

  return (
    <div className='flex flex-wrap items-center justify-between gap-4 px-2 py-3 text-sm'>
      <div className='flex items-center gap-2 text-gray-500'>
        <span>페이지</span>
        <span className='font-semibold text-gray-800'>{page + 1}</span>
        <span>/ {lastPage + 1}</span>
      </div>
      <div className='flex items-center gap-3'>
        {onSizeChange && (
          <label className='flex items-center gap-2 text-gray-500'>
            <span>페이지당</span>
            <select
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className='focus:border-main rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 focus:outline-none'>
              {pageSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className='flex items-center gap-1'>
          <button
            type='button'
            disabled={isFirst}
            onClick={() => onPageChange(Math.max(0, page - 1))}
            className='flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'>
            <ChevronLeft className='h-4 w-4' />
          </button>
          <button
            type='button'
            disabled={isLast}
            onClick={() => onPageChange(Math.min(lastPage, page + 1))}
            className='flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'>
            <ChevronRight className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaginationControls;
