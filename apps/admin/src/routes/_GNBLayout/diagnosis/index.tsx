import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Header, Modal, TwoButtonModalTemplate } from '@components';
import {
  getDiagnosis,
  getDiagnosisById,
  deleteDiagnosis,
  postDiagnosis,
  putDiagnosis,
} from '@apis';
import { useModal } from '@hooks';
import { useSelectedStudent } from '@hooks';
import { useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react';

const convertUTCToKST = (utcDateString: string) => {
  const utcDate = new Date(utcDateString);
  const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
  return kstDate;
};

export const Route = createFileRoute('/_GNBLayout/diagnosis/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { selectedStudent } = useSelectedStudent();
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState<number | null>(null);
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

  const queryClient = useQueryClient();

  // API calls
  const { data: diagnosisList } = getDiagnosis({
    studentId: selectedStudent?.id || 0,
  });
  const { data: selectedDiagnosisDetail } = getDiagnosisById({
    id: selectedDiagnosisId || 0,
  });

  const { mutateAsync: deleteDiagnosisMutate } = deleteDiagnosis();
  const { mutateAsync: createDiagnosisMutate } = postDiagnosis();
  const { mutateAsync: updateDiagnosisMutate } = putDiagnosis();

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
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <Header title='학생 진단'>
        <div className='flex items-center gap-3'>
          {selectedStudent && (
            <Header.Button Icon={Plus} color='main' onClick={openCreateModal}>
              진단 추가
            </Header.Button>
          )}
        </div>
      </Header>

      <div className='mx-auto max-w-7xl px-8 py-8'>
        {!selectedStudent ? (
          <div className='mb-6 flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-6'>
            <AlertCircle className='mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600' />
            <div>
              <h3 className='mb-1 text-lg font-bold text-amber-900'>학생을 선택해주세요</h3>
              <p className='text-sm text-amber-700'>
                사이드바에서 학생을 선택하시면 해당 학생의 진단 정보를 관리할 수 있습니다.
              </p>
            </div>
          </div>
        ) : (
          <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white'>
            <div className='flex h-[80rem]'>
              {/* Diagnosis List */}
              <div className='w-1/3 overflow-y-auto border-r border-gray-200 p-6'>
                <div className='mb-6'>
                  <div className='mb-4 flex items-center gap-3'>
                    <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
                      <FileText className='h-5 w-5 text-white' />
                    </div>
                    <div>
                      <h3 className='text-lg font-bold text-gray-900'>진단 목록</h3>
                      <p className='text-sm text-gray-500'>{diagnosisList?.data?.length || 0}개</p>
                    </div>
                  </div>
                </div>

                <div className='space-y-3'>
                  {diagnosisList?.data?.map((diagnosis) => (
                    <div
                      key={diagnosis.id}
                      onClick={() => handleDiagnosisSelect(diagnosis.id)}
                      className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                        selectedDiagnosisId === diagnosis.id
                          ? 'bg-main/10 border-main/40'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      <div className='mb-2 line-clamp-2 text-sm font-medium text-gray-900'>
                        {diagnosis.content}
                      </div>
                      <div className='flex items-center gap-2 text-xs text-gray-500'>
                        <Calendar className='h-3.5 w-3.5' />
                        {convertUTCToKST(diagnosis.createdAt || '').toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  ))}

                  {(!diagnosisList?.data || diagnosisList.data.length === 0) && (
                    <div className='py-[20rem] text-center'>
                      <FileText className='mx-auto mb-4 h-12 w-12 text-gray-300' />
                      <div className='text-sm font-medium text-gray-400'>진단 정보가 없습니다</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Diagnosis Detail */}
              <div className='flex-1 p-6'>
                {selectedDiagnosisDetail ? (
                  <div className='flex h-full flex-col'>
                    <div className='mb-6 flex items-center justify-between'>
                      <div>
                        <div className='mb-2 flex items-center gap-3'>
                          <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
                            <FileText className='h-5 w-5 text-white' />
                          </div>
                          <h3 className='text-xl font-bold text-gray-900'>진단 상세</h3>
                        </div>
                        <div className='ml-[3.25rem] flex items-center gap-2 text-sm text-gray-500'>
                          <Clock className='h-3.5 w-3.5' />
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
                      <div className='flex gap-2'>
                        {isEditing ? (
                          <>
                            <button
                              type='button'
                              onClick={handleCancelEdit}
                              className='flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                              <X className='h-4 w-4' />
                              취소
                            </button>
                            <button
                              type='button'
                              onClick={handleSaveEdit}
                              className='hover:bg-main/90 bg-main flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200'>
                              <Save className='h-4 w-4' />
                              저장
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type='button'
                              onClick={handleEdit}
                              className='flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition-all duration-200 hover:border-blue-300 hover:bg-blue-100'>
                              <Pencil className='h-4 w-4' />
                              수정
                            </button>
                            <button
                              type='button'
                              onClick={openDeleteModal}
                              className='flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-100'>
                              <Trash2 className='h-4 w-4' />
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
                            className='focus:border-main focus:ring-main/20 h-full w-full resize-none rounded-xl border border-gray-200 p-6 pb-16 text-sm transition-all duration-200 hover:border-gray-300 focus:bg-white focus:ring-2 focus:outline-none'
                            placeholder='진단 내용을 입력하세요...'
                          />
                          <div className='absolute right-6 bottom-6 text-sm font-medium text-gray-400'>
                            {editingContent.length}/1000
                          </div>
                        </div>
                      ) : (
                        <div className='h-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-6'>
                          <div className='text-sm leading-relaxed whitespace-pre-wrap text-gray-700'>
                            {selectedDiagnosisDetail.content || '진단 내용이 없습니다.'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    <div className='text-center'>
                      <FileText className='mx-auto mb-4 h-16 w-16 text-gray-300' />
                      <div className='mb-2 text-xl font-bold text-gray-400'>
                        진단을 선택해주세요
                      </div>
                      <div className='text-sm text-gray-400'>
                        왼쪽 목록에서 진단을 클릭하면 상세 내용을 확인할 수 있습니다
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

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
        <div className='w-[60rem] rounded-2xl bg-white p-8'>
          <div className='mb-6 flex items-center gap-3'>
            <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
              <Plus className='h-5 w-5 text-white' />
            </div>
            <h3 className='text-xl font-bold text-gray-900'>새 진단 추가</h3>
          </div>
          <div className='relative mb-2'>
            <textarea
              value={newDiagnosisContent}
              onChange={handleNewDiagnosisContentChange}
              className='focus:border-main focus:ring-main/20 h-[30rem] w-full resize-none rounded-xl border border-gray-200 p-6 text-sm transition-all duration-200 hover:border-gray-300 focus:bg-white focus:ring-2 focus:outline-none'
              placeholder='진단 내용을 입력하세요...'
            />
          </div>
          <div className='mb-6 text-right text-sm font-medium text-gray-400'>
            {newDiagnosisContent.length}/1000
          </div>
          <div className='flex justify-end gap-3'>
            <button
              type='button'
              onClick={closeCreateModal}
              className='flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
              취소
            </button>
            <button
              type='button'
              onClick={handleCreateDiagnosis}
              className='hover:bg-main/90 bg-main flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200'>
              추가
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
