import { NavigationButton } from '@components';

interface NavigationFooterProps {
  prevLabel?: string;
  nextLabel?: string;
  onClickPrev?: () => void;
  onClickNext?: () => void;
}

const NavigationFooter = ({
  prevLabel,
  nextLabel,
  onClickPrev,
  onClickNext,
}: NavigationFooterProps) => {
  return (
    <div className='bg-background fixed right-0 bottom-0 left-0 flex h-[6.2rem] items-center justify-between px-[2rem]'>
      <div>
        {prevLabel && onClickPrev && (
          <NavigationButton variant='prev' label={prevLabel} onClick={onClickPrev} />
        )}
      </div>
      <div>
        {nextLabel && onClickNext && (
          <NavigationButton variant='next' label={nextLabel} onClick={onClickNext} />
        )}
      </div>
    </div>
  );
};

export default NavigationFooter;
