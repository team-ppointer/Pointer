import { useState } from 'react';
import { Button, ComponentWithLabel, Modal, Tag, TagSelectModal } from '@components';
import { components } from '@schema';
import { Control, UseFormSetValue, useWatch } from 'react-hook-form';
import { useModal } from '@hooks';
import { postOcr } from '@apis';
import { getEmptyContentString } from '@utils';
import { Plus, Trash2 } from 'lucide-react';

import { EditorField } from '@/components/problem';

type ProblemUpdateRequest = components['schemas']['ProblemUpdateRequest'];
type PointingUpdateRequest = components['schemas']['PointingUpdateRequest'];

interface ProblemPointingInputProps {
  control: Control<ProblemUpdateRequest>;
  setValue: UseFormSetValue<ProblemUpdateRequest>;
  tagsNameMap?: Record<number, string>;
}

export const ProblemPointingInput = ({
  control,
  setValue,
  tagsNameMap = {},
}: ProblemPointingInputProps) => {
  const ocrMutation = postOcr();
  const {
    isOpen: isPointingTagModalOpen,
    openModal: openPointingTagModal,
    closeModal: closePointingTagModal,
  } = useModal();
  const [currentPointingIndex, setCurrentPointingIndex] = useState<number | null>(null);
  const [currentPointingTagList, setCurrentPointingTagList] = useState<number[]>([]);

  const watchedPointings = useWatch({
    control,
    name: 'pointings',
  }) as PointingUpdateRequest[] | undefined;

  const pointingList = Array.isArray(watchedPointings) ? watchedPointings : [];

  const handleAddPointing = () => {
    const current = pointingList.filter(Boolean);
    const newPointing: PointingUpdateRequest = {
      no: current.length + 1,
      questionContent: getEmptyContentString(),
      commentContent: getEmptyContentString(),
      concepts: [],
    };
    setValue('pointings', [...current, newPointing], { shouldDirty: true, shouldValidate: true });
  };

  const handleDeletePointing = (index: number) => {
    const current = pointingList.filter(Boolean);
    const updated = current
      .filter((_, i) => i !== index)
      .map((pointing, i) => ({
        ...pointing,
        no: i + 1,
      }));
    setValue('pointings', updated, { shouldDirty: true, shouldValidate: true });
  };

  const handleOpenPointingTagModal = (index: number, concepts: number[]) => {
    setCurrentPointingIndex(index);
    setCurrentPointingTagList(concepts || []);
    openPointingTagModal();
  };

  const handleChangePointingTagList = (tagList: number[]) => {
    if (currentPointingIndex === null) return;
    setValue(`pointings.${currentPointingIndex}.concepts`, [...tagList], {
      shouldDirty: true,
      shouldValidate: true,
    });
    setCurrentPointingTagList(tagList);
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        {pointingList.map((pointing, index) => {
          const concepts = pointing?.concepts ?? [];
          return (
            <div
              key={`${pointing?.id ?? 'new'}-${index}`}
              className='overflow-hidden rounded-2xl border border-gray-200 bg-white'>
              <div className='border-b border-gray-100 bg-gray-50 px-6 py-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <h4 className='text-lg font-bold text-gray-900'>{index + 1}번 포인팅</h4>
                  </div>
                  <Button
                    sizeType='sm'
                    variant='danger'
                    onClick={() => handleDeletePointing(index)}>
                    <Trash2 className='h-3.5 w-3.5' />
                    삭제
                  </Button>
                </div>
              </div>
              <div className='space-y-6 p-6'>
                <ComponentWithLabel label='개념 태그'>
                  <div className='flex flex-wrap gap-2'>
                    {concepts.map((tag) => (
                      <Tag
                        key={tag}
                        label={tagsNameMap[tag] ?? ''}
                        removable
                        color='dark'
                        onClick={() =>
                          setValue(
                            `pointings.${index}.concepts`,
                            concepts.filter((t) => t !== tag),
                            { shouldDirty: true, shouldValidate: true }
                          )
                        }
                      />
                    ))}
                    <Tag
                      label='태그 추가하기'
                      color='dashed'
                      icon={Plus}
                      onClick={() => handleOpenPointingTagModal(index, concepts)}
                    />
                  </div>
                </ComponentWithLabel>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <ComponentWithLabel label='질문' labelWidth='4rem' direction='column'>
                    <div className='overflow-hidden rounded-xl border border-gray-200'>
                      <EditorField
                        control={control}
                        name={`pointings.${index}.questionContent`}
                        ocrApiCall={ocrMutation.mutateAsync}
                      />
                    </div>
                  </ComponentWithLabel>
                  <ComponentWithLabel label='처방' labelWidth='4rem' direction='column'>
                    <div className='overflow-hidden rounded-xl border border-gray-200'>
                      <EditorField
                        control={control}
                        name={`pointings.${index}.commentContent`}
                        ocrApiCall={ocrMutation.mutateAsync}
                      />
                    </div>
                  </ComponentWithLabel>
                </div>
              </div>
            </div>
          );
        })}

        <button
          type='button'
          onClick={handleAddPointing}
          className='group flex w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-8 py-4 text-base font-semibold text-gray-600 transition-all duration-200 hover:border-gray-400 hover:bg-gray-100'>
          <Plus className='h-5 w-5' />
          포인팅 추가하기
        </button>
      </div>

      <Modal isOpen={isPointingTagModalOpen} onClose={closePointingTagModal}>
        <TagSelectModal
          onClose={closePointingTagModal}
          selectedTagList={currentPointingTagList}
          handleChangeTagList={handleChangePointingTagList}
        />
      </Modal>
    </div>
  );
};
