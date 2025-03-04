import { getConceptTags, getProblemsSearch } from '@apis';
import { Button, Modal, ProblemCard, SearchInput, Tag, TagSelectModal } from '@components';
import { useModal } from '@hooks';
import { components } from '@schema';
import { IcDown } from '@svg';
import { getProblemsSearchParamsType } from '@types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import PulseLoader from 'react-spinners/PulseLoader';

type ProblemSearchGetResponse = components['schemas']['ProblemSearchGetResponse'];

interface ProblemSearchModalProps {
  onClickCard(problem: ProblemSearchGetResponse): void;
}

const ProblemSearchModal = ({ onClickCard }: ProblemSearchModalProps) => {
  const { isOpen, openModal, closeModal } = useModal();

  const [searchQuery, setSearchQuery] = useState<getProblemsSearchParamsType>({});
  const [selectedTagList, setSelectedTagList] = useState<number[]>([]);

  const { register, handleSubmit, reset } = useForm<getProblemsSearchParamsType>();

  const { data: problemList, isLoading } = getProblemsSearch(searchQuery);
  const { data: tagsData } = getConceptTags();
  const allTagList = tagsData?.data || [];
  const tagsNameMap = Object.fromEntries(allTagList.map((tag) => [tag.id, tag.name]));

  const handleClickSearch = (data: getProblemsSearchParamsType) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => Boolean(value))
    );
    setSearchQuery({ ...filteredData, conceptTagIds: selectedTagList });
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
        conceptTagIds: prev.conceptTagIds?.filter((selectedTag) => selectedTag !== tag),
      };
    });
  };

  const handleChangeTagList = (tagList: number[]) => {
    setSelectedTagList(tagList);
    setSearchQuery((prev) => {
      return {
        ...prev,
        conceptTagIds: tagList,
      };
    });
  };

  return (
    <>
      <div className='h-[90dvh] w-[90dvw] px-[6.4rem] py-[4.8rem]'>
        <h2 className='font-bold-24 text-black'>문항 검색</h2>
        <form
          className='mt-[3.2rem] flex items-end justify-between'
          onSubmit={handleSubmit(handleClickSearch)}>
          <div className='flex gap-[2.4rem]'>
            <SearchInput
              label='문항 ID'
              placeholder='입력해주세요.'
              {...register('problemCustomId', { required: false })}
            />
            <SearchInput
              label='문항 타이틀'
              sizeType='long'
              placeholder='입력해주세요.'
              {...register('title', { required: false })}
            />
            <div className='flex flex-col gap-[1.2rem]'>
              <span className='font-medium-18 text-black'>문항 개념 태그</span>
              <div
                className='border-lightgray500 flex h-[5.6rem] w-[42.4rem] cursor-pointer items-center justify-between rounded-[16px] border bg-white px-[1.6rem] py-[0.8rem]'
                onClick={() => {
                  openModal();
                }}>
                <span className='text-lightgray500 font-medium-18'>선택해주세요</span>
                <IcDown width={24} height={24} />
              </div>
            </div>
          </div>
          <div className='flex gap-[1.6rem]'>
            <Button variant='light' type='reset' onClick={handleResetQuery}>
              초기화
            </Button>
            <Button variant='dark'>검색</Button>
          </div>
        </form>
        {selectedTagList.length > 0 && (
          <div className='mt-[4.8rem] flex flex-wrap gap-[0.8rem]'>
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
          <div className='mt-[6.4rem] flex w-full items-center justify-center'>
            <PulseLoader color='#222324' aria-label='Loading Spinner' />
          </div>
        ) : (
          <section className='mt-[6.4rem] grid grid-cols-3 gap-x-[2.4rem] gap-y-[4.8rem] pb-[4.8rem]'>
            {problemList?.data.map((problem) => {
              const { problemCustomId, problemTitle, memo, mainProblemImageUrl, tagNames } =
                problem;
              return (
                <div
                  key={problem.problemId}
                  className='border-lightgray500 rounded-[16px] border'
                  onClick={() => onClickCard(problem)}>
                  <ProblemCard>
                    <ProblemCard.TextSection>
                      <ProblemCard.Info label='문항 ID' content={problemCustomId} />
                      <ProblemCard.Info label='문항 타이틀' content={problemTitle} />
                      <ProblemCard.Info label='문항 메모' content={memo} />
                    </ProblemCard.TextSection>

                    <ProblemCard.CardImage src={mainProblemImageUrl} height={'34.4rem'} />

                    <ProblemCard.TagSection>
                      {(tagNames || []).map((tag, tagIndex) => {
                        return <Tag key={`${tag}-${tagIndex}`} label={tag} />;
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
