import { GRID_CONFIG } from '../constants';

/**
 * Calculates grid layout parameters based on window dimensions
 * @returns Object containing numColumns, gap, and itemWidth
 */
export const useGridLayout = (containerWidth: number) => {
  const { GAP, MIN_ITEM_WIDTH, ITEM_HEIGHT_RATIO, MIN_COLUMNS } = GRID_CONFIG;

  // 컬럼 수 계산
  let numColumns = Math.floor((containerWidth + GAP) / (MIN_ITEM_WIDTH + GAP));

  // 최소 컬럼 수 적용
  numColumns = Math.max(MIN_COLUMNS, numColumns);

  // item width
  const itemWidth = (containerWidth - GAP * (numColumns - 1)) / numColumns;

  // 비율 기반 height
  const itemHeight = itemWidth * ITEM_HEIGHT_RATIO;

  return {
    numColumns,
    gap: GAP,
    itemWidth,
    itemHeight,
  };
};
