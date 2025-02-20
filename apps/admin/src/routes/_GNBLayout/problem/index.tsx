import { $api, deleteProblems, getProblemsSearch } from '@apis';
import {
  Button,
  FloatingButton,
  Header,
  IconButton,
  Modal,
  ProblemCard,
  SearchInput,
  Tag,
  TagSelectModal,
  TwoButtonModalTemplate,
} from '@components';
import { useModal } from '@hooks';
import { IcDown } from '@svg';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { getProblemsSearchParamsType, TagType } from '@types';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/_GNBLayout/problem/')({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();

  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const deleteProblemId = useRef<number | null>(null);

  const [searchQuery, setSearchQuery] = useState<getProblemsSearchParamsType>({});
  const [selectedTagList, setSelectedTagList] = useState<TagType[]>([]);

  const { register, handleSubmit, reset } = useForm<getProblemsSearchParamsType>();
  const { data: problemList } = getProblemsSearch(searchQuery);
  const { mutate } = deleteProblems();

  const handleClickDelete = (e: React.MouseEvent<HTMLButtonElement>, problemId: string) => {
    e.stopPropagation();
    e.preventDefault();

    deleteProblemId.current = Number(problemId);
    openDeleteModal();
  };

  const handleMutateDelete = () => {
    if (!deleteProblemId.current) return;

    mutate(
      {
        params: {
          path: {
            id: deleteProblemId.current,
          },
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: $api.queryOptions('get', '/api/v1/problems/search').queryKey,
          });
        },
      }
    );
  };

  const handleClickSearch = (data: getProblemsSearchParamsType) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => Boolean(value))
    );

    const conceptTagIds = selectedTagList.map((tag) => tag.id);

    const newQuery = { ...filteredData, conceptTagIds };
    setSearchQuery(newQuery);
  };

  const handleResetQuery = () => {
    reset();
    setSelectedTagList([]);
    setSearchQuery({});
  };

  const handleRemoveTag = (tag: TagType) => {
    setSelectedTagList((prev) => prev.filter((selectedTag) => selectedTag.id !== tag.id));
  };

  const handleChangeTagList = (tagList: TagType[]) => {
    setSelectedTagList(tagList);
  };

  return (
    <>
      <Header title='문항 목록' />
      <form
        className='mt-[4.8rem] flex items-end justify-between'
        onSubmit={handleSubmit(handleClickSearch)}>
        <div className='flex gap-[2.4rem]'>
          <SearchInput
            label='문항 ID'
            placeholder='입력해주세요.'
            {...register('problemCustomId', { required: false })}
          />
          <SearchInput
            label='문항 타이틀'
            sizeType='long'
            placeholder='입력해주세요.'
            {...register('problemTitle', { required: false })}
          />
          <div className='flex flex-col gap-[1.2rem]'>
            <span className='font-medium-18 text-black'>문항 개념 태그</span>
            <div
              className='border-lightgray500 flex h-[5.6rem] w-[42.4rem] cursor-pointer items-center justify-between rounded-[16px] border bg-white px-[1.6rem] py-[0.8rem]'
              onClick={() => {
                openModal();
              }}>
              <span className='text-lightgray500 font-medium-18'>선택해주세요</span>
              <IcDown width={24} height={24} />
            </div>
          </div>
        </div>
        <div className='flex gap-[1.6rem]'>
          <Button variant='light' type='reset' onClick={handleResetQuery}>
            초기화
          </Button>
          <Button variant='dark'>검색</Button>
        </div>
      </form>
      {selectedTagList.length > 0 && (
        <div className='mt-[4.8rem] flex gap-[0.8rem]'>
          {selectedTagList.map((tag) => (
            <Tag
              key={tag.id}
              label={tag.name}
              removable
              color='dark'
              onClick={() => handleRemoveTag(tag)}
            />
          ))}
        </div>
      )}

      <section className='mt-[6.4rem] grid grid-cols-3 gap-x-[2.4rem] gap-y-[4.8rem]'>
        {problemList?.data.map(
          ({ problemCustomId, memo, mainProblemImageUrl, conceptTagResponses }) => (
            <Link
              key={problemCustomId}
              to={`/problem/$problemId`}
              params={{ problemId: problemCustomId }}>
              <ProblemCard>
                <ProblemCard.TextSection>
                  <ProblemCard.Info label='문항 ID' content={problemCustomId} />
                  <ProblemCard.Info label='문항 타이틀' content={problemCustomId} />
                  <ProblemCard.Info label='문항 메모' content={memo} />
                </ProblemCard.TextSection>

                <ProblemCard.ButtonSection>
                  <IconButton
                    variant='delete'
                    onClick={(e) => handleClickDelete(e, problemCustomId)}
                  />
                </ProblemCard.ButtonSection>

                <ProblemCard.CardImage src={mainProblemImageUrl} height={'34.4rem'} />

                <ProblemCard.TagSection>
                  {(conceptTagResponses || []).map((tag) => {
                    return <Tag key={tag.id} label={tag.name} />;
                  })}
                </ProblemCard.TagSection>
              </ProblemCard>
            </Link>
          )
        )}
      </section>
      <FloatingButton>
        <Link to='/problem/register' className='flex h-full w-full items-center justify-center'>
          새로운 문항 등록하기
        </Link>
      </FloatingButton>
      <Modal isOpen={isOpen} onClose={closeModal}>
        <TagSelectModal
          onClose={closeModal}
          selectedTagList={selectedTagList}
          handleChangeTagList={handleChangeTagList}
        />
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text='문항을 삭제할까요?'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={handleMutateDelete}
        />
      </Modal>
    </>
  );
}
