import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@components';
import { trackEvent } from '@utils';
import { IcSolve } from '@svg';

interface Props {
  publishId: number;
  dateString: string;
  title: string;
  image: string;
  solvedCount: number;
}

const ProblemCard = ({ publishId, dateString, title, image, solvedCount }: Props) => {
  const router = useRouter();

  const handleClickProblem = () => {
    trackEvent('home_carousel_problem_card_click', {
      publishId,
    });
    router.push(`/problem/list/${publishId}`);
  };

  return (
    <article
      className={`bg-sub2 flex h-full w-full flex-col justify-between rounded-[16px] p-[2.4rem]`}>
      <div className='flex flex-col items-start gap-[0.8rem]'>
        <p className={`font-medium-16 text-black`}>{dateString} 문제</p>
        <h3 className={`font-bold-20 text-main line-clamp-2 h-[6rem]`}>{title}</h3>
      </div>
      <div className='relative h-[15.7rem] overflow-hidden rounded-[1.6rem] bg-white p-[0.8rem]'>
        <Image
          src={image}
          alt='문제 이미지'
          className='w-full object-contain object-top'
          width={264}
          height={157}
        />

        <div
          className={`from-sub2 absolute bottom-0 left-0 h-[8.9rem] w-full bg-gradient-to-t to-transparent`}
        />
      </div>
      <div className='flex flex-col gap-[1.2rem]'>
        <p className='font-medium-12 h-[1.8rem] text-center text-black'>
          <span>
            <strong className='text-main'>{solvedCount}명</strong>이 문제를 풀었어요!
          </span>
        </p>
        <Button onClick={handleClickProblem}>
          <IcSolve width={24} height={24} />
          문제 풀러 가기
        </Button>
      </div>
    </article>
  );
};

export default ProblemCard;
