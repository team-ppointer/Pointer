type Props = {
  variant?: 'green' | 'red' | 'gray' | 'yellow';
  sizeType?: 'small' | 'medium' | 'auto'; // small은 고정 너비, medium은 가변 너비
  children: React.ReactNode;
};

const Tag = ({ variant = 'gray', sizeType = 'medium', children }: Props) => {
  const baseStyles = 'flex items-center justify-center rounded-[8px] font-medium-12';

  const variantStyles = {
    green: 'bg-lightgreen text-green',
    red: 'bg-lightred text-red',
    gray: 'bg-lightgray300 text-lightgray500',
    yellow: 'bg-lightyellow text-yellow',
  };

  const sizeTypeStyles = {
    small: 'h-[2.4rem] w-[6.2rem]',
    medium: 'h-[2.5rem] w-fit px-[1rem]',
    auto: 'h-[2.6rem] px-[0.8rem] py-[0.4rem]',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${sizeTypeStyles[sizeType]}`}>
      <span>{children}</span>
    </div>
  );
};

export default Tag;
