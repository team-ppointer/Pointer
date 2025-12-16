import { useWindowDimensions } from 'react-native';

/**
 * Calculates grid layout parameters based on window dimensions
 * @returns Object containing numColumns, gap, and itemWidth
 */
export const useGridLayout = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > 1024 && width > height;

  let numColumns = isLandscape ? 6 : 4;
  const gap = isLandscape ? 22 : 34;
  const totalGap = gap * (numColumns - 1);
  const padding = isLandscape ? 256 : 120;
  let itemWidth = (width - totalGap - padding) / numColumns;

  // Adjust columns if item width is too small
  if (itemWidth < 136) {
    numColumns = isLandscape ? 5 : 4;
    itemWidth = (width - gap * (numColumns - 1) - padding) / numColumns;
  }

  return { numColumns, gap, itemWidth };
};

