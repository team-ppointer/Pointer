import { Modal, TouchableWithoutFeedback, View } from 'react-native';

const PopUpModal = ({
  className,
  children,
  visibleState,
  setVisibleState,
}: {
  className?: string;
  children?: React.ReactNode;
  visibleState: boolean;
  setVisibleState: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <Modal
      animationType='fade'
      transparent={true}
      visible={visibleState}
      onRequestClose={() => {
        setVisibleState(false);
      }}>
      <TouchableWithoutFeedback onPress={() => setVisibleState(false)}>
        <View className={`flex-1 items-center justify-center bg-black ${className}`}>
          <TouchableWithoutFeedback onPress={() => {}}>{children}</TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
export default PopUpModal;
