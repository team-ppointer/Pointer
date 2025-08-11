import { ReactNode } from 'react';

interface SectionCardProps {
  children: ReactNode;
  isSelected?: boolean;
}

const SectionCard = ({ children, isSelected }: SectionCardProps) => {
  return (
    <section
      className={`rounded-400 w-full border bg-white p-800 ${isSelected ? 'border-2 border-black' : 'border-lightgray500'}`}>
      {children}
    </section>
  );
};

export default SectionCard;
