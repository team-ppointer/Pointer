import { Text, View, Image, Linking } from 'react-native';
import Container from '@components/common/Container';
import TextButton from '@components/common/TextButton';
import { postSocialLogin } from '@apis';
import { env, setAccessToken, setRefreshToken } from '@utils';
import { useAuthStore } from '@stores';

const LoginScreen = () => {
  const { setSessionStatus, setRole } = useAuthStore();
  const handleLoginClick = async (social: 'KAKAO' | 'GOOGLE') => {
    try {
      const result = await postSocialLogin(social);

      if (result.isSuccess && result.loginUrl) {
        await Linking.openURL(result.loginUrl);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container className='flex-1 items-center justify-center gap-[16px]'>
      <Image source={require('@assets/images/pointer-logo.png')} />
      <Text className='text-20b text-gray-900'>로그인</Text>
      <View className='flex-row gap-[16px]'>
        <TextButton variant='gray' onPress={() => handleLoginClick('KAKAO')}>
          카카오 로그인
        </TextButton>
        <TextButton variant='gray' onPress={() => handleLoginClick('GOOGLE')}>
          구글 로그인
        </TextButton>
      </View>
      <TextButton
        variant='gray'
        onPress={() => {
          const success = true;
          const isFirstLogin = false;
          const accessToken = env.devAccessToken;
          const refreshToken = env.devRefreshToken;

          if (!success || !accessToken) {
            setSessionStatus('unauthenticated');
            return;
          }

          setAccessToken(accessToken);
          if (refreshToken) setRefreshToken(refreshToken);

          setRole('student');
          setSessionStatus('authenticated');
        }}>
        개발용 로그인
      </TextButton>
    </Container>
  );
};

export default LoginScreen;
