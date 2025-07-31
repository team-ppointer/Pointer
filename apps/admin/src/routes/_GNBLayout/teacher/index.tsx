import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button, FloatingButton, Header, Input, Modal } from '@components';
import { useForm } from 'react-hook-form';
import { Divider } from '@repo/pointer-design-system/components';
import { getTeacher } from '@apis';
import { useModal } from '@hooks';
import { components } from '@schema';

import { TeacherCard } from '@/components/teacher';
import EditTeacherModal from '@/components/common/Modals/EditTeacherModal';

export const Route = createFileRoute('/_GNBLayout/teacher/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedTeacherId, setSelectedTeacherId] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingTeacher, setEditingTeacher] = useState<components['schemas']['TeacherResp'] | null>(
    null
  );
  const { isOpen, openModal, closeModal } = useModal();
  const { register, handleSubmit } = useForm<{
    query: string;
  }>();

  // api
  const { data: teacherList } = getTeacher();

  const handleClickSearch = (data: { query: string }) => {
    setSearchQuery(data.query.trim());
  };

  const filteredTeacherList = teacherList?.data.filter((teacher) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const matchesName = teacher.name.toLowerCase().includes(query);
    const matchesEmail = teacher.email.toLowerCase().includes(query);
    const matchesStudents = teacher.students.some((student) =>
      student.name.toLowerCase().includes(query)
    );

    return matchesName || matchesEmail || matchesStudents;
  });

  const toggleTeacher = (id: number) => {
    setSelectedTeacherId((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleModifyTeacher = (teacher: components['schemas']['TeacherResp']) => {
    setEditingTeacher(teacher);
    openModal();
  };

  const handleCloseModal = () => {
    setEditingTeacher(null);
    closeModal();
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
          {filteredTeacherList?.map((teacher) => {
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
                onModify={() => handleModifyTeacher(teacher)}
              />
            );
          })}
        </div>
      </section>

      <FloatingButton onClick={openModal}>새로운 아이디 등록하기</FloatingButton>
      <Modal isOpen={isOpen} onClose={handleCloseModal}>
        <EditTeacherModal teacher={editingTeacher} onClose={handleCloseModal} />
      </Modal>
    </>
  );
}
