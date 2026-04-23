import { Modal, Platform, Pressable, Text, View } from 'react-native';
import { XIcon } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

import { AnimatedPressable } from '@components/common';

import ProblemCalendar from './ProblemCalendar';
import { type PublishResp } from './ProblemCalendar/types';

interface CalendarModalProps {
  visible: boolean;
  selectedMonth: Date;
  selectedDate: Date;
  studyData: PublishResp[];
  onChangeMonth: (date: Date) => void;
  onDateSelect: (date: Date) => void;
  onNavigate: () => void;
  onClose: () => void;
}

const Backdrop = Platform.OS === 'ios' ? BlurView : View;
const backdropProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'light' as const } : {};
const backdropStyle =
  Platform.OS === 'ios'
    ? { flex: 1, backgroundColor: '#C6CAD480' }
    : { flex: 1, backgroundColor: 'rgba(198,202,212,0.85)' };

const CalendarModal = ({
  visible,
  selectedMonth,
  selectedDate,
  studyData,
  onChangeMonth,
  onDateSelect,
  onNavigate,
  onClose,
}: CalendarModalProps) => (
  <Modal
    transparent
    animationType='fade'
    visible={visible}
    onRequestClose={onClose}
    statusBarTranslucent>
    <Backdrop {...backdropProps} style={backdropStyle}>
      <View className='flex-1 items-center justify-center'>
        <Pressable className='absolute inset-0' onPress={onClose} />
        <View className='mx-5 w-full max-w-[540px] rounded-[14px] bg-white'>
          <AnimatedPressable
            onPress={onClose}
            className='absolute top-0 -right-[60px] size-[48px] items-center justify-center rounded-[12px] bg-white'>
            <XIcon size={24} color='black' />
          </AnimatedPressable>

          <ProblemCalendar
            selectedMonth={selectedMonth}
            selectedDate={selectedDate}
            onChangeMonth={onChangeMonth}
            onDateSelect={onDateSelect}
            studyData={studyData}
          />

          <AnimatedPressable
            onPress={onNavigate}
            className='bg-primary-500 m-5 h-[50px] items-center justify-center rounded-lg px-5'>
            <Text className='typo-body-1-medium text-center text-white'>
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 문제 세트로 이동
            </Text>
          </AnimatedPressable>
        </View>
      </View>
    </Backdrop>
  </Modal>
);

export default CalendarModal;
