import {
  Button,
  FloatingButton,
  IconButton,
  PrevPageButton,
  ProblemCard,
  SearchInput,
  Tag,
  TagSelect,
} from '@components';
import { useSelectTag } from '@hooks';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/problem/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { selectedList, unselectedList, onClickSelectTag, onClickRemoveTag } = useSelectTag();
  return (
    <>
      <header className='flex flex-col gap-[4.8rem]'>
        <PrevPageButton />
        <h1 className='font-bold-32'>문항 목록</h1>
        <form action='' className='flex items-end justify-between'>
          <div className='flex gap-[2.4rem]'>
            <SearchInput label='문항 ID' placeholder='입력해주세요.' />
            <SearchInput label='문항 이름' placeholder='입력해주세요.' />
            <TagSelect
              label='문항 개념 태그'
              selectedList={selectedList}
              unselectedList={unselectedList}
              onClickSelectTag={onClickSelectTag}
              onClickRemoveTag={onClickRemoveTag}
            />
          </div>
          <div className='flex gap-[1.6rem]'>
            <Button variant='light'>초기화</Button>
            <Button variant='dark'>검색</Button>
          </div>
        </form>
      </header>
      <section className='mt-[6.4rem] grid grid-cols-[repeat(auto-fit,minmax(48rem,1fr))] gap-x-[2.4rem] gap-y-[4.8rem]'>
        {Array.from({ length: 10 }).map((_, index) => (
          <ProblemCard key={index}>
            <ProblemCard.TextSection>
              <ProblemCard.Title title='문제 제목' />
              <ProblemCard.Info label='문제 번호' content='00' />
              <ProblemCard.Info label='문제 연도' content='2021학년도 고1 3월 학력평가' />
              <ProblemCard.Info
                label='코멘트'
                content='이래이래 저래저래 이래이래 하는게 좋을 것 같습니다'
              />
            </ProblemCard.TextSection>

            <ProblemCard.ButtonSection>
              <IconButton variant='delete' />
            </ProblemCard.ButtonSection>

            <ProblemCard.CardImage src='' height={'34.4rem'} />

            <ProblemCard.TagSection>
              <Tag label='태그명' />
              <Tag label='태그명' />
            </ProblemCard.TagSection>
          </ProblemCard>
        ))}
      </section>
      <FloatingButton onClick={() => {}}>새로운 문항 등록하기</FloatingButton>
    </>
  );
}
