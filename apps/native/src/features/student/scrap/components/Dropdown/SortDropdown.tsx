import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

import { colors } from '@/theme/tokens';
import { ChevronDownFilledIcon, ChevronUpFilledIcon } from '@/components/system/icons';

import type { UISortKey, SortOrder } from '../../utils/types';

/**
 * 정렬 옵션 아이템
 */
interface OrderItem {
  label: string;
  value: UISortKey;
}

/**
 * 목록 화면 정렬 옵션 (폴더 + 스크랩)
 */
export const orderList: OrderItem[] = [
  { label: '최신순', value: 'DATE' },
  { label: '이름순', value: 'NAME' },
  { label: '유형순', value: 'TYPE' },
];

/**
 * 콘텐츠 화면 정렬 옵션 (스크랩만)
 */
export const orderContent: OrderItem[] = [
  { label: '최신순', value: 'DATE' },
  { label: '이름순', value: 'NAME' },
];

/**
 * 이미지 화면 정렬 옵션
 */
export const orderImage: OrderItem[] = [{ label: '최신순', value: 'DATE' }];

/**
 * 정렬 드롭다운 Props
 */
interface SortDropdownProps {
  /** 정렬 타입 (LIST: 목록, CONTENT: 콘텐츠, IMAGE: 이미지) */
  ordertype: 'LIST' | 'CONTENT' | 'IMAGE';
  /** 현재 정렬 키 */
  orderValue: UISortKey;
  /** 정렬 키 변경 핸들러 */
  setOrderValue: (value: UISortKey) => void;
  /** 현재 정렬 방향 */
  sortOrder: SortOrder;
  /** 정렬 방향 변경 핸들러 */
  setSortOrder: (value: SortOrder | ((prev: SortOrder) => SortOrder)) => void;
  /** 커스텀 색상 */
  colors?: {
    text?: string;
    border?: string;
    focusBackground?: string;
    checkIcon?: string;
    background?: string;
    itemBackground?: string;
  };
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  ordertype,
  orderValue,
  setOrderValue,
  sortOrder,
  setSortOrder,
  colors: customColors,
}) => {
  const [isFocus, setIsFocus] = useState(false);

  const textColor = customColors?.text || colors['gray-800'];
  const borderColor = customColors?.border || colors['gray-400'];
  const focusBackgroundColor = customColors?.focusBackground || colors['gray-400'];
  const checkIconColor = customColors?.checkIcon || colors['gray-800'];
  const backgroundColor = customColors?.background || 'white';
  const itemBackground = customColors?.itemBackground || colors['gray-300'];

  return (
    <Dropdown
      style={[
        styles.dropdown,
        isFocus && { ...styles.dropdownFocus, backgroundColor: focusBackgroundColor },
      ]}
      containerStyle={[
        styles.container,
        { borderColor: borderColor, backgroundColor: backgroundColor },
      ]}
      itemContainerStyle={styles.itemContainer}
      placeholderStyle={[styles.placeholder, { color: textColor }]}
      selectedTextStyle={[styles.selectedText, { color: textColor }]}
      data={ordertype === 'LIST' ? orderList : (ordertype === 'CONTENT' ? orderContent : orderImage)}
      labelField='label'
      valueField='value'
      value={orderValue}
      onChange={(item) => {
        if (item.value === orderValue) {
          setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
        } else {
          setOrderValue(item.value);
        }
      }}
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      renderRightIcon={() => (
        <>
          {sortOrder === 'ASC' ? (
            <ChevronUpFilledIcon color={textColor} />
          ) : (
            <ChevronDownFilledIcon color={textColor} />
          )}
        </>
      )}
      renderItem={(item) => {
        const isSelected = item.value === orderValue;
        return (
          <View style={[styles.itemRow, isSelected && { backgroundColor: itemBackground }]}>
            {isSelected && <Check size={16} color={checkIconColor} />}
            <Text style={[styles.itemText, { color: textColor }]}>{item.label}</Text>
          </View>
        );
      }}
    />
  );
};

export default SortDropdown;

const styles = StyleSheet.create({
  dropdown: {
    width: 71,
    height: 29,
    alignItems: 'center',
    paddingTop: 4,
    paddingRight: 4,
    paddingLeft: 8,
    paddingBottom: 4,
    borderRadius: 4,
    gap: 4,
  },
  sortOrderButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  dropdownFocus: {},
  container: {
    width: 104,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    gap: 2,
    top: 4,

    padding: 4,
  },
  itemContainer: {
    borderRadius: 4,
    height: 28,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    lineHeight: 21,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    lineHeight: 21,
    flexShrink: 1,
    marginRight: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    fontFamily: 'Pretendard',
  },
});
