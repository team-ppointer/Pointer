import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { getSheetNode } from '@apis';

import type { components } from '@/types/api/schema';

type ConceptNodeResp = components['schemas']['ConceptNodeResp'];

interface NodeSearchSelectProps {
  value: number | undefined;
  onChange: (id: number | undefined, node?: ConceptNodeResp) => void;
  initialNode?: ConceptNodeResp;
  placeholder?: string;
  excludeIds?: number[];
  hasError?: boolean;
  nodeTypeId?: number;
  disabled?: boolean;
}

const formatNodeLabel = (node: ConceptNodeResp): string => {
  const name = node.name ?? '';
  const typeLabel = node.nodeType?.label;
  return typeLabel ? `${name} (${typeLabel})` : name;
};

const NodeSearchSelect = ({
  value,
  onChange,
  initialNode,
  placeholder = '노드 검색',
  excludeIds,
  hasError,
  nodeTypeId,
  disabled,
}: NodeSearchSelectProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [cachedNode, setCachedNode] = useState<ConceptNodeResp | undefined>(initialNode);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 200);
    return () => clearTimeout(timer);
  }, [query]);

  const sheetQuery = getSheetNode({
    page: 0,
    size: 50,
    name: debouncedQuery.length > 0 ? debouncedQuery : undefined,
    nodeTypeId,
  });
  const candidates: ConceptNodeResp[] = sheetQuery.data?.data ?? [];

  useEffect(() => {
    if (value === undefined) {
      setCachedNode(undefined);
      return;
    }
    if (cachedNode?.id === value) return;
    if (initialNode?.id === value) {
      setCachedNode(initialNode);
      return;
    }
    const fromList = candidates.find((n) => n.id === value);
    if (fromList) {
      setCachedNode(fromList);
    }
  }, [value, initialNode, candidates, cachedNode]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
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
    if (!excludeIds || excludeIds.length === 0) return candidates;
    return candidates.filter((c) => c.id === undefined || !excludeIds.includes(c.id));
  }, [candidates, excludeIds]);

  const selectedLabel = useMemo(() => {
    if (value === undefined) return '';
    if (cachedNode?.id === value) return formatNodeLabel(cachedNode);
    if (initialNode?.id === value) return formatNodeLabel(initialNode);
    const found = candidates.find((n) => n.id === value);
    if (found) return formatNodeLabel(found);
    return `(ID: ${value})`;
  }, [value, cachedNode, initialNode, candidates]);

  const handleSelect = (node: ConceptNodeResp) => {
    if (node.id === undefined) return;
    setCachedNode(node);
    onChange(node.id, node);
    setIsOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCachedNode(undefined);
    onChange(undefined, undefined);
  };

  const triggerClassName = `flex h-12 w-full items-center justify-between gap-2 rounded-xl border bg-white px-4 text-sm transition-all duration-200 ${
    hasError
      ? 'border-red-300 focus:border-red-500'
      : 'border-gray-200 hover:border-gray-300 focus:border-main'
  } ${isOpen ? 'ring-main/20 ring-2' : ''} ${disabled ? 'cursor-not-allowed bg-gray-50 opacity-60' : ''}`;

  return (
    <div className='relative' ref={containerRef}>
      <button
        type='button'
        className={triggerClassName}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((v) => !v)}>
        <span
          className={`flex-1 truncate text-left ${
            selectedLabel ? 'text-gray-800' : 'text-gray-400'
          }`}>
          {selectedLabel || placeholder}
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
                placeholder='노드명 검색...'
                className='w-full py-3 pr-4 pl-10 text-sm font-medium focus:ring-0 focus:outline-none'
              />
            </div>
          </div>
          <div className='max-h-60 overflow-y-auto p-2'>
            {sheetQuery.isLoading ? (
              <div className='py-6 text-center text-sm text-gray-400'>불러오는 중...</div>
            ) : filtered.length === 0 ? (
              <div className='py-6 text-center text-sm text-gray-400'>
                일치하는 노드가 없습니다.
              </div>
            ) : (
              filtered.map((node) => {
                const isSelected = node.id !== undefined && node.id === value;
                return (
                  <div
                    key={node.id ?? Math.random()}
                    onClick={() => handleSelect(node)}
                    className={`mb-1 cursor-pointer rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isSelected ? 'bg-main text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                    <div className='flex items-center justify-between gap-2'>
                      <span className='truncate'>{node.name ?? ''}</span>
                      {node.nodeType?.label && (
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {node.nodeType.label}
                        </span>
                      )}
                    </div>
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

export default NodeSearchSelect;
