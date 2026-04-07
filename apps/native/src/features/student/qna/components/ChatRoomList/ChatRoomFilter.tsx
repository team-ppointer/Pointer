import React from 'react';

import type { ChatRoomFilterType } from '../../types';
import { Dropdown } from '../common';
import { FILTER_OPTIONS } from '../../constants';

interface ChatRoomFilterProps {
  value: ChatRoomFilterType;
  onChange: (value: ChatRoomFilterType) => void;
}

const ChatRoomFilter = ({ value, onChange }: ChatRoomFilterProps) => {
  return <Dropdown options={FILTER_OPTIONS} value={value} onChange={onChange} />;
};

export default ChatRoomFilter;
