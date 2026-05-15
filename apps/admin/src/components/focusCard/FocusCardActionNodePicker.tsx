import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { getNode } from '@apis';
import type { components } from '@schema';

type ConceptNodeResp = components['schemas']['ConceptNodeResp'];

interface FocusCardActionNodePickerProps {
  value: number | undefined;
  onChange: (id: number | undefined, node?: ConceptNodeResp) => void;
  placeholder?: string;
  hasError?: boolean;
}

const FocusCardActionNodePicker = ({
  value,
  onChange,
  placeholder = 'Action Node 검색',
  hasError,
}: FocusCardActionNodePickerProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 활성 집중학습 카드가 없는 Action 노드만 반환 — 신규 카드 생성 후보 목록.
  const { data, isLoading } = getNode({ onlyFocusCardCandidates: true });
  const candidates: ConceptNodeResp[] = data?.data ?? [];

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return candidates;
    return candidates.filter((n) => (n.name ?? '').toLowerCase().includes(trimmed));
  }, [candidates, query]);

  const selectedNode = useMemo(
    () => (value !== undefined ? candidates.find((n) => n.id === value) : undefined),
    [candidates, value]
  );

  const handleSelect = (node: ConceptNodeResp) => {
    if (node.id === undefined) return;
    onChange(node.id, node);
    setIsOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined, undefined);
  };

  const triggerClassName = `flex h-12 w-full items-center justify-between gap-2 rounded-xl border bg-white px-4 text-sm transition-all duration-200 ${
    hasError
      ? 'border-red-300 focus:border-red-500'
      : 'border-gray-200 hover:border-gray-300 focus:border-main'
  } ${isOpen ? 'ring-main/20 ring-2' : ''}`;

  return (
    <div className='relative' ref={containerRef}>
      <button type='button' className={triggerClassName} onClick={() => setIsOpen((v) => !v)}>
        <span
          className={`flex-1 truncate text-left ${selectedNode ? 'text-gray-800' : 'text-gray-400'}`}>
          {selectedNode ? (selectedNode.name ?? `(ID: ${value})`) : placeholder}
        </span>
        <span className='flex items-center gap-1 text-gray-400'>
          {value !== undefined && (
            <span
              role='button'
              tabIndex={-1}
              aria-label='선택 해제'
              onClick={handleClear}
              className='flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 hover:text-gray-600'>
              <X className='h-3.5 w-3.5' />
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {isOpen && (
        <div className='absolute top-full right-0 left-0 z-50 mt-1.5 max-h-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl/5'>
          <div className='border-b border-gray-100'>
            <div className='relative'>
              <Search className='absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <input
                ref={searchInputRef}
                type='text'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='이름으로 검색...'
                className='w-full py-3 pr-4 pl-10 text-sm font-medium focus:ring-0 focus:outline-none'
              />
            </div>
          </div>
          <div className='max-h-60 overflow-y-auto p-2'>
            {isLoading ? (
              <div className='py-6 text-center text-sm text-gray-400'>불러오는 중...</div>
            ) : filtered.length === 0 ? (
              <div className='py-6 text-center text-sm text-gray-400'>
                {candidates.length === 0
                  ? '카드를 만들 수 있는 Action 노드가 없습니다.'
                  : '일치하는 노드가 없습니다.'}
              </div>
            ) : (
              filtered.map((node, idx) => {
                const isSelected = node.id !== undefined && node.id === value;
                return (
                  <div
                    key={node.id ?? `idx-${idx}`}
                    onClick={() => handleSelect(node)}
                    className={`mb-1 cursor-pointer rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isSelected ? 'bg-main text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                    <span className='truncate'>{node.name ?? ''}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusCardActionNodePicker;
