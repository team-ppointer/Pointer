import { Button, Header, SearchInput, SectionCard } from '@components';
import { createFileRoute } from '@tanstack/react-router';
import { getProblemSetSearchParamsType } from '@types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/_GNBLayout/problem-set/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [, setSearchQuery] = useState<getProblemSetSearchParamsType>({});
  const { register, handleSubmit, reset } = useForm<getProblemSetSearchParamsType>();

  const handleClickSearch = (data: getProblemSetSearchParamsType) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => Boolean(value))
    );

    const newQuery = { ...filteredData };
    setSearchQuery(newQuery);
  };

  const handleResetQuery = () => {
    reset();
    setSearchQuery({});
  };

  return (
    <>
      <Header title='세트 목록' />
      <form
        className='mt-[4.8rem] flex items-end justify-between'
        onSubmit={handleSubmit(handleClickSearch)}>
        <div className='flex gap-[2.4rem]'>
          <SearchInput
            sizeType='long'
            label='세트 타이틀'
            placeholder='입력해주세요.'
            {...register('problemSetTitle', { required: false })}
          />
          <SearchInput
            sizeType='long'
            label='문항 타이틀'
            placeholder='입력해주세요.'
            {...register('problemTitle', { required: false })}
          />
        </div>
        <div className='flex gap-[1.6rem]'>
          <Button variant='light' type='reset' onClick={handleResetQuery}>
            초기화
          </Button>
          <Button variant='dark'>검색</Button>
        </div>
      </form>
      <div className='mt-[6.4rem] flex flex-col gap-[4.8rem]'>
        <SectionCard>asdf</SectionCard>
      </div>
    </>
  );
}
