import React, { HTMLAttributes } from 'react';

interface GNBMenuProps extends HTMLAttributes<HTMLDivElement> {
  isSelected: boolean;
  children: React.ReactNode;
}

const GNBMenu = ({ isSelected, children, ...props }: GNBMenuProps) => {
  const bgStyles = isSelected ? 'bg-darkgray200' : 'bg-transparent';

  return (
    <div
      className={`font-medium-18 flex h-[4.8rem] w-full items-center justify-start gap-[1.6rem] ${bgStyles} bg-transparent px-[1.6rem] py-[1.2rem] text-white`}
      {...props}>
      {children}
    </div>
  );
};

export default GNBMenu;
