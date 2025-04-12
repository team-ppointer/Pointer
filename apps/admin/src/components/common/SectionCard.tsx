import { ReactNode } from 'react';

interface SectionCardProps {
  children: ReactNode;
  isSelected?: boolean;
}

const SectionCard = ({ children, isSelected }: SectionCardProps) => {
  return (
    <section
      className={`w-full rounded-[1.6rem] border bg-white p-[3.2rem] ${isSelected ? 'border-2 border-black' : 'border-lightgray500'}`}>
      {children}
    </section>
  );
};

export default SectionCard;
