import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, Text, View, ViewProps } from 'react-native';

type SegmentedControlProps = {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  containerProps?: ViewProps;
};

const SegmentedControl = ({
  options,
  selectedIndex,
  onChange,
  containerProps,
}: SegmentedControlProps) => {
  const translateValue = useRef(new Animated.Value(selectedIndex)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    Animated.spring(translateValue, {
      toValue: selectedIndex,
      useNativeDriver: true,
      tension: 200,
      friction: 20,
    }).start();
  }, [selectedIndex, translateValue]);

  const { segmentWidth, indicatorOffset } = useMemo(() => {
    const horizontalPadding = 8; // p-[4px] on container
    const contentWidth = Math.max(containerWidth - horizontalPadding, 0);
    return {
      segmentWidth: contentWidth > 0 ? contentWidth / options.length : 0,
      indicatorOffset: horizontalPadding / 2,
    };
  }, [containerWidth, options.length]);

  const indicatorStyle = useMemo(
    () => ({
      width: segmentWidth,
      transform: [{ translateX: Animated.multiply(translateValue, segmentWidth || 0) }],
    }),
    [segmentWidth, translateValue]
  );

  return (
    <View
      className='my-[10px] flex-row items-center rounded-full bg-gray-300 p-[4px]'
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      {...containerProps}>
      <Animated.View
        pointerEvents='none'
        className='absolute h-full rounded-full bg-gray-800 shadow-[0px_1px_4px_0px_rgba(12,12,13,0.05),0px_1px_4px_0px_rgba(12,12,13,0.10)]'
        style={[{ left: indicatorOffset }, indicatorStyle]}
      />
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Pressable key={option} className='z-10 flex-1 py-[8px]' onPress={() => onChange(index)}>
            <Text
              className={`text-center ${isSelected ? 'text-14b text-white' : 'text-13m text-black'}`}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default SegmentedControl;
