import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button, FloatingButton, Header, Input, Modal, TwoButtonModalTemplate } from '@components';
import { useForm } from 'react-hook-form';
import { Divider } from '@repo/pointer-design-system/components';
import { $api, deleteTeacher, getTeacher } from '@apis';
import { useModal } from '@hooks';
import { components } from '@schema';
import { useQueryClient } from '@tanstack/react-query';

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
  const {
    isOpen: isEditTeacherModalOpen,
    openModal: openEditTeacherModal,
    closeModal: closeEditTeacherModal,
  } = useModal();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();
  const { register, handleSubmit } = useForm<{
    query: string;
  }>();

  // api
  const { data: teacherList } = getTeacher({ query: searchQuery });
  const { mutateAsync: deleteTeacherMutateAsync } = deleteTeacher();
  const queryClient = useQueryClient();

  const handleClickSearch = (data: { query: string }) => {
    setSearchQuery(data.query.trim());
  };

  const handleClickDelete = async () => {
    const idsToDelete = [...selectedTeacherId];
    if (idsToDelete.length === 0) return;

    const teacherNameById = new Map<number, string>(
      (teacherList?.data ?? []).map((teacher) => [teacher.id, teacher.name])
    );

    const teacherQueryKey = $api.queryOptions('get', '/api/admin/teacher', {
      params: {
        query: {
          query: searchQuery,
        },
      },
    }).queryKey;

    const results = await Promise.allSettled(
      idsToDelete.map((teacherId) =>
        deleteTeacherMutateAsync({
          params: {
            path: {
              teacherId,
            },
          },
        })
      )
    );

    const succeededIds: number[] = [];
    const failedMessages: string[] = [];

    results.forEach((result, index) => {
      const id = idsToDelete[index]!;
      const displayName = teacherNameById.get(id) ?? `ID ${id}`;
      if (result.status === 'fulfilled') {
        succeededIds.push(id);
      } else {
        const errorMessage = (result.reason as Error)?.message ?? '삭제 실패';
        failedMessages.push(`${displayName}: ${errorMessage}`);
      }
    });

    if (succeededIds.length > 0) {
      queryClient.setQueryData<components['schemas']['PageRespTeacherResp'] | undefined>(
        teacherQueryKey,
        (oldData) => {
          if (!oldData || !oldData.data) return oldData;
          return {
            ...oldData,
            data: oldData.data.filter((teacher) => !succeededIds.includes(teacher.id)),
          };
        }
      );
    }

    closeDeleteModal();
    setSelectedTeacherId((prev) => prev.filter((id) => !succeededIds.includes(id)));

    if (failedMessages.length > 0) {
      alert(failedMessages.join('\n'));
    }

    queryClient.invalidateQueries({ queryKey: teacherQueryKey });
  };

  const toggleTeacher = (id: number) => {
    setSelectedTeacherId((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleModifyTeacher = (teacher: components['schemas']['TeacherResp']) => {
    setEditingTeacher(teacher);
    openEditTeacherModal();
  };

  const handleCloseEditTeacherModal = () => {
    setEditingTeacher(null);
    closeEditTeacherModal();
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
          <Button sizeType='fit' variant='dark' onClick={openDeleteModal}>
            선택 정보 삭제
          </Button>
        </div>
      </div>

      <section className='mb-[8rem] flex flex-col gap-[4.8rem]'>
        <div className='grid grid-cols-3 gap-[2.4rem]'>
          {teacherList?.data?.map((teacher) => {
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
                onDelete={() => {
                  setSelectedTeacherId([teacher.id]);
                  openDeleteModal();
                }}
              />
            );
          })}
        </div>
      </section>

      <FloatingButton onClick={openEditTeacherModal}>새로운 아이디 등록하기</FloatingButton>
      <Modal isOpen={isEditTeacherModalOpen} onClose={handleCloseEditTeacherModal}>
        <EditTeacherModal teacher={editingTeacher} onClose={handleCloseEditTeacherModal} />
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text='해당 정보를 삭제할까요?'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={() => handleClickDelete()}
        />
      </Modal>
    </>
  );
}
