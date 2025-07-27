'use client';

import { useState } from 'react';
import ProblemViewer, { Problem } from '@repo/pointer-editor/ProblemViewer';
import { useRouter } from 'next/navigation';
import PulseLoader from 'react-spinners/PulseLoader';

import { QnaAskContent } from '@/components/qna';
import { Button, Header } from '@components';
import { components } from '@schema';
import { useGetChildProblemById, useGetProblemById } from '@apis';
import { getFileUploadUrl, uploadFileToS3 } from '@/apis/controller/file/fileUpload';
import postQna from '@/apis/controller/qna/postQna';

const dummyProps: Omit<components['schemas']['QnACreateRequest'], 'question' | 'images'> = {
  publishId: 1,
  problemId: 3,
  childProblemId: undefined,
  pointingId: undefined,
  type: 'PROBLEM_CONTENT',
};

const Page = () => {
  const [isFilled, setIsFilled] = useState(false);
  const [question, setQuestion] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const parentQuery = useGetProblemById(dummyProps.problemId ?? null);

  const childQuery = useGetChildProblemById(dummyProps.childProblemId ?? null);

  // 메인 문제인 경우와 자식 문제인 경우를 구분하여 데이터를 가져옴
  // parentQuery는 메인 문제의 데이터를 가져오고, childQuery는 자식 문제의 데이터를 가져옴
  const response =
    (parentQuery?.data as components['schemas']['ProblemWithStudyInfoResp']) ??
    (childQuery?.data as components['schemas']['ChildProblemWithStudyInfoResp']);

  const problem: Problem = {
    id: response?.problemContent.id || 0,
    blocks: response?.problemContent.blocks || [],
  };

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
            ...dummyProps,
            images: uploadUrls.map((url) => url.id), // 혹은 필요 시 url 자체
            question,
          });

          if (result.response.status === 200) {
            setIsLoading(false);
            router.back();
          }
        }
      } catch (err) {
        console.error('업로드 실패:', err);
      }
    } else {
      // 이미지가 없는 경우
      const result = await postQna({
        ...dummyProps,
        question,
      });

      if (result.response.status === 200) {
        setIsLoading(false);
        router.back();
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
              <p className='font-bold-16 text-main w-full px-[2rem] pt-[2rem] text-start'>문제</p>
              <ProblemViewer problem={problem} loading={false} />
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
