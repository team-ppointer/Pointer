import ProblemViewer from '@repo/pointer-editor/*';

const QnaDetailContent = () => {
  return (
    <div className='flex w-full flex-col gap-[1.2rem]'>
      <div className='flex w-full items-center justify-end'>
        <p className='text-sub1 font-medium-12'>2025/03/11</p>
      </div>
      <Divider />
      <div className='flex w-full flex-col items-start justify-start gap-[0.8rem]'>
        <p className='text-sub1 font-medium-12'>해당 페이지</p>
        <p className='font-medium-16 text-white'>메인문제</p>
        <ProblemViewer />
      </div>
      <Divider />
      <p className='text-main font-medium-14'>질문 내용</p>
      <span className='font-medium-16 text-black'>
        지수함수의 그래프를 그릴 때, x축과 y축의 교차점이 0이 아닌 다른 값으로 설정되어야 하는
        이유는 무엇인가요?
      </span>
    </div>
  );
};
export default QnaDetailContent;

const Divider = () => {
  return <div className='bg-sub1 h-[0.2rem] w-full' />;
};
