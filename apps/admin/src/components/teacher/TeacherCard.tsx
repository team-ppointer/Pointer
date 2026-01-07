import { Mail, Users, Pencil, Trash2, Check } from 'lucide-react';

interface Props {
  name: string;
  id: number;
  email: string;
  students: string[];
  isChecked: boolean;
  toggleTeacher: (id: number) => void;
  onModify?: () => void;
  onDelete?: () => void;
}

const TeacherCard = ({
  name,
  id,
  email,
  students,
  isChecked,
  toggleTeacher,
  onModify,
  onDelete,
}: Props) => {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-white transition-all duration-200 ${
        isChecked ? 'border-main bg-main/5' : 'border-gray-200 hover:border-gray-300'
      }`}>
      <div className='p-5'>
        {/* Header with checkbox and name */}
        <label className='flex cursor-pointer items-center gap-3'>
          <input
            type='checkbox'
            checked={isChecked}
            onChange={() => toggleTeacher(id)}
            className='peer hidden'
          />
          <div
            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border transition-all duration-200 ${
              isChecked
                ? 'border-main bg-main'
                : 'border-gray-300 bg-white group-hover:border-gray-400'
            }`}>
            <Check
              className={`h-3.5 w-3.5 text-white transition-all duration-200 ${
                isChecked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
            />
          </div>
          <div className='flex min-w-0 flex-1 items-center gap-2'>
            <span
              className={`truncate text-base font-semibold transition-colors duration-200 ${
                isChecked ? 'text-main' : 'text-gray-900'
              }`}>
              {name}
            </span>
          </div>
        </label>

        {/* Details */}
        <div className='mt-4 space-y-3'>
          <div className='flex items-start gap-3'>
            <Mail className='mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400' />
            <div className='min-w-0 flex-1'>
              <p className='text-xs font-medium text-gray-500'>이메일</p>
              <p className='truncate text-sm text-gray-900'>{email}</p>
            </div>
          </div>

          <div className='flex items-start gap-3'>
            <Users className='mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400' />
            <div className='min-w-0 flex-1'>
              <p className='text-xs font-medium text-gray-500'>담당 학생</p>
              <p className='line-clamp-2 text-sm text-gray-900'>
                {students.length > 0 ? students.join(', ') : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='absolute top-4 right-4 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
        <button
          type='button'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onModify?.();
          }}
          className='flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'>
          <Pencil className='h-3.5 w-3.5' />
        </button>
        <button
          type='button'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete?.();
          }}
          className='flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-50'>
          <Trash2 className='h-3.5 w-3.5' />
        </button>
      </div>
    </div>
  );
};

export default TeacherCard;
