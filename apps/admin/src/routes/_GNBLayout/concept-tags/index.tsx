import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button, FloatingButton, Header, Input, Modal, TwoButtonModalTemplate } from '@components';
import { useForm } from 'react-hook-form';
import { Divider } from '@repo/pointer-design-system/components';
import { IcPencil } from '@svg';
import { getConcept, getConceptCategory, deleteConcept } from '@apis';
import { useModal, useInvalidate } from '@hooks';

import type { components } from '@/types/api/schema';
import { ConceptTagCard } from '@/components/conceptTags';
import EditConceptModal from '@/components/common/Modals/EditConceptModal';

export const Route = createFileRoute('/_GNBLayout/concept-tags/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedTag, setSelectedTag] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedConceptForDelete, setSelectedConceptForDelete] = useState<number | null>(null);
  const [selectedConceptForEdit, setSelectedConceptForEdit] = useState<
    components['schemas']['ConceptResp'] | null
  >(null);
  const [isMultipleDelete, setIsMultipleDelete] = useState<boolean>(false);
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();
  const {
    isOpen: isEditConceptModalOpen,
    openModal: openEditConceptModal,
    closeModal: closeEditConceptModal,
  } = useModal();

  // api
  const { data: concepts } = getConcept({ query: searchQuery });
  const { data: conceptCategories } = getConceptCategory();
  const { invalidateAll } = useInvalidate();
  const deleteConceptMutation = deleteConcept();

  const toggleTag = (tag: number) => {
    setSelectedTag((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const { register, handleSubmit } = useForm<{
    query: string;
  }>();

  const handleClickSearch = (data: { query: string }) => {
    setSearchQuery(data.query.trim());
    setSelectedTag([]);
  };

  const handleConfirmDelete = async () => {
    try {
      if (isMultipleDelete) {
        // 선택된 태그들 삭제
        await Promise.all(
          selectedTag.map((conceptId) =>
            deleteConceptMutation.mutateAsync({
              params: {
                path: {
                  conceptId,
                },
              },
            })
          )
        );
        setSelectedTag([]);
        alert('선택된 개념 태그들이 삭제되었습니다.');
      } else if (selectedConceptForDelete) {
        // 개별 태그 삭제
        await deleteConceptMutation.mutateAsync({
          params: {
            path: {
              conceptId: selectedConceptForDelete,
            },
          },
        });
        setSelectedConceptForDelete(null);
      }

      invalidateAll();
      closeDeleteModal();
      setIsMultipleDelete(false);
    } catch (error) {
      console.error('개념 태그 삭제 중 오류가 발생했습니다:', error);
      alert('개념 태그 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteSelectedConcepts = () => {
    if (selectedTag.length === 0) {
      alert('삭제할 개념 태그를 선택해주세요.');
      return;
    }
    setIsMultipleDelete(true);
    openDeleteModal();
  };

  return (
    <>
      <Header title='개념 태그 검색' />
      <form
        className='my-[4.8rem] flex items-end justify-between gap-[3.2rem]'
        onSubmit={handleSubmit(handleClickSearch)}>
        <Input placeholder='검색어를 입력해주세요' {...register('query', { required: false })} />
        <Button variant='dark'>검색</Button>
      </form>
      <Divider />
      <div className='my-[4.8rem] flex items-center justify-between'>
        <h2 className='font-bold-32 text-black'>개념 태그 리스트</h2>
        <div className='flex gap-[1.6rem]'>
          <Button sizeType='fit' variant='light' onClick={() => setSelectedTag([])}>
            전체 선택 해제
          </Button>
          <Button sizeType='fit' variant='dark' onClick={handleDeleteSelectedConcepts}>
            선택 태그 삭제
          </Button>
        </div>
      </div>

      <section className='mb-[8rem] flex flex-col gap-[4.8rem]'>
        {conceptCategories?.data.map((category) =>
          concepts?.data.some((concept) => concept.category.id === category.id) ? (
            <article>
              <div className='mb-[4rem] flex items-center gap-[1.2rem]'>
                <h4 className='font-bold-24 text-black'>{category.name}</h4>
                <IcPencil className='cursor-pointer' width={24} height={24} onClick={() => {}} />
              </div>
              <div className='grid grid-cols-3 gap-[4rem]'>
                {concepts?.data
                  .filter((concept) => concept.category.id === category.id)
                  .map((concept) => {
                    const isChecked = selectedTag.includes(concept.id);
                    return (
                      <ConceptTagCard
                        key={concept.id}
                        name={concept.name}
                        isChecked={isChecked}
                        toggleTag={() => toggleTag(concept.id)}
                        onDelete={() => {
                          setSelectedConceptForDelete(concept.id);
                          setIsMultipleDelete(false);
                          openDeleteModal();
                        }}
                        onModify={() => {
                          setSelectedConceptForEdit(concept);
                          openEditConceptModal();
                        }}
                      />
                    );
                  })}
              </div>
            </article>
          ) : (
            <></>
          )
        )}
      </section>

      <FloatingButton
        onClick={() => {
          setSelectedConceptForEdit(null);
          openEditConceptModal();
        }}>
        새로운 개념 태그 등록하기
      </FloatingButton>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          closeDeleteModal();
          setIsMultipleDelete(false);
          setSelectedConceptForDelete(null);
        }}>
        <TwoButtonModalTemplate
          text={
            isMultipleDelete
              ? `선택된 ${selectedTag.length}개의 개념 태그를 삭제할까요?`
              : '개념 태그를 삭제할까요?'
          }
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={() => {
            closeDeleteModal();
            setIsMultipleDelete(false);
            setSelectedConceptForDelete(null);
          }}
          handleClickRightButton={handleConfirmDelete}
        />
      </Modal>
      <Modal isOpen={isEditConceptModalOpen} onClose={closeEditConceptModal}>
        <EditConceptModal
          onClose={closeEditConceptModal}
          onSave={() => {
            invalidateAll();
            closeEditConceptModal();
          }}
          concept={selectedConceptForEdit}
        />
      </Modal>
    </>
  );
}
