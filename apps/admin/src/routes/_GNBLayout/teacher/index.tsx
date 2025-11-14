import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Header, Input, Modal, TwoButtonModalTemplate, SegmentedControl } from '@components';
import { useForm } from 'react-hook-form';
import { $api, deleteTeacher, getTeacher } from '@apis';
import { useModal } from '@hooks';
import { components } from '@schema';
import { useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  UserCircle,
  Mail,
  Users,
  Trash2,
  X,
  CheckCircle2,
  Pencil,
  List,
  Grid,
  RotateCcw,
} from 'lucide-react';

import { TeacherCard } from '@/components/teacher';
import EditTeacherModal from '@/components/common/Modals/EditTeacherModal';

export const Route = createFileRoute('/_GNBLayout/teacher/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedTeacherId, setSelectedTeacherId] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
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
  const { register, handleSubmit, watch, reset } = useForm<{
    query: string;
  }>();

  // api
  const { data: teacherList } = getTeacher({ query: searchQuery });
  const { mutateAsync: deleteTeacherMutateAsync } = deleteTeacher();
  const queryClient = useQueryClient();

  const watchedQuery = watch('query');
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearchQuery((watchedQuery ?? '').trim());
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [watchedQuery]);

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

  const handleResetSearch = () => {
    reset();
    setSearchQuery('');
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <Header title='과외 선생 정보'>
        <Header.Button Icon={Plus} color='main' onClick={openEditTeacherModal}>
          선생 등록
        </Header.Button>
      </Header>

      <div className='mx-auto max-w-7xl px-8 py-8'>
        {/* Search Card */}
        <div className='mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white'>
          <div className='px-6 pt-6'>
            <h2 className='flex items-center gap-3 text-xl font-bold text-gray-900'>
              <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
                <Search className='h-5 w-5 text-white' />
              </div>
              선생 검색
            </h2>
          </div>

          <form onSubmit={handleSubmit(handleClickSearch)} className='space-y-6 p-8'>
            <div className='flex items-end gap-4'>
              <div className='flex-1'>
                <label className='mb-2 block text-sm font-semibold text-gray-700'>검색어</label>
                <Input
                  placeholder='선생님 이름, 이메일, 담당학생 검색...'
                  {...register('query', { required: false })}
                />
              </div>
              <button
                type='button'
                onClick={handleResetSearch}
                className='flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                <RotateCcw className='h-4 w-4' />
                초기화
              </button>
            </div>
          </form>
        </div>

        {/* Control Bar */}
        <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <UserCircle className='text-main h-5 w-5' />
              <h3 className='text-lg font-bold text-gray-900'>선생 목록</h3>
            </div>
            <div className='h-6 w-px bg-gray-300' />
            <span className='text-sm font-medium text-gray-600'>
              {teacherList?.data?.length || 0}명
            </span>
            {selectedTeacherId.length > 0 && (
              <>
                <div className='h-6 w-px bg-gray-300' />
                <div className='bg-main/10 text-main flex items-center gap-2 rounded-lg px-3 py-1.5'>
                  <CheckCircle2 className='h-4 w-4' />
                  <span className='text-sm font-semibold'>{selectedTeacherId.length}명 선택</span>
                </div>
              </>
            )}
          </div>
          <div className='flex items-center gap-3'>
            {selectedTeacherId.length > 0 && (
              <>
                <button
                  type='button'
                  onClick={() => setSelectedTeacherId([])}
                  className='flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                  <X className='h-4 w-4' />
                  선택 해제
                </button>
                <button
                  type='button'
                  onClick={openDeleteModal}
                  className='flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-50'>
                  <Trash2 className='h-4 w-4' />
                  선택 삭제 ({selectedTeacherId.length})
                </button>
              </>
            )}
            <SegmentedControl
              value={viewMode}
              onChange={(nextViewMode) => setViewMode(nextViewMode as 'table' | 'card')}
              items={[
                { label: '테이블', value: 'table', icon: List },
                { label: '카드', value: 'card', icon: Grid },
              ]}
            />
          </div>
        </div>

        {/* Content */}
        {viewMode === 'table' ? (
          <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-100 bg-gray-50'>
                    <th className='w-16 px-6 py-4'></th>
                    <th className='w-40 px-6 py-4 text-left text-sm font-bold text-gray-700'>
                      이름
                    </th>
                    <th className='px-6 py-4 text-left text-sm font-bold text-gray-700'>이메일</th>
                    <th className='px-6 py-4 text-left text-sm font-bold text-gray-700'>
                      담당 학생
                    </th>
                    <th className='w-32 px-6 py-4'></th>
                  </tr>
                </thead>
                <tbody>
                  {teacherList?.data?.map((teacher) => {
                    const isChecked = selectedTeacherId.includes(teacher.id);
                    return (
                      <tr
                        key={teacher.id}
                        className='group hover:bg-main/5 cursor-pointer border-b border-gray-100 transition-all duration-200'>
                        <td className='px-6 py-4'>
                          <input
                            type='checkbox'
                            checked={isChecked}
                            onChange={() => toggleTeacher(teacher.id)}
                            className='text-main focus:ring-main/20 h-4 w-4 rounded border-gray-300 focus:ring-2'
                          />
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-2'>
                            <UserCircle className='text-main h-5 w-5' />
                            <span className='text-sm font-semibold text-gray-900'>
                              {teacher.name}
                            </span>
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-2'>
                            <Mail className='h-4 w-4 text-gray-400' />
                            <span className='text-sm text-gray-600'>{teacher.email}</span>
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-2'>
                            <Users className='h-4 w-4 text-gray-400' />
                            <span className='line-clamp-1 text-sm text-gray-600'>
                              {teacher.students.map((s) => s.name).join(', ') || '-'}
                            </span>
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center justify-end gap-2'>
                            <button
                              type='button'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleModifyTeacher(teacher);
                              }}
                              className='flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                              <Pencil className='h-4 w-4' />
                            </button>
                            <button
                              type='button'
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTeacherId([teacher.id]);
                                openDeleteModal();
                              }}
                              className='flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition-all duration-200 hover:border-red-200 hover:bg-red-100'>
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
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
        )}
      </div>

      <Modal isOpen={isEditTeacherModalOpen} onClose={handleCloseEditTeacherModal}>
        <EditTeacherModal teacher={editingTeacher} onClose={handleCloseEditTeacherModal} />
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text={
            selectedTeacherId.length > 1
              ? `선택된 ${selectedTeacherId.length}명의 선생을 삭제할까요?`
              : '해당 선생을 삭제할까요?'
          }
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={() => handleClickDelete()}
        />
      </Modal>
    </div>
  );
}
