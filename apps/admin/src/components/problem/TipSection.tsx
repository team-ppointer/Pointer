import { ComponentWithLabel, SectionCard, Button } from '@components';

export const TipSection = () => {
  return (
    <SectionCard>
      <h6 className='font-bold-32 text-black'>TIP</h6>

      <div className='grid grid-cols-2 gap-[4.8rem]'>
        <div>
          <ComponentWithLabel label='포인팅 질문' labelWidth='15.4rem' direction='column'>
            <Button type='button' variant='light' sizeType='full' onClick={() => {}}>
              입력 바로가기
            </Button>
          </ComponentWithLabel>
        </div>
        <div>
          <ComponentWithLabel label='포인팅 처방' labelWidth='15.4rem' direction='column'>
            <Button type='button' variant='light' sizeType='full' onClick={() => {}}>
              입력 바로가기
            </Button>
          </ComponentWithLabel>
        </div>
      </div>
    </SectionCard>
  );
};
