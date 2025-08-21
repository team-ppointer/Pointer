import Link from 'next/link';

import { useGetLatestDiagnosis } from '@/apis/controller/home';
import { IcNext } from '@svg';

const DiagnosisButton = () => {
  const { data } = useGetLatestDiagnosis();
  const latestDiagnosis = data;
  // const latestDiagnosis = {
  //   content:
  //     '본 학생은 특히 삼각함수의 활용에 부족함을 보이고, 이를 개선하기 위해서는 문제를 많이 풀어야한다 어쩌구저쩌구',
  //   createdAt: '2025-08-21T17:25:33.747Z',
  // };

  return (
    <Link
      href='/diagnosis'
      className='relative flex h-full flex-1 flex-col gap-[0.4rem] rounded-[1.6rem] bg-white px-[2.0rem] py-[1.8rem]'>
      <div className='flex w-full items-center justify-between gap-[0.8rem]'>
        <div className='flex items-center gap-[0.8rem]'>
          {/* <IcNotice width={24} height={24} /> */}
          <span className='font-bold-16 text-main'>최근 진단</span>
        </div>
        <IcNext width={24} height={24} className='text-main' />
      </div>
      <div className='flex w-full flex-col gap-[0.4rem]'>
        <span className='font-medium-14 truncate text-black'>
          {latestDiagnosis ? latestDiagnosis.content : '최근 진단이 없어요'}
        </span>
        {latestDiagnosis?.createdAt && (
          <span className='font-medium-12 text-lightgray500'>
            {new Date(latestDiagnosis.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </Link>
  );
};

export default DiagnosisButton;
