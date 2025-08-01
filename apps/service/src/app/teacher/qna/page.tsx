'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';

import { Header, BottomFixedArea, Sidebar, SearchInput } from '@components';
import { IcCloseBig, IcMore } from '@svg';
import TeacherQnaList from '@/components/qna/TeacherQnaList';
import { useGetTeacherQnaById } from '@apis';
import { ChatInput, ImageChat, MyChat, YourChat } from '@/components/qna/chat';
import { QnaDetailContent, QnaEditModal } from '@/components/qna';
import { Edit } from '@/app/qna/page';
const Page = () => {
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [mode, setMode] = useState<'view' | 'menu' | 'edit'>('view');
  const pathname = usePathname();
  const isImageModalOpen = pathname.includes('images-modal');

  const [edit, setEdit] = useState<Edit>({
    editId: null,
    editContent: '',
    editMode: 'qna',
  });

  const searchParams = useSearchParams();
  const [qnaId, setQnaId] = useState<number | undefined>(Number(searchParams.get('qnaId')));
  const { data, isSuccess: isQnaSuccess, refetch } = useGetTeacherQnaById(qnaId ?? -1);

  const scrollToBottom = () => {
    if (mainRef.current) {
      mainRef.current.scrollTop = mainRef.current.scrollHeight;
    }
  };

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
        closeOnClick={() => {
          router.replace('/teacher');
        }}
      />
      <main
        ref={mainRef}
        className={
          'relative flex h-dvh flex-col items-center justify-start overflow-y-auto px-[2rem] pt-[8rem] pb-[9rem]'
        }>
        {isQnaSuccess ? (
          <>
            <div className='flex w-full flex-col items-start justify-start gap-[0.8rem]'>
              <div className='bg-lightgray300 text-midgray100 font-medium-12 rounded-[0.4rem] px-[0.8rem] py-[0.2rem]'>
                {data.studentName}
              </div>
              <YourChat>
                {data && isQnaSuccess && <QnaDetailContent {...data} user='teacher' />}
              </YourChat>
            </div>
            <div className='flex w-full flex-col items-center justify-start gap-[2.4rem] pt-[2.4rem]'>
              {data &&
                isQnaSuccess &&
                data.chats.map((chat) =>
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
          <div className='flex w-full items-center justify-between gap-[1.6rem]'>
            <SearchInput setValue={setSearch} />
            <IcCloseBig width={24} height={24} onClick={() => setIsOpen(false)} />
          </div>
          <TeacherQnaList search={search} onClose={() => setIsOpen(false)} />
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
        {!isImageModalOpen && data && qnaId && (
          <BottomFixedArea zIndex={40}>
            <ChatInput
              qnaId={qnaId}
              refetch={refetch}
              scrollToBottom={scrollToBottom}
              user='teacher'
            />
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
              user='teacher'
            />
          </BottomFixedArea>
        )}
      </main>
    </>
  );
};
export default Page;
