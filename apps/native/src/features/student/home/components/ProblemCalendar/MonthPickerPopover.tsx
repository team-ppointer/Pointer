import React, { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Popover from 'react-native-popover-view';
import { Placement } from 'react-native-popover-view/dist/Types';

import { AnimatedPressable } from '@components/common';

interface MonthPickerPopoverProps {
  value: Date;
  onSelect: (date: Date) => void;
  children: React.ReactNode;
}

const MonthPickerPopover = ({ value, onSelect, children }: MonthPickerPopoverProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [pendingDate, setPendingDate] = useState(value);

  useEffect(() => {
    if (isVisible) {
      setPendingDate(value);
    }
  }, [isVisible, value]);

  const handleOpen = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode: 'date',
        display: 'calendar',
        value,
        onChange: (_event: DateTimePickerEvent, date?: Date) => {
          if (date) onSelect(date);
        },
      });
      return;
    }
    setIsVisible(true);
  };

  const handleSpinnerChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) setPendingDate(date);
  };

  const handleConfirm = () => {
    onSelect(pendingDate);
    setIsVisible(false);
  };

  const triggerElement = <Pressable onPress={handleOpen}>{children}</Pressable>;

  return (
    <Popover
      isVisible={isVisible}
      onRequestClose={() => setIsVisible(false)}
      from={triggerElement}
      placement={Placement.BOTTOM}
      animationConfig={{ duration: 100 }}
      popoverStyle={{
        borderRadius: 14,
        shadowColor: '#0F0F12',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        padding: 16,
      }}
      backgroundStyle={{ backgroundColor: 'transparent' }}>
      <View>
        <DateTimePicker
          mode='date'
          display='spinner'
          value={pendingDate}
          onChange={handleSpinnerChange}
          textColor='black'
        />
        <AnimatedPressable
          className='bg-primary-500 mt-2 items-center justify-center self-stretch rounded-lg py-2'
          onPress={handleConfirm}>
          <Text className='typo-body-1-medium text-white'>확인</Text>
        </AnimatedPressable>
      </View>
    </Popover>
  );
};

export default MonthPickerPopover;
