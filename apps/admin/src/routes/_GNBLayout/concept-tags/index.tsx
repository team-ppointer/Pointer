import { Button, Header, Input } from '@components';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { Divider } from '@repo/pointer-design-system/components';

export const Route = createFileRoute('/_GNBLayout/concept-tags/')({
  component: RouteComponent,
});

function RouteComponent() {
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
    </>
  );
}
