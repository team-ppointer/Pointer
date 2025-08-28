import { HTMLAttributes } from 'react';
import { Link } from '@tanstack/react-router';
import { IcFolder, IcList, IcPublish, IcTag, IcTeacher } from '@svg';

interface GNBMenuProps extends HTMLAttributes<HTMLDivElement> {
  isSelected: boolean;
  children: React.ReactNode;
}

const GNBMenu = ({ isSelected, children }: GNBMenuProps) => {
  const bgStyles = isSelected ? 'bg-darkgray200' : '';

  return (
    <div
      className={`font-medium-16 flex h-[4.0rem] w-full items-center justify-start gap-[1.2rem] ${bgStyles} rounded-200 px-400 py-200 text-white`}>
      {children}
    </div>
  );
};

const GNB = () => {
  return (
    <div className='bg-darkgray100 fixed top-0 z-40 min-h-[100dvh] w-[20rem] px-400 pt-800'>
      <div className='mb-[3.2rem]'>
        <img
          src='/images/logo.png'
          alt='로고이미지'
          className='mx-[0.8rem] w-[10rem] brightness-0 invert'
        />
      </div>
      <nav>
        <ul>
          <li>
            <Link
              to='/publish'
              activeProps={{
                className: 'active',
              }}>
              {({ isActive }) => (
                <GNBMenu isSelected={isActive}>
                  <IcPublish width={18} height={18} />
                  <span>발행</span>
                </GNBMenu>
              )}
            </Link>
          </li>
          <li>
            <Link
              to='/problem-set'
              activeProps={{
                className: 'active',
              }}>
              {({ isActive }) => (
                <GNBMenu isSelected={isActive}>
                  <IcFolder width={18} height={18} />
                  <span>세트</span>
                </GNBMenu>
              )}
            </Link>
          </li>
          <li>
            <Link
              to='/problem'
              activeProps={{
                className: 'active',
              }}>
              {({ isActive }) => (
                <GNBMenu isSelected={isActive}>
                  <IcList width={18} height={18} />
                  <span>문제</span>
                </GNBMenu>
              )}
            </Link>
          </li>
          <li>
            <Link
              to='/concept-tags'
              activeProps={{
                className: 'active',
              }}>
              {({ isActive }) => (
                <GNBMenu isSelected={isActive}>
                  <IcTag width={18} height={18} />
                  <span>개념 태그</span>
                </GNBMenu>
              )}
            </Link>
          </li>
          <li>
            <Link
              to='/teacher'
              activeProps={{
                className: 'active',
              }}>
              {({ isActive }) => (
                <GNBMenu isSelected={isActive}>
                  <IcTeacher width={18} height={18} />
                  <span>과외 선생 정보</span>
                </GNBMenu>
              )}
            </Link>
          </li>
          <li>
            <Link
              to='/diagnosis'
              activeProps={{
                className: 'active',
              }}>
              {({ isActive }) => (
                <GNBMenu isSelected={isActive}>
                  <IcTeacher width={18} height={18} />
                  <span>학생 진단</span>
                </GNBMenu>
              )}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default GNB;
