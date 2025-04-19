import { ReactNode } from 'react';

interface ImageContainerProps {
  children: ReactNode;
  className?: string;
}

const ImageContainer = ({ children, className = '' }: ImageContainerProps) => {
  return (
    <div className={`rounded-[1.6rem] bg-white px-[1.6rem] py-[5rem] ${className}`}>{children}</div>
  );
};

export default ImageContainer;
