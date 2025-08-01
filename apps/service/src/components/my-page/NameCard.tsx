'use client';

import { usePathname } from 'next/navigation';

import { getName, getGrade, getTeacherName } from '@utils';

const NameCard = () => {
  const pathname = usePathname();
  const grade = getGrade();
  const isTeacherPage = pathname.includes('/teacher');
  const name = isTeacherPage ? getTeacherName() : getName();

  return (
    <article className='center my-[2rem] flex gap-[0.8rem] rounded-[16px] bg-white p-[2rem]'>
      <p className='font-bold-18 text-black'>
        <span className='text-main mr-[0.4rem]'>{name}</span>
        <span>님</span>
      </p>
      <p className='font-medium-14 text-lightgray500 flex items-end'>
        {isTeacherPage ? '선생님' : '고등학교 ' + grade + '학년'}
      </p>
    </article>
  );
};

export default NameCard;
