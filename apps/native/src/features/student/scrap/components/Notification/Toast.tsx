import Toast, { BaseToast, ToastConfig } from 'react-native-toast-message';
import { StyleSheet } from 'react-native';
import { Check, X } from 'lucide-react-native';

export const showToast = (type: string, message: string) => {
  Toast.show({
    type: type,
    text1: message,
    topOffset: 30, // 위쪽 위치 조정
    visibilityTime: 3000,
  });
};

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={styles.toastContainer}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      renderLeadingIcon={() => <Check size={22} color={'#FFFFFF'} style={{}} />}
    />
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={styles.toastContainer}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      renderLeadingIcon={() => <X size={22} color={'#FFFFFF'} style={{}} />}
    />
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    borderLeftColor: 'transparent',
    flex: 1,
    height: 46,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#3E3F45',
    shadowColor: '#0F0F12',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    gap: 12,
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text1: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    lineHeight: 21,
    textAlign: 'center',
  },
  text2: {
    fontSize: 12,
    color: '#FFF',
  },
});
