import { components } from '@schema';

type QnaListContentProps = {
  data: components['schemas']['QnAGroupItem'];
};

const QnaListContent = ({ data }: QnaListContentProps) => {
  return (
    <div className='flex w-full flex-col items-start justify-start gap-[1.7rem]'>
      <p className='text-main font-medium-14'>{data?.weekName}</p>
      <div className='flex w-full flex-col items-start justify-start gap-[2.6rem]'>
        {data?.data?.map((item) => (
          <div
            key={item.id}
            className='flex w-full flex-row items-center justify-start gap-[0.8rem]'>
            <p className='font-medium-16 text-black'>{item.title}</p>
            <div className='bg-main flex h-[2rem] w-[2rem] items-center justify-center rounded-full text-white'>
              {data.order}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QnaListContent;
