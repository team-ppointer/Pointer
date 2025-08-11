import { useState } from 'react';
import { ComponentWithLabel, SectionCard, Button } from '@components';
import { UseFormSetValue } from 'react-hook-form';
import { components } from '@schema';
import EditorModal from '@repo/pointer-editor/EditorModal';

type ProblemUpdateRequest = components['schemas']['ProblemUpdateRequest'];
type ProblemInfoResp = components['schemas']['ProblemInfoResp'];
type ContentBlockUpdateRequest = components['schemas']['ContentBlockUpdateRequest'];

interface TipSectionProps {
  setValue: UseFormSetValue<ProblemUpdateRequest>;
  fetchedProblemData?: ProblemInfoResp;
}

export const TipSection = ({ setValue, fetchedProblemData }: TipSectionProps) => {
  const [isReadingTipModalOpen, setIsReadingTipModalOpen] = useState(false);
  const [isOneStepMoreModalOpen, setIsOneStepMoreModalOpen] = useState(false);

  const [tempReadingTipBlocks, setTempReadingTipBlocks] = useState<unknown[] | null>(
    fetchedProblemData?.readingTipContent?.blocks || null
  );
  const [tempOneStepMoreBlocks, setTempOneStepMoreBlocks] = useState<unknown[] | null>(
    fetchedProblemData?.oneStepMoreContent?.blocks || null
  );

  const handleOpenReadingTipModal = () => {
    setIsReadingTipModalOpen(true);
  };

  const handleCloseReadingTipModal = () => {
    setIsReadingTipModalOpen(false);
  };

  const handleOpenOneStepMoreModal = () => {
    setIsOneStepMoreModalOpen(true);
  };

  const handleCloseOneStepMoreModal = () => {
    setIsOneStepMoreModalOpen(false);
  };

  const formatBlocks = (blocks: unknown[]): ContentBlockUpdateRequest[] => {
    return blocks.map((block, index) => {
      const blockData = block as {
        // id?: number;
        type?: 'TEXT' | 'IMAGE';
        data?: string;
        content?: string;
      };

      return {
        // id: blockData.id || 0,
        rank: index,
        type: blockData.type,
        data: blockData.data || blockData.content,
      };
    });
  };

  const handleSaveReadingTip = (blocks: unknown[]) => {
    const formattedBlocks = formatBlocks(blocks);
    setValue('readingTipContent.blocks', formattedBlocks);
    setTempReadingTipBlocks(blocks); // 임시 상태에 원본 블록 저장
    console.log('Updated readingTipContent blocks:', formattedBlocks);
    setIsReadingTipModalOpen(false);
  };

  const handleSaveOneStepMore = (blocks: unknown[]) => {
    const formattedBlocks = formatBlocks(blocks);
    setValue('oneStepMoreContent.blocks', formattedBlocks);
    setTempOneStepMoreBlocks(blocks); // 임시 상태에 원본 블록 저장
    console.log('Updated oneStepMoreContent blocks:', formattedBlocks);
    setIsOneStepMoreModalOpen(false);
  };

  return (
    <SectionCard>
      <h6 className='font-bold-32 text-black'>TIP</h6>

      <div className='grid grid-cols-2 gap-1200'>
        <div>
          <ComponentWithLabel label='문제를 읽어내려갈 때' labelWidth='15.4rem' direction='column'>
            <Button
              type='button'
              variant={tempReadingTipBlocks && tempReadingTipBlocks?.length > 0 ? 'dark' : 'light'}
              sizeType='full'
              onClick={handleOpenReadingTipModal}>
              {tempReadingTipBlocks && tempReadingTipBlocks?.length > 0
                ? '입력 확인 및 수정하기'
                : '입력 바로가기'}
            </Button>
          </ComponentWithLabel>
        </div>
        <div>
          <ComponentWithLabel label='한 걸음 더' labelWidth='15.4rem' direction='column'>
            <Button
              type='button'
              variant={
                tempOneStepMoreBlocks && tempOneStepMoreBlocks?.length > 0 ? 'dark' : 'light'
              }
              sizeType='full'
              onClick={handleOpenOneStepMoreModal}>
              {tempOneStepMoreBlocks && tempOneStepMoreBlocks?.length > 0
                ? '입력 확인 및 수정하기'
                : '입력 바로가기'}
            </Button>
          </ComponentWithLabel>
        </div>
      </div>

      {/* EditorModal - 문제를 읽어내려갈 때 */}
      {isReadingTipModalOpen && (
        <EditorModal
          blocks={tempReadingTipBlocks || fetchedProblemData?.readingTipContent?.blocks || []}
          onSave={handleSaveReadingTip}
          onClose={handleCloseReadingTipModal}
        />
      )}

      {/* EditorModal - 한 걸음 더 */}
      {isOneStepMoreModalOpen && (
        <EditorModal
          blocks={tempOneStepMoreBlocks || fetchedProblemData?.oneStepMoreContent?.blocks || []}
          onSave={handleSaveOneStepMore}
          onClose={handleCloseOneStepMoreModal}
        />
      )}
    </SectionCard>
  );
};
