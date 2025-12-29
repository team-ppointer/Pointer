import { colors } from '@/theme/tokens';
import React, { useEffect, useState, useRef } from 'react';
import { View, Image, ImageProps, ImageStyle, DimensionValue, ViewStyle } from 'react-native';
import { useAnimatedStyle, useSharedValue, withRepeat } from 'react-native-reanimated';
import Animated, { withTiming, interpolate } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

type ImageSkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  aspectRatio?: number;
  borderRadius?: number;
  className?: string;
  style?: ViewStyle;
  uniqueId?: string | number;
};

export const ImageSkeleton = ({
  width = '100%',
  height,
  aspectRatio,
  borderRadius = 10,
  className = '',
  style,
  uniqueId = 'default',
}: ImageSkeletonProps) => {
  const shimmerTranslateX = useSharedValue(-1);

  useEffect(() => {
    shimmerTranslateX.value = -1;
    shimmerTranslateX.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
  }, [shimmerTranslateX]);

  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerTranslateX.value, [-1, 1], [-200, 200]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      className={`relative overflow-hidden bg-gray-300 ${className}`}
      style={[
        {
          width,
          height,
          aspectRatio,
          borderRadius,
        },
        style,
      ]}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '200%',
            height: '100%',
          },
          shimmerAnimatedStyle,
        ]}>
        <Svg width='100%' height='100%' style={{ position: 'absolute' }}>
          <Defs>
            <LinearGradient id={`shimmer-${uniqueId}`} x1='0%' y1='0%' x2='100%' y2='0%'>
              <Stop offset='0%' stopColor={colors['gray-500']} stopOpacity={1} />
              <Stop offset='50%' stopColor={colors['gray-500']} stopOpacity={1} />
              <Stop offset='100%' stopColor={colors['gray-500']} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect width='100%' height='100%' fill={`url(#shimmer-${uniqueId})`} />
        </Svg>
      </Animated.View>
    </View>
  );
};

type ImageWithSkeletonProps = {
  source: ImageProps['source'];
  width?: DimensionValue;
  height?: DimensionValue;
  aspectRatio?: number;
  borderRadius?: number;
  resizeMode?: ImageProps['resizeMode'];
  className?: string;
  style?: ImageStyle;
  uniqueId?: string | number;
  fallback?: React.ReactNode;
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
}: ImageWithSkeletonProps) => {
  // source.uri를 추출하여 의존성으로 사용 (객체 참조 문제 방지)
  const imageUri = typeof source === 'object' && source && 'uri' in source ? source.uri : null;

  // useRef로 이미 로드된 URI 추적 (리렌더링에 영향받지 않음)
  const loadedUriRef = useRef<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(() => {
    // 이미 로드된 이미지인지 확인
    return imageUri !== loadedUriRef.current;
  });

  // imageUri가 실제로 변경되었을 때만 로딩 상태 리셋
  useEffect(() => {
    if (imageUri && imageUri !== loadedUriRef.current) {
      setIsImageLoading(true);
    }
  }, [imageUri]);

  if (!source && fallback) {
    return <>{fallback}</>;
  }

  if (!source) {
    return (
      <View
        className={`aspect-square w-full rounded-[10px] bg-gray-600 ${className}`}
        style={style}
      />
    );
  }

  return (
    <View className={`relative w-full overflow-hidden ${className}`} style={{ aspectRatio }}>
      {isImageLoading && (
        <ImageSkeleton
          width={width}
          aspectRatio={aspectRatio}
          borderRadius={borderRadius}
          uniqueId={uniqueId}
          className='absolute inset-0'
        />
      )}
      <Image
        key={uniqueId}
        source={source}
        resizeMode={resizeMode}
        style={[
          {
            width,
            height,
            borderRadius,
            aspectRatio,
          },
          style,
        ]}
        onLoadStart={() => {
          // 이미 로드된 이미지가 아닐 때만 로딩 상태로 변경
          if (imageUri && imageUri !== loadedUriRef.current) {
            setIsImageLoading(true);
          }
        }}
        onLoad={() => {
          setIsImageLoading(false);
          if (imageUri) {
            loadedUriRef.current = imageUri;
          }
        }}
        onError={(error) => {
          console.warn('Image load error:', error.nativeEvent?.error || 'Unknown error');
          setIsImageLoading(false);
          // 에러가 나도 같은 URI를 다시 로드하지 않도록 (무한 루프 방지)
          if (imageUri) {
            loadedUriRef.current = imageUri;
          }
        }}
      />
    </View>
  );
};

// React.memo로 감싸서 props가 변경되지 않으면 리렌더링 방지
export const ImageWithSkeleton = React.memo(ImageWithSkeletonComponent, (prevProps, nextProps) => {
  // uniqueId와 source.uri가 같으면 리렌더링하지 않음
  const prevUri = typeof prevProps.source === 'object' && prevProps.source && 'uri' in prevProps.source 
    ? prevProps.source.uri 
    : null;
  const nextUri = typeof nextProps.source === 'object' && nextProps.source && 'uri' in nextProps.source 
    ? nextProps.source.uri 
    : null;
  
  return (
    prevProps.uniqueId === nextProps.uniqueId &&
    prevUri === nextUri &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.aspectRatio === nextProps.aspectRatio &&
    prevProps.borderRadius === nextProps.borderRadius &&
    prevProps.resizeMode === nextProps.resizeMode
  );
});
