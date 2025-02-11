import { useRouter } from '@tanstack/react-router';

const useNavigation = () => {
  const { history, navigate } = useRouter();

  const goBack = () => history.back();
  const goForward = () => history.forward();

  const goLogin = () => navigate({ to: '/login' });
  const goProblem = () => navigate({ to: '/problem' });
  const goProblemSet = () => navigate({ to: '/problem-set' });
  const goPublish = () => navigate({ to: '/publish' });

  return {
    goBack,
    goForward,
    goLogin,
    goProblem,
    goProblemSet,
    goPublish,
  };
};

export default useNavigation;
