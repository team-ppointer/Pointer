import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button, FloatingButton, Header, Input } from '@components';
import { useForm } from 'react-hook-form';
import { Divider } from '@repo/pointer-design-system/components';
import { getTeacher } from '@apis';

import { TeacherCard } from '@/components/teacher';

export const Route = createFileRoute('/_GNBLayout/teacher/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedTeacherId, setSelectedTeacherId] = useState<number[]>([]);
  const { register, handleSubmit, reset } = useForm<{
    query: string;
  }>();

  // api
  const { data: teacherList } = getTeacher();

  const handleClickSearch = (data: { query: string }) => {
    // Handle search logic here
  };

  const toggleTeacher = (id: number) => {
    setSelectedTeacherId((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <>
      <Header title='과외 선생 정보' />
      <form
        className='my-[4.8rem] flex items-end justify-between gap-[3.2rem]'
        onSubmit={handleSubmit(handleClickSearch)}>
        <Input
          placeholder='선생님 이름, 아이디, 비밀번호, 담당학생 등 검색'
          {...register('query', { required: false })}
        />
        <Button variant='dark'>검색</Button>
      </form>
      <Divider />
      <div className='my-[4.8rem] flex items-center justify-between'>
        <h2 className='font-bold-32 text-black'>과외 선생 리스트</h2>
        <div className='flex gap-[1.6rem]'>
          <Button sizeType='fit' variant='light' onClick={() => setSelectedTeacherId([])}>
            전체 선택 해제
          </Button>
          <Button sizeType='fit' variant='dark'>
            선택 정보 삭제
          </Button>
        </div>
      </div>

      <section className='mb-[8rem] flex flex-col gap-[4.8rem]'>
        <div className='grid grid-cols-3 gap-[2.4rem]'>
          {teacherList?.data.map((teacher) => {
            const isChecked = selectedTeacherId.includes(teacher.id);
            return (
              <TeacherCard
                key={teacher.id}
                id={teacher.id}
                name={teacher.name}
                email={teacher.email}
                students={teacher.students.map((student) => student.name)}
                isChecked={isChecked}
                toggleTeacher={toggleTeacher}
              />
            );
          })}
        </div>
      </section>

      <FloatingButton onClick={() => {}}>새로운 개념 태그 등록하기</FloatingButton>
    </>
  );
}
