'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import clsx from 'clsx';

import { postQnaExist, useGetQnaById } from '@apis';
import { Header, BottomFixedArea, Sidebar, SearchInput } from '@components';
import { IcCloseBig, IcMore } from '@svg';
import { QnaDetailContent, QnaEditModal, QnaList } from '@/components/qna';
import { MyChat, YourChat, ImageChat, ContextMenu, ChatInput } from '@/components/qna/chat';
import { copyToClipboard } from '@utils';
import { components } from '@schema';
import { showToast } from '@utils';

export type Edit = {
  editId: number | null;
  editContent: string;
  images?: number[];
  editMode: 'qna' | 'chat';
};

const Page = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [mode, setMode] = useState<'view' | 'menu' | 'edit'>('view');
  const [edit, setEdit] = useState<Edit>({
    editId: null,
    editContent: '',
    editMode: 'qna',
  });
  const mainRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  // images-modal이 열렸는지 확인
  const isImageModalOpen = pathname.includes('images-modal');

  const searchParams = useSearchParams();
  const publishId = Number(searchParams.get('publishId')) || -1;
  const problemId = Number(searchParams.get('problemId')) || undefined;
  const type =
    (searchParams.get('type') as components['schemas']['QnACreateRequest']['type']) ??
    'PROBLEM_CONTENT';

  const [qnaId, setQnaId] = useState<number | undefined>(Number(searchParams.get('qnaId')));

  const { data: qnaData, isSuccess: isQnaSuccess, refetch } = useGetQnaById(qnaId ?? -1);

  const scrollToBottom = () => {
    if (mainRef.current) {
      mainRef.current.scrollTop = mainRef.current.scrollHeight;
    }
  };

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setMode('view');
      showToast.success('클립보드에 복사되었습니다.');
    }
  };

  useEffect(() => {
    if (publishId && problemId && type) {
      postQnaExist({
        publishId,
        problemId,
        type,
      })
        .then((response) => {
          if (response.data && response.data.id) {
            setQnaId(response.data.id);
            refetch();
          } else {
            setQnaId(undefined);
          }
        })
        .catch(() => {
          showToast.error('QnA를 불러오는 데 실패했습니다.');
          setQnaId(undefined);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publishId, problemId, type]);

  useEffect(() => {
    setQnaId(Number(searchParams.get('qnaId')));
  }, [searchParams]);

  return (
    <>
      <Header
        title='QnA 게시판'
        iconType='menu'
        rightIconType='close'
        menuOnClick={() => setIsOpen(true)}
      />

      <main
        ref={mainRef}
        className={clsx(
          'relative flex h-dvh flex-col items-center justify-start overflow-y-auto px-[2rem] pt-[8rem] pb-[9rem]'
        )}>
        {isQnaSuccess ? (
          <>
            <div className={clsx('w-full', mode === 'menu' ? 'z-200' : 'z-0')}>
              <MyChat>
                {qnaData && isQnaSuccess && <QnaDetailContent {...qnaData} />}
                <IcMore
                  className={clsx(
                    'absolute bottom-0 left-[-2.4rem] z-100 cursor-pointer',
                    mode === 'menu' && 'hidden'
                  )}
                  width={24}
                  height={24}
                  onClick={() => setMode('menu')}
                />
              </MyChat>

              {mode === 'menu' && (
                <ContextMenu
                  modifyOnClick={() => {
                    setMode('edit');
                    setEdit({
                      editId: qnaId ?? -1,
                      editContent: qnaData?.question ?? '',
                      images: qnaData?.images?.map((image) => image.id),
                      editMode: 'qna',
                    });
                  }}
                  copyOnClick={() => handleCopy(qnaData?.question ?? '')}
                />
              )}
            </div>
            <div className='flex w-full flex-col items-center justify-start gap-[2.4rem] pt-[2.4rem]'>
              {qnaData &&
                isQnaSuccess &&
                qnaData.chats.map((chat) =>
                  chat.isMine ? (
                    chat.images && chat.images.length > 0 ? (
                      <ImageChat
                        key={chat.id}
                        isMine={chat.isMine}
                        images={chat.images.map((image) => image.url)}
                      />
                    ) : (
                      <MyChat key={chat.id}>
                        {
                          <span className='font-medium-16 w-full text-left whitespace-pre-wrap text-white'>
                            {chat.content}
                          </span>
                        }
                        <IcMore
                          className={clsx(
                            'absolute bottom-0 left-[-2.6rem] cursor-pointer',
                            mode === 'menu' && 'hidden'
                          )}
                          width={24}
                          height={24}
                          onClick={() => {
                            setMode('edit');
                            setEdit({
                              editId: chat.id,
                              editContent: chat.content,
                              editMode: 'chat',
                            });
                          }}
                        />
                      </MyChat>
                    )
                  ) : chat.images && chat.images.length > 0 ? (
                    <ImageChat
                      key={chat.id}
                      isMine={chat.isMine}
                      images={chat.images.map((image) => image.url)}
                    />
                  ) : (
                    <YourChat key={chat.id}>
                      {<span className='font-medium-16 w-full text-left'>{chat.content}</span>}
                    </YourChat>
                  )
                )}
            </div>
          </>
        ) : (
          <p className='font-medium-16 text-lightgray500 flex h-full items-center justify-center text-center'>
            등록된 질문이 없습니다.
          </p>
        )}

        <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className='flex items-center justify-between gap-[1.6rem]'>
            <SearchInput setValue={setSearch} />
            <IcCloseBig width={24} height={24} onClick={() => setIsOpen(false)} />
          </div>
          <QnaList search={search} onClose={() => setIsOpen(false)} />
        </Sidebar>
        {mode !== 'view' && (
          <div
            className='pt-safe fixed top-0 right-0 bottom-0 left-0 z-150 flex items-center justify-center'
            onClick={(e) => {
              e.stopPropagation();
              setMode('view');
            }}>
            <div className='absolute top-0 right-0 bottom-0 left-0 bg-black opacity-50' />
          </div>
        )}
        {!isImageModalOpen && qnaData && qnaId && (
          <BottomFixedArea zIndex={40}>
            <ChatInput qnaId={qnaId} refetch={refetch} scrollToBottom={scrollToBottom} />
          </BottomFixedArea>
        )}
        {mode === 'edit' && (
          <BottomFixedArea zIndex={200}>
            <QnaEditModal
              edit={edit}
              onClose={() => {
                setMode('view');
                refetch();
              }}
            />
          </BottomFixedArea>
        )}
      </main>
    </>
  );
};

export default Page;
