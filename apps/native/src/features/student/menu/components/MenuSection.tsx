import React, { Children, cloneElement, ReactElement, ReactNode } from 'react';
import { View } from 'react-native';

interface MenuSectionProps {
  children: ReactNode;
}

export const MenuSection = ({ children }: MenuSectionProps) => {
  const childArray = Children.toArray(children);

  return (
    <View className='overflow-hidden rounded-[12px] border border-gray-300'>
      {childArray.map((child, index) => {
        const isLast = index === childArray.length - 1;

        if (React.isValidElement(child)) {
          return cloneElement(child as ReactElement<any>, {
            key: index,
            isLast,
          });
        }

        return child;
      })}
    </View>
  );
};
