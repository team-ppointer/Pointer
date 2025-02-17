import { ReactNode } from 'react';

interface SectionCardProps {
  children: ReactNode;
}

const SectionCard = ({ children }: SectionCardProps) => {
  return (
    <section className='border-lightgray500 w-full rounded-[1.6rem] border bg-white p-[3.2rem]'>
      {children}
    </section>
  );
};

export default SectionCard;
