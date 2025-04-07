import { Link } from '@tanstack/react-router';
import { GNBMenu } from '@components';
import { IcFolder, IcList, IcPublish } from '@svg';

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
