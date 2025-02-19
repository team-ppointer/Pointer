import { ReactNode } from 'react';

interface ComponentWithLabelProps {
  label: string;
  labelWidth?: string;
  children: ReactNode;
  direction?: 'row' | 'column';
}

const ComponentWithLabel = ({
  label,
  labelWidth,
  children,
  direction = 'row',
}: ComponentWithLabelProps) => {
  const directionStyle = {
    row: 'flex items-center',
    column: 'flex-col items-start',
  };
  return (
    <div className={`flex w-full gap-[2.4rem] ${directionStyle[direction]}`}>
      <h6
        className='font-medium-18 whitespace-nowrap'
        style={{ width: labelWidth, minWidth: labelWidth }}>
        {label}
      </h6>
      {children}
    </div>
  );
};

export default ComponentWithLabel;
