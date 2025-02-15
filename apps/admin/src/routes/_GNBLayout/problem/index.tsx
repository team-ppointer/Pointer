import { $api, deleteProblems, getProblemsSearch } from '@apis';
import {
  Button,
  FloatingButton,
  Header,
  IconButton,
  ProblemCard,
  SearchInput,
  Tag,
  TagSelect,
} from '@components';
import { useSelectTag } from '@hooks';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { getProblemsSearchParamsType, TagType } from '@types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/_GNBLayout/problem/')({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const { navigate } = useRouter();

  const [searchQuery, setSearchQuery] = useState<getProblemsSearchParamsType>({});
  const { selectedList, unselectedList, onClickSelectTag, onClickRemoveTag } = useSelectTag();
  const { register, handleSubmit, reset } = useForm<getProblemsSearchParamsType>();
  const { data: problemList } = getProblemsSearch(searchQuery);
  const { mutate } = deleteProblems();

  const handleClickCard = (problemId: string) => {
    navigate({ to: `/problem/${problemId}` });
  };

  const handleClickDelete = (e: React.MouseEvent<HTMLButtonElement>, problemId: string) => {
    e.stopPropagation();

    mutate(
      {
        params: {
          path: {
            id: Number(problemId),
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

  const tagToQueryParams = (tags: TagType[]) => {
    if (!tags.length) return {};
    return { conceptTagIds: tags.map((tag) => tag.id) };
  };

  const handleClickSearch = (data: getProblemsSearchParamsType) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => Boolean(value))
    );
    const tagData = tagToQueryParams(selectedList);

    const newQuery = { ...filteredData, ...tagData };
    setSearchQuery(newQuery);
  };

  const handleResetQuery = () => {
    reset();
    setSearchQuery({});
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
            {...register('problemId', { required: false })}
          />
          <SearchInput
            label='문항 이름'
            placeholder='입력해주세요.'
            {...register('comment', { required: false })}
          />
          <div className='flex flex-col gap-[1.2rem]'>
            <span className='font-medium-18 text-black'>문항 개념 태그</span>
            <TagSelect
              selectedList={selectedList}
              unselectedList={unselectedList}
              onClickSelectTag={onClickSelectTag}
              onClickRemoveTag={onClickRemoveTag}
            />
          </div>
        </div>
        <div className='flex gap-[1.6rem]'>
          <Button variant='light' type='reset' onClick={handleResetQuery}>
            초기화
          </Button>
          <Button variant='dark'>검색</Button>
        </div>
      </form>
      <section className='mt-[6.4rem] grid grid-cols-3 gap-x-[2.4rem] gap-y-[4.8rem]'>
        {(problemList || []).map((problem, index) => (
          <ProblemCard key={index} onClick={() => handleClickCard(problem.problemId)}>
            <ProblemCard.TextSection>
              <ProblemCard.Title title='문제 제목' />
              <ProblemCard.Info label='문제 번호' content={problem.problemId} />
              <ProblemCard.Info label='문제 연도' content='2021학년도 고1 3월 학력평가' />
              <ProblemCard.Info label='코멘트' content={problem.memo} />
            </ProblemCard.TextSection>

            <ProblemCard.ButtonSection>
              <IconButton
                variant='delete'
                onClick={(e) => handleClickDelete(e, problem.problemId)}
              />
            </ProblemCard.ButtonSection>

            <ProblemCard.CardImage src={problem.mainProblemImageUrl} height={'34.4rem'} />

            <ProblemCard.TagSection>
              {(problem.conceptTagResponses || []).map((tag) => {
                return <Tag key={tag.id} label={tag.name} />;
              })}
            </ProblemCard.TagSection>
          </ProblemCard>
        ))}
      </section>
      <FloatingButton>
        <Link to='/problem/register' className='flex h-full w-full items-center justify-center'>
          새로운 문항 등록하기
        </Link>
      </FloatingButton>
    </>
  );
}
