import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  LayoutRectangle,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { colors } from '@theme/tokens';
import { ChevronDownFilledIcon } from '@/components/system/icons';

interface DropdownOption<T extends string> {
  label: string;
  value: T;
}

interface DropdownProps<T extends string> {
  options: readonly DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: 'default' | 'status';
}

const Dropdown = <T extends string>({
  options,
  value,
  onChange,
  variant = 'default',
}: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonLayout, setButtonLayout] = useState<LayoutRectangle | null>(null);
  const buttonRef = useRef<View>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleOpen = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setButtonLayout({ x, y, width, height });
      setIsOpen(true);
    });
  };

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const isStatus = variant === 'status';
  const isAsking = value === 'asking';

  return (
    <>
      <Pressable
        ref={buttonRef}
        onPress={handleOpen}
        className={`flex-row items-center gap-[2px] rounded-[6px] ${
          isStatus
            ? 'py-[2px] pl-[6px] pr-[4px] ' + (isAsking ? 'bg-blue-100' : 'bg-green-100')
            : 'py-[4px] pl-[8px] pr-[4px]'
        }`}>
        <Text
          className={`text-14m ${
            isStatus ? (isAsking ? 'text-blue-500' : 'text-green-500') : 'text-gray-800'
          }`}>
          {selectedOption?.label}
        </Text>
        <ChevronDownFilledIcon
          size={16}
          color={isStatus ? colors['gray-600'] : colors['gray-800']}
        />
      </Pressable>

      <Modal visible={isOpen} transparent animationType='fade'>
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View className='flex-1'>
            <TouchableWithoutFeedback>
              <View
                style={{
                  position: 'absolute',
                  top: buttonLayout ? buttonLayout.y + buttonLayout.height + 4 : 0,
                  left: buttonLayout?.x,
                  minWidth: buttonLayout?.width,
                }}
                className='rounded-[8px] bg-white py-[4px] shadow-lg'
                // Shadow for iOS
                // eslint-disable-next-line react-native/no-inline-styles
                pointerEvents='auto'>
                {options.map((option, index) => {
                  const isSelected = option.value === value;
                  const isFirst = index === 0;
                  const isLast = index === options.length - 1;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => handleSelect(option.value)}
                      className={`flex-row items-center justify-between px-[16px] py-[12px] active:bg-gray-100 ${
                        !isLast ? 'border-b border-gray-300' : ''
                      } ${isFirst ? 'rounded-t-[8px]' : ''} ${isLast ? 'rounded-b-[8px]' : ''}`}>
                      <Text
                        className={`text-14m ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                        {option.label}
                      </Text>
                      {isSelected && <Check size={16} color={colors['gray-900']} />}
                    </Pressable>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export default Dropdown;
