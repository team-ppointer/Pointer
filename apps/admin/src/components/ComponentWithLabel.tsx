import { ReactNode } from 'react';

interface ComponentWithLabelProps {
  label: string;
  labelWidth?: string;
  children: ReactNode;
}

const ComponentWithLabel = ({ label, labelWidth, children }: ComponentWithLabelProps) => {
  return (
    <div className='flex items-center gap-[2.4rem]'>
      <h6 className={`font-medium-18 whitespace-nowrap ${labelWidth}`}>{label}</h6>
      {children}
    </div>
  );
};

export default ComponentWithLabel;
