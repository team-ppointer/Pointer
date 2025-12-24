/**
 * Calculates grid layout parameters based on window dimensions
 * @returns Object containing numColumns, gap, and itemWidth
 */
export const useGridLayout = (containerWidth: number) => {
  const GAP = 22;
  const MIN_ITEM = 136;
  const MAX_ITEM = 145.5;
  const MIN_HEIGHT = 192;
  const MAX_HEIGHT = 216;
  const RATIO = 1.5; // 예: width:height = 1:1.5

  // 최대 컬럼 수 (최소 아이템 기준)
  let numColumns = Math.floor((containerWidth + GAP) / (MIN_ITEM + GAP));

  // 최소 2컬럼 보장
  numColumns = Math.max(2, numColumns);

  // 실제 itemWidth 계산
  let itemWidth = (containerWidth - GAP * (numColumns - 1)) / numColumns;

  // itemWidth가 너무 크면 컬럼 늘림
  if (itemWidth > MAX_ITEM) {
    numColumns += 1;
    itemWidth = (containerWidth - GAP * (numColumns - 1)) / numColumns;
  }

  // height 계산
  let itemHeight = itemWidth * RATIO;
  itemHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, itemHeight));

  return {
    numColumns,
    gap: GAP,
    itemWidth,
    itemHeight,
  };
};
