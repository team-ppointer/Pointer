import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Image,
  type ImageProps,
  type ImageStyle,
  type DimensionValue,
  Animated,
  StyleSheet,
} from 'react-native';

import { colors } from '@theme/tokens';

type ImageWithSkeletonProps = {
  source?: ImageProps['source'] | ImageProps['source'][];
  width?: DimensionValue;
  height?: DimensionValue;
  aspectRatio?: number;
  borderRadius?: number;
  resizeMode?: ImageProps['resizeMode'];
  className?: string;
  style?: ImageStyle;
  uniqueId?: string | number;
  fallback?: React.ReactNode;
  /** 대각선 레이아웃 사용 여부 (true면 대각선 배치, false면 전체 영역에 표시) */
  isDiagonalLayout?: boolean;
  /** 선택된 이미지인지 여부 */
  isHovered?: boolean;
};

// 스켈레톤 컴포넌트
const Skeleton = ({ borderRadius }: { borderRadius: number }) => {
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: colors['gray-400'],
          borderRadius,
          opacity,
        },
      ]}
    />
  );
};

const ImageWithSkeletonComponent = ({
  source,
  width = '100%',
  height,
  aspectRatio,
  borderRadius = 10,
  resizeMode = 'cover',
  className = '',
  style,
  uniqueId = 'default',
  fallback,
  isDiagonalLayout = false,
  isHovered = false,
}: ImageWithSkeletonProps) => {
  // 이미지 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  // 대각선 레이아웃에서 각 이미지의 로딩 상태를 개별 관리
  const [firstImageLoaded, setFirstImageLoaded] = useState(false);
  const [secondImageLoaded, setSecondImageLoaded] = useState(false);

  // source가 배열인지 확인
  const isSourceArray = Array.isArray(source);

  // source 배열에서 이미지 URL 추출 (메모이제이션)
  const imageUrls = useMemo(() => {
    const nonArraySource = source ? [source] : [];
    const sourceArray = isSourceArray ? source : nonArraySource;
    return sourceArray
      .map((s) => {
        if (typeof s === 'object' && s && 'uri' in s) {
          return s.uri as string;
        }
        return null;
      })
      .filter((uri): uri is string => uri !== null);
  }, [source, isSourceArray]);

  // 이전 URL을 추적하여, 변경된 이미지만 로딩 상태 초기화
  const prevUrlsRef = React.useRef<string[]>([]);
  useEffect(() => {
    const prevUrls = prevUrlsRef.current;
    prevUrlsRef.current = imageUrls;

    // 첫 번째 이미지가 변경된 경우에만 리셋
    if (imageUrls[0] !== prevUrls[0]) {
      setIsLoading(true);
      setFirstImageLoaded(false);
    }
    // 두 번째 이미지가 새로 추가되거나 변경된 경우에만 리셋
    if (imageUrls[1] !== prevUrls[1]) {
      setSecondImageLoaded(false);
    }
  }, [imageUrls]);

  // fallback 처리
  if (!source && fallback) {
    return <>{fallback}</>;
  }

  if (!source && imageUrls.length === 0) {
    return (
      <View
        className={`aspect-square w-full rounded-[10px] bg-gray-400 ${className}`}
        style={style}
      />
    );
  }

  // 대각선 레이아웃이 아닐 때: 전체 영역에 단일 이미지 표시
  if (!isDiagonalLayout && imageUrls.length > 0) {
    const singleImageSource = { uri: imageUrls[0] };

    return (
      <View
        className={`relative w-full overflow-hidden ${className}`}
        style={[{ aspectRatio, borderRadius }, style]}>
        {isLoading && <Skeleton borderRadius={borderRadius} />}
        <Image
          source={singleImageSource}
          resizeMode={resizeMode}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
          style={[
            {
              width,
              height,
              borderRadius,
              aspectRatio,
            },
            style,
          ]}
        />
      </View>
    );
  }

  // 대각선 레이아웃일 때: 대각선 배치
  if (isDiagonalLayout && imageUrls.length > 0) {
    const hasSecondImage = imageUrls.length > 1 && imageUrls[1];
    const imageToShow = hasSecondImage ? imageUrls[1] : imageUrls[0]; // 1개면 오른쪽 아래에 표시

    return (
      <View
        className={`relative w-full overflow-hidden ${className}`}
        style={[{ aspectRatio, borderRadius }, style]}>
        {/* 왼쪽 위: 2개면 첫 번째 이미지, 1개면 회색 배경 */}
        {hasSecondImage ? (
          <View
            className='absolute top-0 left-0'
            style={{
              width: '80%',
              height: '80%',
              borderRadius: borderRadius,
              borderWidth: 4,
              borderColor: isHovered ? colors['gray-300'] : colors['gray-100'],
              overflow: 'hidden',
            }}>
            {!firstImageLoaded && <Skeleton borderRadius={0} />}
            <Image
              source={{ uri: imageUrls[0] }}
              resizeMode={resizeMode}
              onLoadEnd={() => setFirstImageLoaded(true)}
              onError={() => setFirstImageLoaded(true)}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: borderRadius,
              }}
            />
          </View>
        ) : (
          <View
            className='absolute top-0 left-0'
            style={{
              width: '80%',
              height: '80%',
              backgroundColor: colors['gray-400'],
              borderRadius: borderRadius,
              overflow: 'hidden',
              borderWidth: 4,
              borderColor: isHovered ? colors['gray-300'] : colors['gray-100'],
            }}
          />
        )}

        {/* 오른쪽 아래: 이미지 표시 (2개면 두 번째, 1개면 첫 번째) */}
        {imageToShow && (
          <View
            className='absolute right-0 bottom-0'
            style={{
              width: '80%',
              height: '80%',
              borderRadius: borderRadius,
              borderWidth: 4,
              borderColor: isHovered ? colors['gray-300'] : colors['gray-100'],
              overflow: 'hidden',
            }}>
            {!secondImageLoaded && <Skeleton borderRadius={0} />}
            <Image
              source={{ uri: imageToShow }}
              resizeMode={resizeMode}
              onLoadEnd={() => setSecondImageLoaded(true)}
              onError={() => setSecondImageLoaded(true)}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: borderRadius,
              }}
            />
          </View>
        )}
      </View>
    );
  }

  // source가 배열이 아닌 단일 이미지인 경우 (기존 로직 호환성)
  if (!Array.isArray(source) && source) {
    return (
      <View className={`relative w-full overflow-hidden ${className}`} style={{ aspectRatio }}>
        {isLoading && <Skeleton borderRadius={borderRadius} />}
        <Image
          key={uniqueId}
          source={source}
          resizeMode={resizeMode}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
          style={[
            {
              width,
              height,
              borderRadius,
              aspectRatio,
            },
            style,
          ]}
        />
      </View>
    );
  }

  // fallback
  return (
    <View
      className={`aspect-square w-full rounded-[10px] bg-gray-400 ${className}`}
      style={style}
    />
  );
};

// React.memo로 감싸서 props가 변경되지 않으면 리렌더링 방지
export const ImageWithSkeleton = React.memo(ImageWithSkeletonComponent, (prevProps, nextProps) => {
  // source가 배열인지 확인
  const prevIsArray = Array.isArray(prevProps.source);
  const nextIsArray = Array.isArray(nextProps.source);

  // source 배열 비교
  let sourceEqual = false;
  if (prevIsArray && nextIsArray) {
    const prevUris = prevProps.source
      .map((s) => (typeof s === 'object' && s && 'uri' in s ? s.uri : null))
      .filter((uri): uri is string => uri !== null);
    const nextUris = nextProps.source
      .map((s) => (typeof s === 'object' && s && 'uri' in s ? s.uri : null))
      .filter((uri): uri is string => uri !== null);
    sourceEqual =
      prevUris.length === nextUris.length && prevUris.every((uri, idx) => uri === nextUris[idx]);
  } else if (!prevIsArray && !nextIsArray) {
    const prevUri =
      typeof prevProps.source === 'object' && prevProps.source && 'uri' in prevProps.source
        ? prevProps.source.uri
        : null;
    const nextUri =
      typeof nextProps.source === 'object' && nextProps.source && 'uri' in nextProps.source
        ? nextProps.source.uri
        : null;
    sourceEqual = prevUri === nextUri;
  } else {
    sourceEqual = false;
  }

  return (
    prevProps.uniqueId === nextProps.uniqueId &&
    sourceEqual &&
    prevProps.isDiagonalLayout === nextProps.isDiagonalLayout &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.aspectRatio === nextProps.aspectRatio &&
    prevProps.borderRadius === nextProps.borderRadius &&
    prevProps.resizeMode === nextProps.resizeMode &&
    prevProps.isHovered === nextProps.isHovered
  );
});
