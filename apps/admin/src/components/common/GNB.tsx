import { HTMLAttributes } from 'react';
import { Link } from '@tanstack/react-router';
import { IcFolder, IcList, IcPublish } from '@svg';

interface GNBMenuProps extends HTMLAttributes<HTMLDivElement> {
  isSelected: boolean;
  children: React.ReactNode;
}

const GNBMenu = ({ isSelected, children }: GNBMenuProps) => {
  const bgStyles = isSelected ? 'bg-darkgray200' : '';

  return (
    <div
      className={`font-medium-18 flex h-[4.8rem] w-full items-center justify-start gap-[1.6rem] ${bgStyles} rounded-[8px] px-[1.6rem] py-[1.2rem] text-white`}>
      {children}
    </div>
  );
};

const GNB = () => {
  return (
    <div className='bg-darkgray100 fixed top-0 z-40 min-h-[100dvh] w-[24rem] px-[1.5rem] pt-[3.2rem]'>
      <div className='mb-[3.2rem]'>
        <img src='/images/logo.png' alt='로고이미지' className='mx-[0.8rem] h-[3.2rem]' />
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
                  <IcPublish width={24} height={24} />
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
                  <IcFolder width={24} height={24} />
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
                  <IcList width={24} height={24} />
                  <span>문제</span>
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
