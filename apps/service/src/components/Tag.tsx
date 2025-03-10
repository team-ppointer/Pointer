type Props = {
  variant?: 'green' | 'red' | 'gray';
  sizeType?: 'small' | 'medium';
  children: React.ReactNode;
};

const Tag = ({ variant = 'gray', sizeType = 'medium', children }: Props) => {
  const baseStyles = 'flex items-center justify-center rounded-[8px] font-medium-14';

  const variantStyles = {
    green: 'bg-lightgreen text-green',
    red: 'bg-lightred text-red',
    gray: 'bg-lightgray300 text-lightgray500',
  };

  const sizeTypeStyles = {
    small: 'h-[2.4rem] w-[6.2rem]',
    medium: 'h-[3.2rem] w-[6rem]',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${sizeTypeStyles[sizeType]}`}>
      <span>{children}</span>
    </div>
  );
};

export default Tag;
