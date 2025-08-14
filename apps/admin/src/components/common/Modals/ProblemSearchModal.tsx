import { getConcept, getProblemsSearch } from '@apis';
import { Button, Modal, ProblemCard, SearchInput, Tag, TagSelectModal } from '@components';
import { useModal } from '@hooks';
import { components } from '@schema';
import { IcDown } from '@svg';
import { GetProblemsSearchParams } from '@types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import PulseLoader from 'react-spinners/PulseLoader';

type ProblemMetaResp = components['schemas']['ProblemMetaResp'];

interface ProblemSearchModalProps {
  onClickCard(problem: ProblemMetaResp): void;
}

const ProblemSearchModal = ({ onClickCard }: ProblemSearchModalProps) => {
  const { isOpen, openModal, closeModal } = useModal();

  const [searchQuery, setSearchQuery] = useState<GetProblemsSearchParams>({});
  const [selectedTagList, setSelectedTagList] = useState<number[]>([]);

  const { register, handleSubmit, reset } = useForm<GetProblemsSearchParams>();

  const { data: problemList, isLoading } = getProblemsSearch(searchQuery);
  const { data: tagsData } = getConcept();
  const allTagList = tagsData?.data || [];
  const tagsNameMap = Object.fromEntries(allTagList.map((tag) => [tag.id, tag.name]));

  const handleClickSearch = (data: GetProblemsSearchParams) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => Boolean(value))
    );
    setSearchQuery({ ...filteredData, concepts: selectedTagList });
  };

  const handleResetQuery = () => {
    reset();
    setSelectedTagList([]);
    setSearchQuery({});
  };

  const handleRemoveTag = (tag: number) => {
    setSelectedTagList((prev) => prev.filter((selectedTag) => selectedTag !== tag));
    setSearchQuery((prev) => {
      return {
        ...prev,
        concepts: prev.concepts?.filter((selectedTag: number) => selectedTag !== tag),
      };
    });
  };

  const handleChangeTagList = (tagList: number[]) => {
    setSelectedTagList(tagList);
    setSearchQuery((prev) => {
      return {
        ...prev,
        concepts: tagList,
      };
    });
  };

  return (
    <>
      <div className='h-[90dvh] w-[90dvw] px-1600 py-1200'>
        <h2 className='font-bold-24 text-black'>문항 검색</h2>
        <form
          className='mt-800 flex items-end justify-between'
          onSubmit={handleSubmit(handleClickSearch)}>
          <div className='flex gap-600'>
            <SearchInput
              label='문항 ID'
              placeholder='입력해주세요.'
              {...register('customId', { required: false })}
            />
            <SearchInput
              label='문항 타이틀'
              sizeType='long'
              placeholder='입력해주세요.'
              {...register('title', { required: false })}
            />
            <div className='flex flex-col gap-300'>
              <span className='font-medium-18 text-black'>문항 개념 태그</span>
              <div
                className='border-lightgray500 rounded-400 flex h-[5.6rem] w-[42.4rem] cursor-pointer items-center justify-between border bg-white px-400 py-200'
                onClick={() => {
                  openModal();
                }}>
                <span className='text-lightgray500 font-medium-18'>선택해주세요</span>
                <IcDown width={24} height={24} />
              </div>
            </div>
          </div>
          <div className='flex gap-400'>
            <Button variant='light' type='reset' onClick={handleResetQuery}>
              초기화
            </Button>
            <Button variant='dark'>검색</Button>
          </div>
        </form>
        {selectedTagList.length > 0 && (
          <div className='mt-1200 flex flex-wrap gap-200'>
            {selectedTagList.map((tag) => (
              <Tag
                key={tag}
                label={tagsNameMap[tag] || ''}
                removable
                color='dark'
                onClick={() => handleRemoveTag(tag)}
              />
            ))}
          </div>
        )}

        {isLoading ? (
          <div className='mt-1600 flex w-full items-center justify-center'>
            <PulseLoader color='#222324' aria-label='Loading Spinner' />
          </div>
        ) : (
          <section className='mt-1600 grid grid-cols-3 gap-x-600 gap-y-1200 pb-1200'>
            {problemList?.data.map((problem) => {
              const { customId, title, memo, concepts } = problem;
              const mainProblemImageUrl = problem.problemContent?.blocks?.find(
                (block) => block.type === 'IMAGE'
              )?.data;
              return (
                <div
                  key={problem.id}
                  className='border-lightgray500 rounded-400 border'
                  onClick={() => onClickCard(problem)}>
                  <ProblemCard>
                    <ProblemCard.TextSection>
                      <ProblemCard.Info label='문항 ID' content={customId} />
                      <ProblemCard.Info label='문항 타이틀' content={title} />
                      <ProblemCard.Info label='문항 메모' content={memo} />
                    </ProblemCard.TextSection>

                    <ProblemCard.CardImage src={mainProblemImageUrl ?? ''} height={'34.4rem'} />

                    <ProblemCard.TagSection>
                      {(concepts || []).map((concept, conceptIndex) => {
                        return <Tag key={`${concept.name}-${conceptIndex}`} label={concept.name} />;
                      })}
                    </ProblemCard.TagSection>
                  </ProblemCard>
                </div>
              );
            })}
          </section>
        )}
      </div>
      <Modal isOpen={isOpen} onClose={closeModal}>
        <TagSelectModal
          onClose={closeModal}
          selectedTagList={selectedTagList}
          handleChangeTagList={handleChangeTagList}
        />
      </Modal>
    </>
  );
};

export default ProblemSearchModal;
