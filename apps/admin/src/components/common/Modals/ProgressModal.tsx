import { useState } from 'react';
import { components } from '@schema';
import { IcCloseCircle } from '@svg';
import { Button, IconButton } from '@components';

interface ProgressModalProps {
  publishData: components['schemas']['PublishResp'];
  onClose: () => void;
}

const ProgressModal = ({ publishData, onClose }: ProgressModalProps) => {
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  const [selectedChildProblemIndex, setSelectedChildProblemIndex] = useState(0);
  const [selectedChildPointingIndex, setSelectedChildPointingIndex] = useState(0);
  const [selectedMainPointingIndex, setSelectedMainPointingIndex] = useState(0);
  const selectedProblem = publishData.data[selectedProblemIndex];

  const getProgressText = (progress: 'DONE' | 'DOING' | 'NONE') => {
    switch (progress) {
      case 'DONE':
        return '완료';
      case 'DOING':
        return '미완';
      case 'NONE':
        return '시작 전';
      default:
        return '시작 전';
    }
  };

  const getProgressBadgeStyle = (progress: 'DONE' | 'DOING' | 'NONE') => {
    switch (progress) {
      case 'DONE':
        return 'text-green';
      case 'DOING':
        return 'text-yellow';
      case 'NONE':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: 'NONE' | 'CORRECT' | 'INCORRECT' | 'SEMI_CORRECT' | undefined) => {
    switch (status) {
      case 'CORRECT':
        return 'O';
      case 'INCORRECT':
        return 'X';
      case 'SEMI_CORRECT':
        return '△';
      case 'NONE':
        return '-';
      default:
        return '-';
    }
  };

  const getStatusBadgeStyle = (
    status: 'NONE' | 'CORRECT' | 'INCORRECT' | 'SEMI_CORRECT' | undefined
  ) => {
    switch (status) {
      case 'CORRECT':
        return 'text-green';
      case 'INCORRECT':
        return 'text-red';
      case 'SEMI_CORRECT':
        return 'text-yellow';
      case 'NONE':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className='rounded-400 w-[90vw] max-w-[120rem] bg-white p-800'>
      <h2 className='font-bold-24 mb-600 text-black'>{publishData.publishAt} 진행도</h2>
      <div className='grid h-[60dvh] grid-cols-2 gap-600 overflow-y-auto'>
        <div className='bg-lightgray100 flex w-full flex-col rounded-[0.8rem] px-[2.4rem] py-[2rem]'>
          <h2 className='font-16b-heading mb-[2rem] text-black'>숙제 완료도</h2>
          <div className='flex-1 overflow-y-auto'>
            {publishData.data.map((problemGroup, index) => (
              <div
                key={problemGroup.problemId}
                className={`rounded-200 mb-200 cursor-pointer border bg-white px-[1.2rem] py-200 transition-colors ${
                  selectedProblemIndex === index
                    ? 'border-lightgray500'
                    : 'border-transparent hover:bg-gray-50'
                }`}
                onClick={() => setSelectedProblemIndex(index)}>
                <div className='flex w-full items-center justify-between gap-200'>
                  <span className='font-12m-caption text-lightgray500 bg-lightgray200 rounded-[0.4rem] px-[0.4rem] py-[0.2rem]'>
                    {problemGroup.no}
                  </span>
                  <div className='font-14m-body block flex-1 truncate text-black'>
                    {problemGroup.problem.title}
                  </div>
                  <span
                    className={`font-14m-body whitespace-nowrap ${getProgressBadgeStyle(
                      problemGroup.progress
                    )}`}>
                    {getProgressText(problemGroup.progress)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-lightgray100 flex w-full flex-col rounded-[0.8rem] px-[2.4rem] py-[2rem]'>
          <h3 className='font-16b-heading mb-600 text-black'>{selectedProblem?.problem.title}</h3>
          <div className='flex flex-col gap-200'>
            <div className='rounded-200 flex flex-col gap-300 bg-white p-400'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-300'>
                  <h4 className='font-bold-16 text-black'>새끼 문제</h4>
                  <div className='flex items-center gap-100'>
                    {selectedProblem?.childProblems.map((childProblem, index) => (
                      <button
                        key={childProblem.id}
                        onClick={() => setSelectedChildProblemIndex(index)}
                        className={`font-medium-14 h-[2.4rem] w-[2.4rem] rounded-[0.4rem] ${
                          selectedChildProblemIndex === index
                            ? 'bg-midgray200 text-white'
                            : 'bg-lightgray300 text-lightgray500'
                        }`}>
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  className={`font-18m-body mr-200 rounded-full px-200 py-100 ${getStatusBadgeStyle(
                    selectedProblem?.childProblems[selectedChildProblemIndex]?.progress
                  )}`}>
                  {getStatusText(
                    selectedProblem?.childProblems[selectedChildProblemIndex]?.progress
                  )}
                </div>
              </div>
              {selectedProblem?.childProblems && selectedProblem?.childProblems.length > 0 ? (
                <p className='font-medium-14 line-clamp-2 text-black'>
                  {selectedProblem?.childProblems[
                    selectedChildProblemIndex
                  ]?.problemContent.blocks.map((block) => {
                    if (block.type === 'TEXT') {
                      return block.data;
                    }
                    return null;
                  })}
                </p>
              ) : (
                <p className='font-medium-14 text-lightgray500 text-center'>새끼 문제가 없어요</p>
              )}
            </div>

            <div className='rounded-200 flex flex-col gap-300 bg-white p-400'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-300'>
                  <h4 className='font-bold-16 text-black'>새끼 문제 포인팅</h4>
                  <div className='flex items-center gap-100'>
                    {selectedProblem?.childProblems[selectedChildProblemIndex]?.pointings.map(
                      (pointing, index) => (
                        <button
                          key={pointing.id}
                          onClick={() => setSelectedChildPointingIndex(index)}
                          className={`font-medium-14 h-[2.4rem] w-[2.4rem] rounded-[0.4rem] ${
                            selectedChildPointingIndex === index
                              ? 'bg-midgray200 text-white'
                              : 'bg-lightgray300 text-lightgray500'
                          }`}>
                          {index + 1}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
              {selectedProblem?.childProblems && selectedProblem?.childProblems.length > 0 ? (
                <div className='flex items-center justify-between'>
                  <p className='font-medium-14 line-clamp-2 text-black'>
                    {selectedProblem?.childProblems[selectedChildProblemIndex]?.pointings[
                      selectedChildPointingIndex
                    ]?.questionContent.blocks.map((block) => {
                      if (block.type === 'TEXT') {
                        return block.data;
                      }
                      return null;
                    })}
                  </p>
                  <div
                    className={`font-18m-body mr-200 rounded-full px-200 py-100 ${
                      selectedProblem?.childProblems[selectedChildProblemIndex]?.pointings[
                        selectedChildPointingIndex
                      ]?.isUnderstood
                        ? 'text-green'
                        : 'text-red'
                    }`}>
                    {selectedProblem?.childProblems[selectedChildProblemIndex]?.pointings[
                      selectedChildPointingIndex
                    ]?.isUnderstood
                      ? 'O'
                      : 'X'}
                  </div>
                </div>
              ) : (
                <p className='font-medium-14 text-lightgray500 text-center'>새끼 문제가 없어요</p>
              )}
            </div>

            <hr className='border-lightgray300' />

            <div className='rounded-200 flex flex-col gap-300 bg-white p-400'>
              <div className='flex items-center justify-between'>
                <h4 className='font-bold-16 text-black'>메인 문제</h4>
                <div
                  className={`font-18m-body mr-200 rounded-full px-200 py-100 ${getStatusBadgeStyle(
                    selectedProblem?.problem.progress
                  )}`}>
                  {getStatusText(selectedProblem?.problem.progress)}
                </div>
              </div>
              <p className='font-medium-14 line-clamp-2 text-black'>
                {selectedProblem?.problem.problemContent.blocks.map((block) => {
                  if (block.type === 'TEXT') {
                    return block.data;
                  }
                  return null;
                })}
              </p>
            </div>

            <div className='rounded-200 flex flex-col gap-300 bg-white p-400'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-300'>
                  <h4 className='font-bold-16 text-black'>메인 문제 포인팅</h4>
                  <div className='flex items-center gap-100'>
                    {selectedProblem?.problem.pointings.map((pointing, index) => (
                      <button
                        key={pointing.id}
                        onClick={() => setSelectedMainPointingIndex(index)}
                        className={`font-medium-14 h-[2.4rem] w-[2.4rem] rounded-[0.4rem] ${
                          selectedMainPointingIndex === index
                            ? 'bg-midgray200 text-white'
                            : 'bg-lightgray300 text-lightgray500'
                        }`}>
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <p className='font-medium-14 line-clamp-2 text-black'>
                  {selectedProblem?.problem.pointings[
                    selectedMainPointingIndex
                  ]?.questionContent.blocks.map((block) => {
                    if (block.type === 'TEXT') {
                      return block.data;
                    }
                    return null;
                  })}
                </p>
                <div
                  className={`font-18m-body mr-200 rounded-full px-200 py-100 ${
                    selectedProblem?.problem.pointings[selectedMainPointingIndex]?.isUnderstood
                      ? 'text-green'
                      : 'text-red'
                  }`}>
                  {selectedProblem?.problem.pointings[selectedMainPointingIndex]?.isUnderstood
                    ? 'O'
                    : 'X'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='mt-600 flex justify-end pt-600'>
        <Button variant='dark' onClick={onClose}>
          닫기
        </Button>
      </div>
    </div>
  );
};

export default ProgressModal;
