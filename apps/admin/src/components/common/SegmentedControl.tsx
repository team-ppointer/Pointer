import { useRef, useEffect, useState, useCallback } from 'react';
import { LucideIcon } from 'lucide-react';

export interface SegmentedControlItem {
  label: string;
  value: string;
  icon?: LucideIcon;
  onClick?: () => void;
}

interface SegmentedControlProps {
  items: SegmentedControlItem[];
  className?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  enabled?: boolean;
}

function SegmentedControl({
  items,
  className = '',
  value,
  defaultValue,
  onChange,
  enabled = true,
}: SegmentedControlProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [selectedIndex, setSelectedIndex] = useState(() => {
    if (value !== undefined) {
      const controlledIndex = items.findIndex((item) => item.value === value);
      if (controlledIndex !== -1) return controlledIndex;
    }

    if (defaultValue !== undefined) {
      const defaultIndex = items.findIndex((item) => item.value === defaultValue);
      if (defaultIndex !== -1) return defaultIndex;
    }

    return items.length > 0 ? 0 : -1;
  });
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    transform: 'translateX(0px)',
  });

  const updateIndicatorStyle = useCallback(
    (index: number) => {
      if (index < 0) return;
      const item = items[index];
      if (!item) return;
      const activeButton = buttonRefs.current[String(item.value)];
      if (activeButton && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        const offsetX = buttonRect.left - containerRect.left - 4; // 4px는 container의 p-1 padding

        setIndicatorStyle({
          width: buttonRect.width,
          transform: `translateX(${offsetX}px)`,
        });
      }
    },
    [items]
  );

  useEffect(() => {
    updateIndicatorStyle(selectedIndex);
  }, [items, selectedIndex, updateIndicatorStyle]);

  useEffect(() => {
    if (value === undefined) return;
    const nextIndex = items.findIndex((item) => item.value === value);
    if (nextIndex !== -1) {
      setSelectedIndex(nextIndex);
    } else if (items.length > 0) {
      setSelectedIndex(0);
    } else {
      setSelectedIndex(-1);
    }
  }, [value, items]);

  useEffect(() => {
    if (value !== undefined) return;
    if (selectedIndex >= items.length) {
      setSelectedIndex(items.length > 0 ? items.length - 1 : -1);
    }
  }, [items.length, selectedIndex, value]);

  const handleSelect = (item: SegmentedControlItem, index: number) => {
    if (!enabled) return;
    setSelectedIndex(index);
    onChange?.(item.value);
    item.onClick?.();
  };

  return (
    <div
      className={`w-fit overflow-x-auto ${className} flex-shrink-0 scroll-smooth ${enabled ? '' : 'opacity-70'}`}>
      <div
        ref={containerRef}
        className='relative flex min-w-fit rounded-2xl border border-gray-200 bg-gray-100 p-1'>
        {/* Animated Background Indicator */}
        <div
          className='absolute top-1 h-[calc(100%-8px)] rounded-xl bg-white shadow-sm transition-all duration-500'
          style={{
            ...indicatorStyle,
            transitionTimingFunction: 'cubic-bezier(0.34, 1.2, 0.64, 1)',
          }}
        />

        {/* Tab Buttons */}
        {items.map((item, index) => {
          const Icon = item.icon;
          const isSelected = selectedIndex === index;
          return (
            <button
              key={String(item.value)}
              ref={(el: HTMLButtonElement | null) => {
                buttonRefs.current[String(item.value)] = el;
                return undefined;
              }}
              onClick={() => handleSelect(item, index)}
              className={`relative z-10 flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2 font-medium whitespace-nowrap transition-colors duration-200 ${
                isSelected
                  ? 'text-main'
                  : `text-gray-600 ${enabled ? 'hover:text-gray-900' : 'cursor-not-allowed'}`
              }`}>
              {Icon && <Icon className='h-4 w-4 flex-shrink-0' />}
              <span className='whitespace-nowrap'>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SegmentedControl;
