import React, { Children, cloneElement, type ReactElement, type ReactNode } from 'react';
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
          return (
            <React.Fragment key={index}>
              {cloneElement(child as ReactElement<Record<string, unknown>>)}
              {!isLast && <View className='mx-[16px] h-px bg-gray-300' />}
            </React.Fragment>
          );
        }

        return child;
      })}
    </View>
  );
};
