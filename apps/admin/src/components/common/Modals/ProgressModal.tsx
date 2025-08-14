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
  const selectedProblem = publishData.data[selectedProblemIndex];

  const getProgressText = (progress: 'DONE' | 'DOING' | 'NONE') => {
    switch (progress) {
      case 'DONE':
        return '완료';
      case 'DOING':
        return '미완';
      case 'NONE':
        return '시작전';
      default:
        return '시작전';
    }
  };

  const getProgressBadgeStyle = (progress: 'DONE' | 'DOING' | 'NONE') => {
    switch (progress) {
      case 'DONE':
        return 'bg-green-100 text-green-800';
      case 'DOING':
        return 'bg-yellow-100 text-yellow-800';
      case 'NONE':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: 'NONE' | 'CORRECT' | 'INCORRECT' | 'SEMI_CORRECT' | undefined) => {
    switch (status) {
      case 'CORRECT':
        return '정답';
      case 'INCORRECT':
        return '오답';
      case 'SEMI_CORRECT':
        return '세모';
      case 'NONE':
        return '시작전';
      default:
        return '시작전';
    }
  };

  const getStatusBadgeStyle = (
    status: 'NONE' | 'CORRECT' | 'INCORRECT' | 'SEMI_CORRECT' | undefined
  ) => {
    switch (status) {
      case 'CORRECT':
        return 'bg-green-100 text-green-800';
      case 'INCORRECT':
        return 'bg-red-100 text-red-800';
      case 'SEMI_CORRECT':
        return 'bg-yellow-100 text-yellow-800';
      case 'NONE':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className='rounded-400 w-[90vw] max-w-[120rem] bg-white p-800'>
      <h2 className='font-bold-24 mb-600 text-black'>{publishData.publishAt} 진행도</h2>
      <div className='grid h-[60dvh] grid-cols-2 gap-600 overflow-y-auto'>
        <div className='bg-lightgray100 rounded-400 flex w-full flex-col p-800'>
          <h2 className='font-bold-20 mb-800 text-black'>숙제 완료도</h2>
          <div className='flex-1 overflow-y-auto'>
            {publishData.data.map((problemGroup, index) => (
              <div
                key={problemGroup.problemId}
                className={`rounded-200 mb-300 cursor-pointer border px-400 py-200 transition-colors ${
                  selectedProblemIndex === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
                onClick={() => setSelectedProblemIndex(index)}>
                <div className='flex w-full items-center justify-between gap-200'>
                  <span className='font-medium-16 text-lightgray500'>{problemGroup.no}</span>
                  <div className='font-medium-16 block flex-1 truncate text-black'>
                    {problemGroup.problem.title}
                  </div>
                  <IconButton variant='modify' />
                  <span
                    className={`font-medium-14 whitespace-nowrap ${getProgressBadgeStyle(
                      problemGroup.progress
                    )}`}>
                    {getProgressText(problemGroup.progress)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-lightgray100 rounded-400 flex w-full flex-col p-800'>
          <h3 className='font-bold-18 mb-600 text-black'>{selectedProblem?.problem.title}</h3>
          <div className='grid w-full grid-cols-2 gap-600'>
            <div className='rounded-400 flex flex-col gap-300 bg-white p-800'>
              <div className='flex items-center justify-between'>
                <h4 className='font-medium-16 text-black'>메인 문제</h4>
                <div
                  className={`font-medium-12 mr-200 rounded-full px-200 py-100 ${getStatusBadgeStyle(
                    selectedProblem?.problem.progress
                  )}`}>
                  {getStatusText(selectedProblem?.problem.progress)}
                </div>
              </div>
              <div className='flex items-center'>
                <img
                  src={
                    selectedProblem?.problem.problemContent.blocks.find(
                      (block) => block.type === 'IMAGE'
                    )?.data ?? '/images/image-placeholder.svg'
                  }
                  alt='문제 이미지'
                  className='w-full object-cover'
                />
              </div>
            </div>
            <div className='rounded-400 flex flex-col gap-300 bg-white p-800'>
              <div className='flex items-center justify-between'>
                <h4 className='font-medium-16 text-black'>새끼 문제</h4>
                <div
                  className={`font-medium-12 mr-200 rounded-full px-200 py-100 ${getStatusBadgeStyle(
                    selectedProblem?.childProblems[0]?.progress
                  )}`}>
                  {getStatusText(selectedProblem?.childProblems[0]?.progress)}
                </div>
              </div>
              <div className='flex items-center'>
                <img
                  src={
                    selectedProblem?.childProblems[0]?.problemContent.blocks.find(
                      (block) => block.type === 'IMAGE'
                    )?.data ?? '/images/image-placeholder.svg'
                  }
                  alt='문제 이미지'
                  className='w-full object-cover'
                />
              </div>
            </div>

            <div className='rounded-400 col-span-2 space-y-400 bg-white p-800'>
              <div className='mb-600'>
                <h4 className='font-medium-16 text-black'>새끼 문제 포인팅</h4>
              </div>

              {selectedProblem?.childProblems && selectedProblem.childProblems.length > 0 ? (
                <div className='space-y-[1.6rem]'>
                  {selectedProblem.childProblems.map((childProblem, index) => (
                    <div key={childProblem.id} className='rounded-200 border border-gray-200 p-400'>
                      <div className='mb-300 flex items-center justify-between'>
                        <span className='font-medium-14 text-gray-800'>
                          새끼 문제 {childProblem.no}
                        </span>
                        <div className='flex items-center'>
                          <div
                            className={`font-medium-12 mr-200 rounded-full px-200 py-100 ${getStatusBadgeStyle(
                              childProblem.progress
                            )}`}>
                            {getStatusText(childProblem.progress)}
                          </div>
                        </div>
                      </div>

                      {childProblem.pointings && childProblem.pointings.length > 0 && (
                        <div className='space-y-200'>
                          {childProblem.pointings.map((pointing) => (
                            <div key={pointing.id} className='bg-lightgray100 rounded-200 p-300'>
                              <div className='flex items-center justify-between'>
                                <span className='font-medium-12 text-gray-600'>
                                  {pointing.isUnderstood ? 'O' : 'X'}
                                </span>
                              </div>
                              <div className='font-medium-12 mt-200 text-gray-800'>
                                Question
                                <br />
                                {pointing.questionContent.blocks.map((block) => {
                                  if (block.type === 'TEXT') {
                                    return block.data;
                                  }
                                  return null;
                                })}
                                <br />
                                Comments
                                <br />
                                {pointing.commentContent.blocks.map((block) => {
                                  if (block.type === 'TEXT') {
                                    return block.data;
                                  }
                                  return null;
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className='flex h-[20rem] items-center justify-center'>
                  <p className='font-medium-14 text-gray-500'>새끼 문제가 없어요.</p>
                </div>
              )}
            </div>
            {selectedProblem?.problem.pointings && selectedProblem.problem.pointings.length > 0 && (
              <div className='rounded-400 col-span-2 space-y-400 bg-white p-800'>
                <div className='mb-600'>
                  <h4 className='font-medium-16 text-black'>메인 문제 포인팅</h4>
                </div>
                {selectedProblem.problem.pointings.map((pointing, index) => (
                  <div key={pointing.id} className='bg-lightgray100 rounded-200 p-300'>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium-12 text-gray-600'>
                        {pointing.isUnderstood ? 'O' : 'X'}
                      </span>
                    </div>
                    <div className='font-medium-12 text-gray-800'>
                      Question <br />
                      {pointing.questionContent.blocks.map((block) => {
                        if (block.type === 'TEXT') {
                          return block.data;
                        }
                        return null;
                      })}
                      <br />
                      Comments <br />
                      {pointing.commentContent.blocks.map((block) => {
                        if (block.type === 'TEXT') {
                          return block.data;
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
