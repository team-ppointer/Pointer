import React from 'react';
import { Text } from 'react-native';

interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
  numberOfLines?: number;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  query,
  className = '',
  highlightClassName = 'text-[#007AFF]',
  numberOfLines,
}) => {
  if (!query.trim()) {
    return (
      <Text className={className} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }

  const parts = text.split(new RegExp(`(${query})`, 'gi'));

  return (
    <Text className={className} numberOfLines={numberOfLines}>
      {parts.map((part, index) => {
        const isMatch = part.toLowerCase() === query.toLowerCase();
        return (
          <Text key={index} className={isMatch ? highlightClassName : ''}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
};
