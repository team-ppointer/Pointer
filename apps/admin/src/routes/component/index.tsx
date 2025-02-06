import {
  Button,
  GNBMenu,
  IconButton,
  Input,
  Modal,
  PlusButton,
  PrevPageButton,
  ProblemCard,
  SearchInput,
  StatusToggle,
  Tag,
  TagSelect,
} from '@components';
import { useModal, useSelectTag } from '@hooks';
import { IcFolder, IcList, IcPublish } from '@svg';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/component/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { isOpen, closeModal } = useModal();
  const { selectedList, unselectedList, onClickSelectTag, onClickRemoveTag } = useSelectTag();

  return (
    <div className='bg-background flex min-h-[100dvh] pb-96 pt-3'>
      <div className='bg-darkgray100 fixed top-0 min-h-[100dvh] w-[20rem]'>
        <GNBMenu isSelected={true}>
          <IcPublish width={24} height={24} />
          <span>발행</span>
        </GNBMenu>
        <GNBMenu isSelected={false}>
          <IcFolder width={24} height={24} />
          <span>세트</span>
        </GNBMenu>
        <GNBMenu isSelected={false}>
          <IcList width={24} height={24} />
          <span>문제</span>
        </GNBMenu>
      </div>
      <div className='flex flex-col gap-4 pl-[22rem]'>
        <div className='flex gap-4'>
          <Button sizeType='long' variant='dark'>
            버튼
          </Button>
          <div>
            <IconButton variant='left' />
            <IconButton variant='right' />
            <IconButton variant='view' />
            <IconButton variant='preview' />
            <IconButton variant='modify' />
            <IconButton variant='delete' />
            <IconButton variant='select' />
            <IconButton variant='unselected' />
          </div>
          <PrevPageButton />
          <PlusButton />
          <PlusButton variant='light' />
          <div>
            <StatusToggle selectedStatus={'작업중'} onSelect={() => {}} />
            <StatusToggle selectedStatus={'컨펌 완료'} onSelect={() => {}} />
          </div>
          <Modal isOpen={isOpen} onClose={closeModal}>
            <div className='font-medium-18 flex h-[21.1rem] w-[38.4rem] flex-col items-center justify-center gap-[3.2rem]'>
              <h1>세트를 삭제할까요?</h1>
              <div className='flex items-center justify-center gap-[1.6rem]'>
                <Button variant='light'>아니오</Button>
                <Button variant='dark'>예</Button>
              </div>
            </div>
          </Modal>
          <div>
            <Tag label='태그명' onClick={() => {}} removable={false} />
            <Tag label='태그명' onClick={() => {}} removable={true} />
          </div>
        </div>
        <div className='flex gap-4'>
          <ProblemCard>
            <ProblemCard.EmptyView onClick={() => {}} />
          </ProblemCard>
          <ProblemCard>
            <ProblemCard.TextSection>
              <ProblemCard.Title title='문제 제목' />
              <ProblemCard.Info label='문제 번호' content='00' />
              <ProblemCard.Info label='문제 연도' content='2021학년도 고1 3월 학력평가' />
              <ProblemCard.Info
                label='코멘트'
                content='이래이래 저래저래 이래이래 하는게 좋을 것 같습니다'
              />
            </ProblemCard.TextSection>

            <ProblemCard.ButtonSection>
              <IconButton variant='modify' />
              <IconButton variant='delete' />
            </ProblemCard.ButtonSection>

            <ProblemCard.CardImage src='' height={'34.4rem'} />

            <ProblemCard.TagSection>
              <Tag label='태그명' />
              <Tag label='태그명' />
            </ProblemCard.TagSection>
          </ProblemCard>
          <ProblemCard>
            <ProblemCard.TextSection>
              <ProblemCard.Info label='문제 번호' content='00' />
              <ProblemCard.Info label='문제 연도' content='2021학년도 고1 3월 학력평가' />
              <ProblemCard.Info label='개념 타이틀' content='점과 직선 사이의 거리' />
            </ProblemCard.TextSection>

            <ProblemCard.CardImage src='' height={'28.6rem'} />

            <ProblemCard.TagSection>
              <Tag label='태그명' />
              <Tag label='태그명' />
              <Tag label='태그명' />
            </ProblemCard.TagSection>
          </ProblemCard>
        </div>
        <div className='flex gap-4'>
          <Input placeholder='입력해주세요' />
        </div>
        <div>
          <SearchInput label='검색' placeholder='검색어를 입력해주세요' />
          <SearchInput label='검색' placeholder='검색어를 입력해주세요' sizeType='long' />
        </div>
        <div className='flex gap-4'>
          <TagSelect
            selectedList={selectedList}
            unselectedList={unselectedList}
            onClickSelectTag={onClickSelectTag}
            onClickRemoveTag={onClickRemoveTag}
          />
          <TagSelect
            sizeType='long'
            selectedList={selectedList}
            unselectedList={unselectedList}
            onClickSelectTag={onClickSelectTag}
            onClickRemoveTag={onClickRemoveTag}
          />
        </div>
      </div>
    </div>
  );
}
