import { useRouter } from '@tanstack/react-router';

const useNavigation = () => {
  const { history } = useRouter();

  const goBack = () => history.back();

  const goForward = () => history.forward();

  return {
    goBack,
    goForward,
  };
};

export default useNavigation;
