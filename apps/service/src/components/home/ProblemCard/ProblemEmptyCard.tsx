interface Props {
  dateString: string;
}

const ProblemEmptyCard = ({ dateString }: Props) => {
  return (
    <article
      className={`bg-lightgray300 flex h-full w-full flex-col justify-between rounded-[16px] p-[2.4rem]`}>
      <div className='flex flex-col items-start gap-[0.8rem]'>
        <p className={`font-medium-16 text-lightgray500`}>{dateString} 문제</p>
        {/* <h3 className={`font-bold-20 text-lightgray500 line-clamp-2 h-[6rem]`}>
          아직 미공개 문제예요
        </h3> */}
      </div>
      {/* <div className='relative'>
        <div className='flex h-[15.7rem] w-full items-center justify-center rounded-[16px] bg-white'>
          <IcSecret width={24} height={24} />
        </div>
        <div
          className={`from-lightgray300 absolute bottom-0 left-0 h-[8.9rem] w-full bg-gradient-to-t to-transparent`}
        />
      </div>
      <div className='flex flex-col gap-[1.2rem]'>
        <p className='font-medium-12 h-[1.8rem] text-center text-black'></p>
        <Button disabled={true}>
          <IcSolve width={24} height={24} />
          문제 풀러 가기
        </Button>
      </div> */}
    </article>
  );
};

export default ProblemEmptyCard;
