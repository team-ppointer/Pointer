import { NavigationButton } from '@components';

interface NavigationFooterProps {
  prevLabel?: string;
  nextLabel?: string;
  onClickPrev?: () => void;
  onClickNext?: () => void;
  className?: string;
}

const NavigationFooter = ({
  prevLabel,
  nextLabel,
  onClickPrev,
  onClickNext,
  className,
}: NavigationFooterProps) => {
  return (
    <div
      className={`bg-background mx-auto flex h-[6.2rem] max-w-[768px] items-center justify-between px-[2rem] pt-[2rem] pb-[2.2rem] ${className || ''}`}>
      <div>
        {prevLabel && prevLabel !== '' && onClickPrev && (
          <NavigationButton variant='prev' label={prevLabel} onClick={onClickPrev} />
        )}
      </div>
      <div>
        {nextLabel && nextLabel !== '' && onClickNext && (
          <NavigationButton variant='next' label={nextLabel} onClick={onClickNext} />
        )}
      </div>
    </div>
  );
};

export default NavigationFooter;
