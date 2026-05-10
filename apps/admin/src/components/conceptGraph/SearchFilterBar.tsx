import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { RotateCcw } from 'lucide-react';

// dedup 키가 fields 의 keys 정렬에 의존해 흔들리지 않도록 정렬된 직렬화를 사용한다.
const stableStringify = (obj: Record<string, unknown>): string =>
  JSON.stringify(Object.fromEntries(Object.entries(obj).sort()));

export interface SearchFilterField {
  name: string;
  label: string;
  type: 'text' | 'select';
  options?: { value: string | number; label: string }[];
  placeholder?: string;
}

interface SearchFilterBarProps {
  fields: SearchFilterField[];
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  onReset: () => void;
  debounceMs?: number;
}

const SearchFilterBar = ({
  fields,
  values,
  onChange,
  onReset,
  debounceMs = 300,
}: SearchFilterBarProps) => {
  // 부모가 매 렌더 새 객체로 fields/values 를 넘겨도 값이 같으면 effect 가 발화하지
  // 않도록 정렬된 직렬화 키로 비교한다. valuesKey 가 바뀔 때만 reset 이 호출된다.
  const valuesKey = useMemo(() => {
    const dv: Record<string, unknown> = {};
    fields.forEach((f) => {
      dv[f.name] = values[f.name] ?? '';
    });
    return stableStringify(dv);
  }, [fields, values]);

  // useForm 의 defaultValues 는 마운트 시점에만 사용되므로 ref 로 1회만 캡처.
  // 이후 값 변경은 아래 effect 의 reset() 으로만 반영된다.
  const initialDefaultsRef = useRef<Record<string, unknown>>(JSON.parse(valuesKey));

  const { register, watch, reset } = useForm<Record<string, unknown>>({
    defaultValues: initialDefaultsRef.current,
  });

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lastEmittedRef = useRef<string>(valuesKey);

  useEffect(() => {
    lastEmittedRef.current = valuesKey;
    reset(JSON.parse(valuesKey));
  }, [valuesKey, reset]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const subscription = watch((next) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const serialized = stableStringify(next as Record<string, unknown>);
        if (serialized === lastEmittedRef.current) return;
        lastEmittedRef.current = serialized;
        onChangeRef.current(next as Record<string, unknown>);
      }, debounceMs);
    });
    return () => {
      if (timer) clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [watch, debounceMs]);

  const handleReset = () => {
    const empty: Record<string, unknown> = {};
    fields.forEach((f) => {
      empty[f.name] = '';
    });
    lastEmittedRef.current = stableStringify(empty);
    reset(empty);
    onReset();
  };

  return (
    <div className='flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4'>
      {fields.map((field) => (
        <div key={field.name} className='flex min-w-[180px] flex-1 flex-col gap-1.5'>
          <label className='text-xs font-semibold text-gray-600'>{field.label}</label>
          {field.type === 'text' ? (
            <input
              type='text'
              placeholder={field.placeholder}
              {...register(field.name)}
              className='focus:border-main h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 placeholder-gray-400 transition focus:outline-none'
            />
          ) : (
            <select
              {...register(field.name)}
              className='focus:border-main h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:outline-none'>
              <option value=''>{field.placeholder ?? '전체'}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
      <button
        type='button'
        onClick={handleReset}
        className='flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50'>
        <RotateCcw className='h-4 w-4' />
        초기화
      </button>
    </div>
  );
};

export default SearchFilterBar;
