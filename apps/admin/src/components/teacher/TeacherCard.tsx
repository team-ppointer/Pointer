import { IconButton } from '@components';
import { IcTagCheck16 } from '@svg';

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
    <section className='flex flex-col gap-[0.8rem] rounded-[1.6rem] bg-white px-[2.4rem] py-[1.6rem]'>
      <div className='flex w-full justify-between'>
        <label className='flex cursor-pointer items-center gap-[1.6rem]'>
          <input
            type='checkbox'
            checked={isChecked}
            onChange={() => toggleTeacher(id)}
            className='peer hidden'
          />
          <div className='bg-lightgray300 flex h-[3.6rem] w-[3.6rem] items-center justify-center rounded-[0.4rem]'>
            <IcTagCheck16 width={17} height={12} className={isChecked ? 'visible' : 'invisible'} />
          </div>
          <span className='font-medium-18 text-black'>{name}</span>
        </label>
        <div className='flex items-center gap-[0.8rem]'>
          <IconButton variant='delete' onClick={onDelete} />
          <IconButton variant='modify' onClick={onModify} />
        </div>
      </div>
      <div className='flex w-full'>
        <div className='font-medium-16 text-lightgray500 mr-[0.8rem] w-[5.6rem]'>아이디</div>
        <div className='font-medium-16 text-black'>{email}</div>
      </div>
      {/* <div className='flex w-full'>
        <div className='font-medium-16 text-lightgray500 mr-[0.8rem] w-[5.6rem]'>비밀번호</div>
        <div className='font-medium-16 text-black'>{password}</div>
      </div> */}
      <div className='flex w-full'>
        <div className='font-medium-16 text-lightgray500 mr-[0.8rem] w-[5.6rem]'>담당학생</div>
        <div className='font-medium-16 text-black'>{students.join(', ')}</div>
      </div>
    </section>
  );
};

export default TeacherCard;
