import { Modal, TouchableWithoutFeedback, View } from 'react-native';

const ConfirmationDialog = ({
  className,
  children,
  visibleState,
  setVisibleState,
}: {
  className?: string;
  children?: React.ReactNode;
  visibleState: boolean;
  setVisibleState: React.Dispatch<React.SetStateAction<boolean>> | (() => void);
}) => {
  const handleClose = () => {
    if (typeof setVisibleState === 'function') {
      setVisibleState(false);
    }
  };

  return (
    <Modal
      animationType='fade'
      transparent={true}
      visible={visibleState}
      onRequestClose={handleClose}
      statusBarTranslucent>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View className={`flex-1 items-center justify-center bg-black/40 ${className}`}>
          <TouchableWithoutFeedback onPress={() => {}}>{children}</TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export const PopUpModal = ConfirmationDialog;

export default ConfirmationDialog;
