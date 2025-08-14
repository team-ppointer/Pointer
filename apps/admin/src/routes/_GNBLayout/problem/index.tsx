import { deleteProblem, getConcept, getProblemsSearch } from '@apis';
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
import { useInvalidate, useModal } from '@hooks';
import { IcDown } from '@svg';
import { createFileRoute, Link } from '@tanstack/react-router';
import { GetProblemsSearchParams } from '@types';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import PulseLoader from 'react-spinners/PulseLoader';

export const Route = createFileRoute('/_GNBLayout/problem/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { invalidateAll } = useInvalidate();

  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const deleteProblemId = useRef<number | null>(null);

  const [searchQuery, setSearchQuery] = useState<GetProblemsSearchParams>({});
  const [selectedTagList, setSelectedTagList] = useState<number[]>([]);

  const { register, handleSubmit, reset } = useForm<GetProblemsSearchParams>();

  const { data: problemList, isLoading } = getProblemsSearch(searchQuery);
  const { mutate: mutateDeleteProblem } = deleteProblem();
  const { data: tagsData } = getConcept();
  const allTagList = tagsData?.data || [];
  const tagsNameMap = Object.fromEntries(allTagList.map((tag) => [tag.id, tag.name]));

  const handleClickDelete = (e: React.MouseEvent<HTMLButtonElement>, problemId: string) => {
    e.stopPropagation();
    e.preventDefault();

    deleteProblemId.current = Number(problemId);
    openDeleteModal();
  };

  const handleMutateDelete = () => {
    if (!deleteProblemId.current) return;

    mutateDeleteProblem(
      {
        params: {
          path: {
            id: deleteProblemId.current,
          },
        },
      },
      {
        onSuccess: () => {
          closeDeleteModal();
          invalidateAll();
        },
      }
    );
  };

  const handleClickSearch = (data: GetProblemsSearchParams) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => Boolean(value))
    );
    setSearchQuery({ ...filteredData, concepts: selectedTagList });
  };

  const handleResetQuery = () => {
    reset();
    setSelectedTagList([]);
    setSearchQuery({});
  };

  const handleRemoveTag = (tag: number) => {
    setSelectedTagList((prev) => prev.filter((selectedTag) => selectedTag !== tag));
    setSearchQuery((prev) => {
      return {
        ...prev,
        concepts: prev.concepts?.filter((selectedTag) => selectedTag !== tag),
      };
    });
  };

  const handleChangeTagList = (tagList: number[]) => {
    setSelectedTagList(tagList);
    setSearchQuery((prev) => {
      return {
        ...prev,
        concepts: tagList,
      };
    });
  };

  return (
    <>
      <Header title='문항 목록' />
      <form
        className='mt-1200 flex items-end justify-between gap-400'
        onSubmit={handleSubmit(handleClickSearch)}>
        <div className='flex gap-600'>
          <SearchInput
            label='문항 ID'
            placeholder='입력해주세요.'
            {...register('customId', { required: false })}
          />
          <SearchInput
            label='문항 타이틀'
            sizeType='long'
            placeholder='입력해주세요.'
            {...register('title', { required: false })}
          />
          <div className='flex w-full flex-col gap-300'>
            <span className='font-medium-18 text-black'>문항 개념 태그</span>
            <div
              className='border-lightgray500 rounded-400 flex h-[5.6rem] w-full max-w-[42.4rem] cursor-pointer items-center justify-between border bg-white px-400 py-200'
              onClick={() => {
                openModal();
              }}>
              <span className='text-lightgray500 font-medium-18 mr-200 whitespace-nowrap'>
                선택해주세요
              </span>
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
        <div className='mt-1200 flex flex-wrap gap-200'>
          {selectedTagList.map((tag) => (
            <Tag
              key={tag}
              label={tagsNameMap[tag] || ''}
              removable
              color='dark'
              onClick={() => handleRemoveTag(tag)}
            />
          ))}
        </div>
      )}

      {isLoading ? (
        <div className='mt-1600 flex w-full items-center justify-center'>
          <PulseLoader color='#222324' aria-label='Loading Spinner' />
        </div>
      ) : (
        <section className='mt-1600 grid grid-cols-3 gap-x-600 gap-y-1200'>
          {problemList?.data.map(
            ({ id: problemId, customId, title, memo, concepts, problemContent }) => {
              // problemContent.blocks에서 type이 IMAGE인 첫 번째 블록 찾기
              const firstImageBlock = problemContent?.blocks?.find(
                (block) => block.type === 'IMAGE'
              );
              const mainProblemImageUrl = firstImageBlock?.data;

              return (
                <Link
                  key={customId}
                  to={`/problem/$problemId`}
                  params={{ problemId: problemId.toString() }}>
                  <ProblemCard>
                    <ProblemCard.TextSection>
                      <ProblemCard.Info label='문항 ID' content={customId} />
                      <ProblemCard.Info label='문항 타이틀' content={title} />
                      <ProblemCard.Info label='문항 메모' content={memo} />
                    </ProblemCard.TextSection>

                    <ProblemCard.ButtonSection>
                      <IconButton
                        variant='delete'
                        onClick={(e) => handleClickDelete(e, problemId.toString())}
                      />
                    </ProblemCard.ButtonSection>

                    {mainProblemImageUrl && (
                      <ProblemCard.CardImage src={mainProblemImageUrl} height={'34.4rem'} />
                    )}

                    <ProblemCard.TagSection>
                      {(concepts || []).map((tag, tagIndex) => {
                        return <Tag key={`${tag}-${tagIndex}`} label={tag.name} />;
                      })}
                    </ProblemCard.TagSection>
                  </ProblemCard>
                </Link>
              );
            }
          )}
        </section>
      )}

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
