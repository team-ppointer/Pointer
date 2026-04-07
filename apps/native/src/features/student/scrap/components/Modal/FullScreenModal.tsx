import { Modal, View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Toast from 'react-native-toast-message';

import { toastConfig } from '../Notification/Toast';

interface FullScreenModalProps {
  visible: boolean;
  onCancel: () => void;
  onClose: () => void;
  children: React.ReactNode;
}

export const AddFolderScreenModal = ({
  visible,
  onCancel,
  onClose,
  children,
}: FullScreenModalProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType='none' transparent visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <BlurView
          intensity={50}
          tint='light'
          style={{ flex: 1, backgroundColor: 'rgba(248,249,252,0.5)' }} // #F8F9FC80
        >
          {/* Header */}
          <View className='flex-row items-center justify-between bg-gray-100 px-5 py-3'>
            <Pressable onPress={onCancel} className='min-w-[60px]'>
              <Text className='text-14m text-gray-900'>취소</Text>
            </Pressable>

            <View className='flex-1 items-center px-4'>
              <Text className='text-16sb text-black'>새로운 폴더 생성</Text>
            </View>

            <Pressable onPress={onClose} className='min-w-[60px] items-end'>
              <Text className='text-14sb text-blue-500'>완료</Text>
            </Pressable>
          </View>

          {/* Content */}
          <View className='flex-1'>{children}</View>

          <Toast config={toastConfig} />
        </BlurView>
      </View>
    </Modal>
  );
};

export const LoadQnaImageScreenModal = ({
  visible,
  onCancel,
  onClose,
  children,
}: FullScreenModalProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType='fade' transparent visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, paddingTop: insets.top }} className='bg-gray-800'>
        {/* Header */}
        <View className='flex-row items-center justify-between border-b border-gray-700 px-5 py-3'>
          <Pressable onPress={onCancel} className='min-w-[60px]'>
            <Text className='text-14m text-white'>취소</Text>
          </Pressable>

          <View className='flex-1 items-center px-4'>
            <Text className='text-16sb text-white'>QnA 사진</Text>
          </View>

          <Pressable onPress={onClose} className='min-w-[60px] items-end'>
            <Text className='text-14sb text-blue-500'>완료</Text>
          </Pressable>
        </View>

        {/* Content */}
        <View className='flex-1'>{children}</View>

        <Toast config={toastConfig} />
      </View>
    </Modal>
  );
};
