import { useMemo } from 'react';
import { ImageSourcePropType } from 'react-native';

interface CardImageSourcesResult {
  imageSources: ImageSourcePropType[] | undefined;
  isDiagonalLayout: boolean;
}

/**
 * 카드의 이미지 소스와 레이아웃을 계산하는 훅
 *
 * @param thumbnailUrl - 썸네일 URL (스크랩 또는 폴더)
 * @param folderTop2Thumbnail - 폴더의 상위 2개 스크랩 썸네일 (폴더인 경우)
 * @returns imageSources와 isDiagonalLayout
 *
 * @example
 * // 폴더 카드
 * const folderTop2 = props.type === 'FOLDER' ? props.top2ScrapThumbnail : undefined;
 * const { imageSources, isDiagonalLayout } = useCardImageSources(props.thumbnailUrl, folderTop2);
 *
 * // 스크랩 카드
 * const { imageSources, isDiagonalLayout } = useCardImageSources(props.thumbnailUrl);
 */
export const useCardImageSources = (
  thumbnailUrl?: string,
  folderTop2Thumbnail?: string[]
): CardImageSourcesResult => {
  return useMemo(() => {
    // folderTop2Thumbnail이 있으면 그것을 우선 사용 (최대 2개, 대각선 배치)
    if (folderTop2Thumbnail && folderTop2Thumbnail.length > 0) {
      return {
        imageSources: folderTop2Thumbnail.slice(0, 2).map((url) => ({ uri: url })),
        isDiagonalLayout: true,
      };
    }

    if (thumbnailUrl) {
      return {
        imageSources: [{ uri: thumbnailUrl }],
        isDiagonalLayout: false,
      };
    }

    return {
      imageSources: undefined,
      isDiagonalLayout: false,
    };
  }, [thumbnailUrl, folderTop2Thumbnail]);
};
