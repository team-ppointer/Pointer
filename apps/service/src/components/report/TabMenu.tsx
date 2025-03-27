'use client';
interface TabMenuProps<T extends string> {
  leftMenu: T;
  rightMenu: T;
  selectedTab: T;
  onTabChange?: (tab: T) => void;
}

const TabMenu = <T extends string>({
  leftMenu,
  rightMenu,
  selectedTab,
  onTabChange,
}: TabMenuProps<T>) => {
  const buttonStyle =
    'font-medium-16 z-10 flex h-full w-1/2 items-center justify-center rounded-[16px] transition-colors duration-300';

  const handleTabChange = (tab: T) => {
    onTabChange?.(tab);
  };

  return (
    <div className={`relative w-full rounded-[16px] bg-white`}>
      <div className='flex h-[4.8rem] w-full items-center justify-between'>
        <button
          className={`${buttonStyle} ${selectedTab === leftMenu ? 'text-white' : 'text-black'}`}
          onClick={() => handleTabChange(leftMenu)}>
          {leftMenu}
        </button>

        <button
          className={`${buttonStyle} ${selectedTab === rightMenu ? 'text-white' : 'text-black'}`}
          onClick={() => handleTabChange(rightMenu)}>
          {rightMenu}
        </button>

        <div
          className={`bg-main absolute top-0 h-full w-1/2 rounded-[16px] transition-transform duration-300 ease-in-out ${
            selectedTab === rightMenu ? 'translate-x-full' : 'translate-x-0'
          }`}
        />
      </div>
    </div>
  );
};

export default TabMenu;
