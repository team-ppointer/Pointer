/**
 * Calculates grid layout parameters based on window dimensions
 * @returns Object containing numColumns, gap, and itemWidth
 */
export const useGridLayout = (containerWidth: number) => {
  const GAP = 22;
  const MIN_ITEM = 136;
  const RATIO = 1.5; // width : height = 1 : 1.5

  // 컬럼 수 계산
  let numColumns = Math.floor((containerWidth + GAP) / (MIN_ITEM + GAP));

  // 최소 2컬럼
  numColumns = Math.max(2, numColumns);

  // item width
  const itemWidth = (containerWidth - GAP * (numColumns - 1)) / numColumns;

  // 비율 기반 height
  const itemHeight = itemWidth * RATIO;

  return {
    numColumns,
    gap: GAP,
    itemWidth,
    itemHeight,
  };
};
