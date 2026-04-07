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
    column: 'flex flex-col items-start',
  };

  return (
    <div className={`w-full gap-4 ${directionStyle[direction]}`}>
      <label
        className='text-sm font-semibold text-gray-700'
        style={{ width: labelWidth, minWidth: labelWidth }}>
        {label}
      </label>
      <div className={`flex-1 ${direction === 'column' ? 'w-full' : ''}`}>{children}</div>
    </div>
  );
};

export default ComponentWithLabel;
