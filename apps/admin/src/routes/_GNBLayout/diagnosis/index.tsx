import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button, Header, Input, Modal, Tag, TwoButtonModalTemplate } from '@components';
import { useForm } from 'react-hook-form';
import {
  getStudent,
  getDiagnosis,
  getDiagnosisById,
  deleteDiagnosis,
  postDiagnosis,
  putDiagnosis,
} from '@apis';
import { useModal } from '@hooks';
import { useSelectedStudent } from '@hooks';
import { components } from '@schema';
import { useQueryClient } from '@tanstack/react-query';
import { IcDelete, IcPencil, IcPlus } from '@svg';

const convertUTCToKST = (utcDateString: string) => {
  const utcDate = new Date(utcDateString);
  const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
  return kstDate;
};

export const Route = createFileRoute('/_GNBLayout/diagnosis/')({
  component: RouteComponent,
});

type StudentResp = components['schemas']['StudentResp'];

function RouteComponent() {
  const { selectedStudent, setSelectedStudent } = useSelectedStudent();
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState('');
  const [newDiagnosisContent, setNewDiagnosisContent] = useState('');

  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const {
    isOpen: isCreateModalOpen,
    openModal: openCreateModal,
    closeModal: closeCreateModal,
  } = useModal();

  const { register, handleSubmit, watch } = useForm<{
    query: string;
  }>();

  const queryClient = useQueryClient();

  // API calls
  const { data: studentList } = getStudent({ query: searchQuery });
  const { data: diagnosisList } = getDiagnosis({
    studentId: selectedStudent?.id || 0,
  });
  const { data: selectedDiagnosisDetail } = getDiagnosisById({
    id: selectedDiagnosisId || 0,
  });

  const { mutateAsync: deleteDiagnosisMutate } = deleteDiagnosis();
  const { mutateAsync: createDiagnosisMutate } = postDiagnosis();
  const { mutateAsync: updateDiagnosisMutate } = putDiagnosis();

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

  const handleStudentSelect = (student: StudentResp) => {
    setSelectedStudent(student);
    setSelectedDiagnosisId(null);
    setIsEditing(false);
  };

  const handleDiagnosisSelect = (diagnosisId: number) => {
    setSelectedDiagnosisId(diagnosisId);
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (selectedDiagnosisDetail) {
      setEditingContent(selectedDiagnosisDetail.content || '');
      setIsEditing(true);
    }
  };

  const handleEditingContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 1000) {
      setEditingContent(value);
    }
  };

  const handleNewDiagnosisContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 1000) {
      setNewDiagnosisContent(value);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedDiagnosisId || !selectedStudent) return;

    try {
      await updateDiagnosisMutate({
        params: {
          path: { id: selectedDiagnosisId },
        },
        body: {
          content: editingContent,
        },
      });
      setIsEditing(false);
      queryClient.invalidateQueries();
    } catch (error) {
      console.error('Failed to update diagnosis:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingContent('');
  };

  const handleDelete = async () => {
    if (!selectedDiagnosisId) return;

    try {
      await deleteDiagnosisMutate({
        params: {
          path: { id: selectedDiagnosisId },
        },
      });
      setSelectedDiagnosisId(null);
      closeDeleteModal();
      queryClient.invalidateQueries();
    } catch (error) {
      console.error('Failed to delete diagnosis:', error);
    }
  };

  const handleCreateDiagnosis = async () => {
    if (!selectedStudent || !newDiagnosisContent.trim()) return;

    try {
      await createDiagnosisMutate({
        body: {
          studentId: selectedStudent.id,
          content: newDiagnosisContent,
        },
      });
      setNewDiagnosisContent('');
      closeCreateModal();
      queryClient.invalidateQueries();
    } catch (error) {
      console.error('Failed to create diagnosis:', error);
    }
  };

  return (
    <>
      <Header title='학생 진단' />

      {/* Student Selection Section */}
      <section className='mb-[4.8rem]'>
        <form
          className='my-1200 flex items-end justify-between gap-800'
          onSubmit={handleSubmit(handleClickSearch)}>
          <Input placeholder='학생 이름 검색' {...register('query', { required: false })} />
          <Button variant='dark'>검색</Button>
        </form>

        <div className='mb-1200'>
          <div className='flex flex-wrap gap-400'>
            {studentList?.data?.map((student) => (
              <Tag
                key={student.id}
                onClick={() => handleStudentSelect(student)}
                label={`${student.name}`}
                color={selectedStudent?.id === student.id ? 'dark' : 'light'}
              />
            ))}
          </div>
        </div>
      </section>

      {selectedStudent && (
        <section className='mt-[4.8rem]'>
          <div className='rounded-400 border-lightgray400 overflow-hidden border bg-white'>
            <div className='flex h-[80rem]'>
              {/* Diagnosis List */}
              <div className='w-1/3 overflow-y-auto p-1200'>
                <div className='mb-800'>
                  <h3 className='font-bold-20 text-black'>
                    {selectedStudent.name} 학생의 진단 목록
                  </h3>
                </div>
                <div className='space-y-300'>
                  {diagnosisList?.data?.map((diagnosis) => (
                    <div
                      key={diagnosis.id}
                      onClick={() => handleDiagnosisSelect(diagnosis.id)}
                      className={`rounded-200 cursor-pointer border p-600 transition-all duration-200 ${
                        selectedDiagnosisId === diagnosis.id
                          ? 'bg-lightgray100 border-lightgray400'
                          : 'hover:bg-lightgray100 border-lightgray300 bg-white'
                      }`}>
                      <div className={`font-medium-14 ellipsis mb-150 line-clamp-1`}>
                        {diagnosis.content}
                      </div>
                      <div className={`font-medium-12 text-midgray100`}>
                        {convertUTCToKST(diagnosis.createdAt || '').toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      {/* <div className={`font-medium-14 text-midgray200 mb-150`}>
                        ID: {diagnosis.id}
                      </div> */}
                    </div>
                  ))}
                  {(!diagnosisList?.data || diagnosisList.data.length === 0) && (
                    <div className='py-[25rem] text-center'>
                      <div className='font-medium-16 text-midgray100'>진단 정보가 없습니다</div>
                    </div>
                  )}
                  <button
                    type='button'
                    onClick={openCreateModal}
                    className='font-medium-18 mx-auto mt-600 flex items-center gap-300 rounded-full border bg-gray-700 px-600 py-400 break-keep whitespace-nowrap text-white transition-colors duration-200 hover:bg-gray-600'>
                    <IcPlus className='h-[2.4rem] w-[2.4rem] scale-80' />
                    진단 추가하기
                  </button>
                </div>
              </div>

              <div className='bg-lightgray400 h-full w-[1px]' />

              {/* Diagnosis Detail */}
              <div className='flex-1 p-1200'>
                {selectedDiagnosisDetail ? (
                  <div className='flex h-full flex-col'>
                    <div className='mb-1200 flex items-center justify-between'>
                      <div>
                        <h3 className='font-bold-20 mb-100 text-black'>진단 상세</h3>
                        <div className='font-medium-14 text-midgray100'>
                          {convertUTCToKST(
                            selectedDiagnosisDetail.createdAt || ''
                          ).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <div className='flex gap-300'>
                        {isEditing ? (
                          <>
                            <button
                              type='button'
                              onClick={handleCancelEdit}
                              className='font-medium-16 flex items-center gap-100 rounded-full border border-gray-200 bg-gray-100/70 px-400 py-200 break-keep whitespace-nowrap text-gray-500 transition-colors duration-200 hover:bg-gray-200/70'>
                              취소
                            </button>
                            <button
                              type='button'
                              onClick={handleSaveEdit}
                              className='font-medium-16 flex items-center gap-100 rounded-full border border-gray-800 bg-gray-700 px-400 py-200 break-keep whitespace-nowrap text-white transition-colors duration-200 hover:bg-gray-800'>
                              저장
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type='button'
                              onClick={handleEdit}
                              className='font-medium-16 flex items-center gap-100 rounded-full border border-blue-200 bg-blue-100/70 py-200 pr-400 pl-300 break-keep whitespace-nowrap text-blue-500 transition-colors duration-200 hover:bg-blue-200/70'>
                              <IcPencil className='h-[2.4rem] w-[2.4rem] scale-70' />
                              수정
                            </button>
                            <button
                              type='button'
                              onClick={openDeleteModal}
                              className='font-medium-16 text-red flex items-center gap-100 rounded-full border border-red-200 bg-red-100/70 py-200 pr-400 pl-300 break-keep whitespace-nowrap transition-colors duration-200 hover:bg-red-200/70'>
                              <IcDelete className='h-[2.4rem] w-[2.4rem] scale-70' />
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className='flex-1'>
                      {isEditing ? (
                        <div className='relative h-full'>
                          <textarea
                            value={editingContent}
                            onChange={handleEditingContentChange}
                            className='rounded-200 border-lightgray400 bg-lightgray100 font-medium-16 focus:border-main h-full w-full resize-none border p-800 pb-1600 focus:outline-none'
                            placeholder='진단 내용을 입력하세요...'
                          />
                          <div className='text-midgray100 font-medium-14 absolute right-800 bottom-800'>
                            {editingContent.length}/1000
                          </div>
                        </div>
                      ) : (
                        <div className='rounded-200 border-lightgray300 font-medium-16 h-full w-full overflow-y-auto border p-800'>
                          <div className='font-medium-16 leading-relaxed break-all text-black'>
                            {selectedDiagnosisDetail.content || '진단 내용이 없습니다.'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    <div className='text-center'>
                      <div className='font-bold-24 text-midgray100 mb-200'>진단을 선택해주세요</div>
                      <div className='font-medium-14 text-midgray200'>
                        왼쪽 목록에서 진단을 클릭하면 상세 내용을 확인할 수 있습니다
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text='이 진단을 삭제하시겠습니까?'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={handleDelete}
        />
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal}>
        <div className='w-[80rem] px-1600 py-1200'>
          <h3 className='font-bold-24 mb-1200 text-black'>새 진단 추가</h3>
          <div className='relative mb-200'>
            <textarea
              value={newDiagnosisContent}
              onChange={handleNewDiagnosisContentChange}
              className='rounded-400 border-lightgray500 font-medium-16 h-[30rem] w-full resize-none border p-800'
              placeholder='진단 내용을 입력하세요...'
            />
          </div>
          <div className='text-midgray100 font-medium-14 mr-100 mb-800 text-right'>
            {newDiagnosisContent.length}/1000
          </div>
          <div className='flex justify-end gap-400'>
            <Button variant='light' onClick={closeCreateModal}>
              취소
            </Button>
            <Button variant='dark' onClick={handleCreateDiagnosis}>
              추가
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
