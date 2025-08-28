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
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { components } from '@schema';
import { GetProblemsSearchParams } from '@types';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import PulseLoader from 'react-spinners/PulseLoader';

export const Route = createFileRoute('/_GNBLayout/problem/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { invalidateAll } = useInvalidate();
  const navigate = useNavigate();

  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const deleteProblemId = useRef<number | null>(null);

  const [searchQuery, setSearchQuery] = useState<GetProblemsSearchParams>({});
  const [selectedTagList, setSelectedTagList] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const { register, handleSubmit, reset, watch } = useForm<GetProblemsSearchParams>();

  const { data: problemList, isLoading } = getProblemsSearch(searchQuery);
  const { mutate: mutateDeleteProblem } = deleteProblem();
  const { data: tagsData } = getConcept();
  const allTagList = tagsData?.data || [];
  const tagsNameMap = Object.fromEntries(allTagList.map((tag) => [tag.id, tag.name]));

  const watchedCustomId = watch('customId');
  const watchedTitle = watch('title');
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const trimmedCustomId = (watchedCustomId ?? '').toString().trim();
      const trimmedTitle = (watchedTitle ?? '').toString().trim();

      setSearchQuery((prev) => {
        const nextQuery: GetProblemsSearchParams = {
          ...prev,
          customId: trimmedCustomId || undefined,
          title: trimmedTitle || undefined,
        };

        const cleaned = Object.fromEntries(
          Object.entries(nextQuery).filter(([, value]) =>
            Array.isArray(value) ? value.length > 0 : Boolean(value)
          )
        ) as GetProblemsSearchParams;

        return cleaned;
      });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [watchedCustomId, watchedTitle]);

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
      <Header
        title='문제 목록'
        actionButton='새로운 문제 등록'
        onClickAction={() => {
          navigate({ to: '/problem/register' });
        }}
      />
      <form
        className='mt-[1.6rem] flex items-end justify-between gap-[2.4rem]'
        onSubmit={handleSubmit(handleClickSearch)}>
        <div className='flex gap-[2.4rem]'>
          <SearchInput
            label='문제 ID'
            placeholder='입력해주세요.'
            {...register('customId', { required: false })}
          />
          <SearchInput
            label='문제 타이틀'
            sizeType='long'
            placeholder='입력해주세요.'
            {...register('title', { required: false })}
          />
          <div className='flex w-full flex-col gap-[0.6rem]'>
            <span className='font-14b-title text-black'>문제 개념 태그</span>
            <div
              className='border-lightgray500 flex h-[4.0rem] w-full max-w-[42.4rem] cursor-pointer items-center justify-between rounded-[0.8rem] border bg-white px-400'
              onClick={() => {
                openModal();
              }}>
              <span className='text-lightgray500 font-14m-body mr-200 whitespace-nowrap'>
                선택해주세요
              </span>
              <IcDown width={24} height={24} />
            </div>
          </div>
        </div>
        <div className='flex gap-[0.4rem]'>
          <Button variant='light' type='reset' onClick={handleResetQuery}>
            초기화
          </Button>
          <Button variant='dark'>검색</Button>
        </div>
      </form>
      {selectedTagList.length > 0 && (
        <div className='mt-[1.6rem] flex flex-wrap gap-[0.8rem]'>
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

      {/* View mode toggle */}
      <div className='mt-[1.6rem] flex items-center justify-end gap-[0.4rem]'>
        <button
          className={`flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-[0.8rem] border p-[0.4rem] ${viewMode === 'table' ? 'border-lightgray500 bg-white text-black' : 'text-lightgray500 border-transparent'}`}
          onClick={() => setViewMode('table')}>
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M8.71961 6H21.5996M8.71961 12.48H21.5996M8.71961 18.96H21.5996M3.59961 6V6.0128M3.59961 12.48V12.4928M3.59961 18.96V18.9728'
              stroke='currentColor'
              stroke-width='2'
              stroke-linecap='round'
              stroke-linejoin='round'
            />
          </svg>
        </button>
        <button
          className={`flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-[0.8rem] border p-[0.4rem] ${viewMode === 'card' ? 'border-lightgray500 bg-white text-black' : 'text-lightgray500 border-transparent'}`}
          onClick={() => setViewMode('card')}>
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M12.0004 3.00002L12.0004 21M2.40039 12H21.0004M2.40039 6.00002L2.40039 18C2.40039 19.9882 4.01217 21.6 6.00039 21.6H18.0004C19.9886 21.6 21.6004 19.9882 21.6004 18V6.00002C21.6004 4.0118 19.9886 2.40003 18.0004 2.40002L6.00039 2.40002C4.01217 2.40002 2.40039 4.0118 2.40039 6.00002Z'
              stroke='currentColor'
              stroke-width='2'
            />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className='mt-1600 flex w-full items-center justify-center'>
          <PulseLoader color='#222324' aria-label='Loading Spinner' />
        </div>
      ) : (
        <>
          {viewMode === 'table' ? (
            <section className='mt-[1.6rem] w-full overflow-x-hidden'>
              <table className='w-full table-fixed border-collapse'>
                <thead>
                  <tr>
                    <th className='font-medium-14 h-[2.4rem] w-[7.2rem] px-[1.6rem] py-[0.8rem] text-[#9EA2AA]'></th>
                    <th className='font-medium-14 h-[2.4rem] w-[7.2rem] px-[1.6rem] py-[0.8rem] text-[#9EA2AA]'>
                      ID
                    </th>
                    <th className='font-medium-14 h-[2.4rem] w-[15.2rem] px-[1.6rem] py-[0.8rem] text-[#9EA2AA]'>
                      타이틀
                    </th>
                    <th className='font-medium-14 h-[2.4rem] w-[12.0rem] px-[1.6rem] py-[0.8rem] text-[#9EA2AA]'>
                      메모
                    </th>
                    <th className='font-medium-14 h-[2.4rem] w-auto px-[1.6rem] py-[0.8rem] text-[#9EA2AA]'>
                      문제
                    </th>
                    <th className='font-medium-14 h-[2.4rem] w-[8.0rem] px-[1.6rem] py-[0.8rem] text-[#9EA2AA]'>
                      답안
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {problemList?.data.map(
                    ({ id: problemId, customId, title, memo, problemContent, answer }) => {
                      type Block = components['schemas']['ContentBlockResp'];
                      const blocks: Block[] = (problemContent?.blocks || []) as Block[];
                      const problemText = blocks
                        .filter((block) => block.type === 'TEXT')
                        .map((block) => block.data)
                        .join(' ');

                      return (
                        <tr
                          key={customId}
                          className='hover:bg-lightgray100 cursor-pointer border-b-2 border-[#f7f7f7] bg-white'
                          onClick={() =>
                            navigate({
                              to: '/problem/$problemId',
                              params: { problemId: problemId.toString() },
                            })
                          }>
                          <td className='px-[1.6rem] py-[0.8rem]'>
                            <IconButton
                              variant='delete'
                              onClick={(e) => handleClickDelete(e, problemId.toString())}
                              className='scale-[0.625]'
                            />
                          </td>
                          <td className='px-[1.6rem] py-[0.8rem]'>
                            <span className='font-medium-12 bg-lightgray400 flex-shrink-0 rounded-[0.4rem] px-[0.4rem] py-[0.2rem] text-black'>
                              {customId}
                            </span>
                          </td>
                          <td className='font-14m-body max-w-[15.2rem] truncate px-[1.6rem] py-[0.8rem] text-black'>
                            {title}
                          </td>
                          <td className='font-14m-body max-w-[12.4rem] truncate px-[1.6rem] py-[0.8rem] text-black'>
                            {memo}
                          </td>
                          <td className='font-14m-body max-w-0 px-[1.6rem] py-[0.8rem] text-black'>
                            <div className='truncate'>{problemText || '문제 내용이 없습니다.'}</div>
                          </td>
                          <td className='font-14m-body max-w-[8.0rem] px-[1.6rem] py-[0.8rem] text-center text-black'>
                            {answer}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </section>
          ) : (
            <section className='mt-[1.6rem] grid grid-cols-5 gap-[0.4rem]'>
              {problemList?.data.map(
                ({ id: problemId, customId, title, memo, concepts, problemContent, answer }) => {
                  // problemContent.blocks에서 type이 IMAGE인 첫 번째 블록 찾기
                  const firstImageBlock = problemContent?.blocks?.find(
                    (block) => block.type === 'IMAGE'
                  );
                  const mainProblemImageUrl = firstImageBlock?.data;

                  type Block = components['schemas']['ContentBlockResp'];
                  const blocks: Block[] = (problemContent?.blocks || []) as Block[];
                  const problemText = blocks
                    .filter((block) => block.type === 'TEXT')
                    .map((block) => block.data)
                    .join(' ');

                  return (
                    <Link
                      key={customId}
                      to={`/problem/$problemId`}
                      params={{ problemId: problemId.toString() }}>
                      <ProblemCard>
                        <IconButton
                          variant='delete'
                          onClick={(e) => handleClickDelete(e, problemId.toString())}
                          className='h-[2.4rem] w-[2.4rem] scale-[0.6666666666666666]'
                        />
                        <ProblemCard.Title customId={customId} title={title} />
                        <ProblemCard.Info label='문제 메모' content={memo} />
                        <ProblemCard.Info label='문제' content={problemText} />
                        <ProblemCard.Info label='답안' content={answer.toString()} />

                        {/* {mainProblemImageUrl && (
                          <ProblemCard.CardImage src={mainProblemImageUrl} height={'34.4rem'} />
                        )} */}

                        {/* <ProblemCard.TagSection>
                          {(concepts || []).map((tag, tagIndex) => {
                            return <Tag key={`${tag}-${tagIndex}`} label={tag.name} />;
                          })}
                        </ProblemCard.TagSection> */}
                      </ProblemCard>
                    </Link>
                  );
                }
              )}
            </section>
          )}
        </>
      )}

      {/* <FloatingButton>
        <Link to='/problem/register' className='flex h-full w-full items-center justify-center'>
          새로운 문제 등록하기
        </Link>
      </FloatingButton> */}
      <Modal isOpen={isOpen} onClose={closeModal}>
        <TagSelectModal
          onClose={closeModal}
          selectedTagList={selectedTagList}
          handleChangeTagList={handleChangeTagList}
        />
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text='문제을 삭제할까요?'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={handleMutateDelete}
        />
      </Modal>
    </>
  );
}
