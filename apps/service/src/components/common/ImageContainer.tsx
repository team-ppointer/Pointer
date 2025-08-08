import { ReactNode, RefObject } from 'react';

interface ImageContainerProps {
  children: ReactNode;
  className?: string;
  ref?: RefObject<HTMLDivElement | null>;
}

const ImageContainer = ({ children, className = '', ref }: ImageContainerProps) => {
  return (
    <div className={`rounded-[1.6rem] bg-white px-[1.6rem] py-[5rem] ${className}`} ref={ref}>
      {children}
    </div>
  );
};

export default ImageContainer;
