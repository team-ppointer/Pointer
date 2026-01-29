import { useWindowDimensions } from 'react-native';

const TABLET_BREAKPOINT = 740;

export const useIsTablet = () => {
  const { width } = useWindowDimensions();
  return width >= TABLET_BREAKPOINT;
};

export default useIsTablet;
