import { Input } from '@components';
import { IcSearchGray } from '@svg';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  setValue: (value: string) => void;
}

const SearchInput = ({ setValue }: SearchInputProps) => {
  return (
    <div className='relative w-full'>
      <Input
        className='bg-background placeholder:text-lightgray500 h-[4.8rem] w-full rounded-[1.6rem] py-[1.6rem] pr-[1.6rem] pl-[4.8rem] text-[1.6rem] focus:outline-0'
        placeholder='검색'
        type='text'
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setValue(e.currentTarget.value);
          }
        }}
      />
      <IcSearchGray
        width={24}
        height={24}
        className='absolute top-[50%] left-[1.6rem] -translate-y-1/2 transform'
      />
    </div>
  );
};

export default SearchInput;
