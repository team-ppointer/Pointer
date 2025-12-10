import { ChevronDownFilledIcon, ChevronUpFilledIcon } from '@/components/system/icons';
import { colors } from '@/theme/tokens';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

interface OrderItem {
  label: string;
  value: string;
}

interface SortDropdownProps {
  orderList: OrderItem[];
  order: OrderItem;
  setOrder: (item: OrderItem) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ orderList, order, setOrder }) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <Dropdown
      style={[styles.dropdown, isFocus && styles.dropdownFocus]}
      containerStyle={styles.container}
      itemContainerStyle={styles.itemContainer}
      placeholderStyle={styles.placeholder}
      selectedTextStyle={styles.selectedText}
      data={orderList}
      labelField='label'
      valueField='value'
      value={order.value}
      onChange={(item) => {
        setOrder(item);
        setIsFocus(false);
      }}
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      renderRightIcon={() => (isFocus ? <ChevronUpFilledIcon /> : <ChevronDownFilledIcon />)}
      renderItem={(item) => (
        <View style={styles.itemRow}>
          {item.value === order.value && <Check size={16} color={colors['gray-800']} />}
          <Text style={styles.itemText}>{item.label}</Text>
        </View>
      )}
    />
  );
};

export default SortDropdown;

const styles = StyleSheet.create({
  dropdown: {
    width: 71,
    height: 29,
    gap: 2,
    paddingTop: 4,
    paddingRight: 4,
    paddingLeft: 8,
    paddingBottom: 4,
    borderRadius: 4,
    backgroundColor: colors['gray-100'],
  },
  dropdownFocus: {
    backgroundColor: colors['gray-400'],
  },
  container: {
    width: 104,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors['gray-400'],
    gap: 2,
    top: 4,
    shadowColor: 'rgba(12,12,13,0.10)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 32,
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
    color: colors['gray-800'],
  },
  selectedText: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    lineHeight: 21,
    color: colors['gray-800'],
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    color: colors['gray-800'],
  },
});
