'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PulseLoader from 'react-spinners/PulseLoader';

import { QnaAskContent } from '@/components/qna';
import { Button, Header } from '@components';
import { components } from '@schema';
import {
  useGetChildProblemById,
  postQna,
  useGetProblemById,
  getFileUploadUrl,
  uploadFileToS3,
} from '@apis';
import { showToast, getQnaTitle } from '@utils';
import QnaContent from '@/components/qna/QnaContent';

const Page = () => {
  const [isFilled, setIsFilled] = useState(false);
  const [question, setQuestion] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  const publishId = Number(searchParams.get('publishId')) || -1;
  const problemId = Number(searchParams.get('problemId')) || undefined;
  const childProblemId = Number(searchParams.get('childProblemId')) || undefined;
  const pointingId = Number(searchParams.get('pointingId')) || undefined;

  const type =
    (searchParams.get('type') as components['schemas']['QnACreateRequest']['type']) ??
    'PROBLEM_CONTENT';

  const title = getQnaTitle(type);

  let parentQuery = undefined;
  let childQuery = undefined;
  if(type.includes('CHILD')) {
    childQuery = useGetChildProblemById(publishId, childProblemId || -1);
  } else {
    parentQuery = useGetProblemById({ publishId: +publishId, problemId: problemId ?? -1 });
  }

  // 메인 문제인 경우와 자식 문제인 경우를 구분하여 데이터를 가져옴
  // parentQuery는 메인 문제의 데이터를 가져오고, childQuery는 자식 문제의 데이터를 가져옴
  const response =
    (parentQuery?.data as components['schemas']['ProblemWithStudyInfoResp']) ??
    (childQuery?.data as components['schemas']['ChildProblemWithStudyInfoResp']);

  // response가 로드되면 로딩 상태를 false로 변경
  useEffect(() => {
    if (response !== undefined) {
      setIsLoading(false);
    }
  }, [response]);

  const handleTextareaOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.trim().length > 0) {
      setIsFilled(true);
      setQuestion(value);
    } else {
      setIsFilled(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    if (images.length > 0) {
      try {
        const uploadUrls = await getFileUploadUrl(images.map((image) => image.name));
        const success = await uploadFileToS3(
          images,
          uploadUrls.map((url) => ({
            ...url,
            fileName: url.fileName.fileName,
          }))
        );
        if (success) {
          const result = await postQna({
            publishId: publishId,
            problemId: problemId,
            childProblemId: childProblemId,
            pointingId: pointingId,
            type,
            images: uploadUrls.map((url) => url.id), // 혹은 필요 시 url 자체
            question,
          });

          if (result.response.status === 200) {
            setIsLoading(false);
            router.back();
          }
          if (result.response.status !== 200) {
            setIsLoading(false);
            if (result.response.status === 400) {
              console.log(result);
              const errorMsg = (result.error as unknown as { message: string })?.message || '질문 등록에 실패했습니다. 다시 시도해주세요.';
              showToast.error(errorMsg);
            } else {
              showToast.error('질문 등록에 실패했습니다. 다시 시도해주세요.');
            }
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setIsLoading(false);
        showToast.error('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
      }
    } else {
      // 이미지가 없는 경우
      const result = await postQna({
        publishId: publishId,
        problemId: problemId,
        childProblemId: childProblemId,
        pointingId: pointingId,
        type,
        question,
      });

      if (result.response.status === 200) {
        setIsLoading(false);
        router.back();
      }
      if (result.response.status !== 200) {
        setIsLoading(false);
        if (result.response.status === 400) {
          console.log(result);
          const errorMsg = (result.error as unknown as { message: string })?.message || '질문 등록에 실패했습니다. 다시 시도해주세요.';
          showToast.error(errorMsg);
        } else {
          showToast.error('질문 등록에 실패했습니다. 다시 시도해주세요.');
        }
      }
    }
  };

  return (
    <>
      {isLoading ? (
        <div className='flex h-dvh w-full items-center justify-center'>
          <PulseLoader color='#617AF9' aria-label='Loading Spinner' />
        </div>
      ) : (
        <>
          <Header title='질문하기' iconType='back' />
          <main className='flex min-h-dvh flex-col items-center justify-between gap-[1.6rem] px-[2rem] pt-[8rem] pb-[1.5rem]'>
            <div className='flex w-full flex-col items-center justify-center rounded-[1.6rem] bg-white'>
              <p className='font-bold-16 text-main w-full px-[2rem] pt-[2rem] text-start'>
                {title}
              </p>
              <QnaContent
                type={type}
                pointingId={pointingId}
                data={
                  response as components['schemas']['ProblemWithStudyInfoResp'] &
                    components['schemas']['ChildProblemWithStudyInfoResp']
                }
              />
            </div>
            <QnaAskContent
              handleTextareaOnChange={handleTextareaOnChange}
              images={images}
              setImages={setImages}
            />
            <Button variant='blue' disabled={!isFilled} onClick={handleSubmit}>
              등록하기
            </Button>
          </main>
        </>
      )}
    </>
  );
};

export default Page;
