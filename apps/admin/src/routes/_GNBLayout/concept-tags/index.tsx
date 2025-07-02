import { useState } from 'react';
import { Button, FloatingButton, Header, Input } from '@components';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { Divider } from '@repo/pointer-design-system/components';
import { IcPencil } from '@svg';

import { ConceptTagCard } from '@/components/conceptTags';

export const Route = createFileRoute('/_GNBLayout/concept-tags/')({
  component: RouteComponent,
});

const OPTIONS = ['React', 'Vue', 'Svelte', 'Angular'];

function RouteComponent() {
  const [selectedTag, setSelectedTag] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTag((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };
  const { register, handleSubmit, reset } = useForm<{
    query: string;
  }>();

  const handleClickSearch = (data: { query: string }) => {
    // Handle search logic here
  };

  return (
    <>
      <Header title='세트 목록' />
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
          <Button sizeType='fit' variant='light'>
            전체 선택 해제
          </Button>
          <Button sizeType='fit' variant='dark'>
            선택 태그 삭제
          </Button>
        </div>
      </div>

      <section className='flex flex-col gap-[4.8rem]'>
        <article>
          <div className='mb-[4rem] flex items-center gap-[1.2rem]'>
            <h4 className='font-bold-24 text-black'>지수 로그 그래프</h4>
            <IcPencil className='cursor-pointer' width={24} height={24} onClick={() => {}} />
          </div>
          <div className='grid grid-cols-3 gap-[4rem]'>
            {OPTIONS.map((name) => {
              const isChecked = selectedTag.includes(name);
              return (
                <ConceptTagCard
                  key={name}
                  name={name}
                  isChecked={isChecked}
                  toggleTag={toggleTag}
                />
              );
            })}
          </div>
        </article>
        <article>
          <div className='mb-[4rem] flex items-center gap-[1.2rem]'>
            <h4 className='font-bold-24 text-black'>지수 로그 그래프</h4>
            <IcPencil className='cursor-pointer' width={24} height={24} onClick={() => {}} />
          </div>
          <div className='grid grid-cols-3 gap-[4rem]'>
            {OPTIONS.map((name) => {
              const isChecked = selectedTag.includes(name);
              return (
                <ConceptTagCard
                  key={name}
                  name={name}
                  isChecked={isChecked}
                  toggleTag={toggleTag}
                />
              );
            })}
          </div>
        </article>
      </section>

      <FloatingButton onClick={() => {}}>새로운 개념 태그 등록하기</FloatingButton>
    </>
  );
}
