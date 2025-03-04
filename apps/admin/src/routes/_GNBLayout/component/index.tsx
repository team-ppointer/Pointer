// import {
//   AnswerInput,
//   Button,
//   Calendar,
//   DeleteButton,
//   ErrorModalTemplate,
//   FloatingButton,
//   IconButton,
//   ImageUpload,
//   Input,
//   LevelSelect,
//   Modal,
//   PlusButton,
//   PrevPageButton,
//   ProblemCard,
//   ProblemPreview,
//   SearchInput,
//   StatusToggle,
//   Tag,
//   TagSelect,
// } from '@components';
// import { useAnswerInput, useModal, useSelectTag } from '@hooks';
import { createFileRoute } from '@tanstack/react-router';
// import { LevelType } from '@types';
// import { useState } from 'react';

export const Route = createFileRoute('/_GNBLayout/component/')({
  component: RouteComponent,
});

function RouteComponent() {
  // const { isOpen, openModal, closeModal } = useModal();
  // const { selectedList, unselectedList, onClickSelectTag, onClickRemoveTag } = useSelectTag();
  // const { problemType, answer, handleClickProblemType, handleChangeAnswer } = useAnswerInput();
  // const [level, setLevel] = useState<LevelType | undefined>();

  return (
    <div></div>
    // <div className='flex min-h-[100dvh] pt-3 pb-96'>
    //   {/* <div className='bg-darkgray100 fixed top-0 min-h-[100dvh] w-[20rem]'>
    //     <GNBMenu isSelected={true}>
    //       <IcPublish width={24} height={24} />
    //       <span>발행</span>
    //     </GNBMenu>
    //     <GNBMenu isSelected={false}>
    //       <IcFolder width={24} height={24} />
    //       <span>세트</span>
    //     </GNBMenu>
    //     <GNBMenu isSelected={false}>
    //       <IcList width={24} height={24} />
    //       <span>문제</span>
    //     </GNBMenu>
    //   </div> */}
    //   <div className='flex flex-col gap-4'>
    //     <div className='flex gap-4'>
    //       <Button sizeType='long' variant='dark'>
    //         버튼
    //       </Button>
    //       <DeleteButton label='세트 삭제' />
    //       <div>
    //         <IconButton variant='left' />
    //         <IconButton variant='right' />
    //         <IconButton variant='view' />
    //         <IconButton variant='preview' />
    //         <IconButton variant='modify' />
    //         <IconButton variant='delete' />
    //         <IconButton variant='select' />
    //         <IconButton variant='unselected' />
    //       </div>
    //       <PrevPageButton />
    //       <PlusButton />
    //       <PlusButton variant='light' />
    //       <div>
    //         <StatusToggle selectedStatus={'작업중'} onSelect={() => {}} />
    //         <StatusToggle selectedStatus={'컨펌 완료'} onSelect={() => {}} />
    //       </div>
    //       <div>
    //         <Button onClick={openModal}>모달 열기</Button>
    //       </div>
    //       <Modal isOpen={isOpen} onClose={closeModal}>
    //         <ErrorModalTemplate
    //           text='추가된 문항이 없어요'
    //           buttonText='닫기'
    //           handleClickButton={closeModal}
    //         />
    //       </Modal>
    //       <div>
    //         <Tag label='태그명' onClick={() => {}} removable={false} />
    //         <Tag label='태그명' onClick={() => {}} removable={true} />
    //       </div>
    //     </div>
    //     <div className='flex gap-4'>
    //       <ProblemCard>
    //         <ProblemCard.EmptyView onClick={() => {}} />
    //       </ProblemCard>
    //       <ProblemCard>
    //         <ProblemCard.TextSection>
    //           <ProblemCard.Title title='문제 제목' />
    //           <ProblemCard.Info label='문제 번호' content='00' />
    //           <ProblemCard.Info label='문제 연도' content='2021학년도 고1 3월 학력평가' />
    //           <ProblemCard.Info
    //             label='코멘트'
    //             content='이래이래 저래저래 이래이래 하는게 좋을 것 같습니다'
    //           />
    //         </ProblemCard.TextSection>

    //         <ProblemCard.ButtonSection>
    //           <IconButton variant='modify' />
    //           <IconButton variant='delete' />
    //         </ProblemCard.ButtonSection>

    //         <ProblemCard.CardImage src='' height={'34.4rem'} />

    //         <ProblemCard.TagSection>
    //           <Tag label='태그명' />
    //           <Tag label='태그명' />
    //         </ProblemCard.TagSection>
    //       </ProblemCard>
    //       <ProblemCard>
    //         <ProblemCard.TextSection>
    //           <ProblemCard.Info label='문제 번호' content='00' />
    //           <ProblemCard.Info label='문제 연도' content='2021학년도 고1 3월 학력평가' />
    //           <ProblemCard.Info label='개념 타이틀' content='점과 직선 사이의 거리' />
    //         </ProblemCard.TextSection>

    //         <ProblemCard.CardImage src='' height={'28.6rem'} />

    //         <ProblemCard.TagSection>
    //           <Tag label='태그명' />
    //           <Tag label='태그명' />
    //           <Tag label='태그명' />
    //         </ProblemCard.TagSection>
    //       </ProblemCard>
    //     </div>
    //     <div className='flex gap-4'>
    //       <Input placeholder='입력해주세요' />
    //     </div>
    //     <div>
    //       <SearchInput label='검색' placeholder='검색어를 입력해주세요' />
    //       <SearchInput label='검색' placeholder='검색어를 입력해주세요' sizeType='long' />
    //     </div>
    //     <div className='flex gap-4'>
    //       <TagSelect
    //         selectedList={selectedList}
    //         unselectedList={unselectedList}
    //         onClickSelectTag={onClickSelectTag}
    //         onClickRemoveTag={onClickRemoveTag}
    //       />
    //       <TagSelect
    //         sizeType='long'
    //         selectedList={selectedList}
    //         unselectedList={unselectedList}
    //         onClickSelectTag={onClickSelectTag}
    //         onClickRemoveTag={onClickRemoveTag}
    //       />
    //     </div>
    //     <div className='w-[50rem]'>
    //       <AnswerInput
    //         problemType={problemType}
    //         answer={answer}
    //         handleClickProblemType={handleClickProblemType}
    //         handleChangeAnswer={handleChangeAnswer}
    //       />
    //     </div>
    //     <div>
    //       <LevelSelect
    //         level={level}
    //         handleClickLevel={(level) => {
    //           setLevel(level);
    //         }}
    //       />
    //     </div>
    //     <div className='w-[150rem]'>
    //       <Calendar />
    //     </div>
    //     <div>
    //       <ProblemPreview
    //         title='점과 직선 사이의 거리'
    //         memo='이런이런 내용 메모할거임 이런이런저런'
    //         imgSrc='/images/image-placeholder.svg'
    //       />
    //     </div>
    //     <div>
    //       <ImageUpload />
    //     </div>
    //   </div>
    //   <FloatingButton onClick={() => {}}>저장하기</FloatingButton>
    // </div>
  );
}
