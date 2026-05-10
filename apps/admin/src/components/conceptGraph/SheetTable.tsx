import { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export type SheetSortDirection = 'ASC' | 'DESC';

export interface SheetColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  width?: string;
}

interface SheetTableProps<T> {
  columns: SheetColumn<T>[];
  rows: T[];
  sort?: { key: string; direction: SheetSortDirection };
  onSortChange?: (key: string, direction: SheetSortDirection) => void;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  actions?: (row: T) => ReactNode;
  rowKey?: (row: T, index: number) => string | number;
}

const renderCell = <T,>(column: SheetColumn<T>, row: T): ReactNode => {
  if (column.render) return column.render(row);
  const value = (row as Record<string, unknown>)[column.key];
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const SheetTable = <T,>({
  columns,
  rows,
  sort,
  onSortChange,
  onRowClick,
  loading,
  emptyMessage = '데이터가 없습니다.',
  actions,
  rowKey,
}: SheetTableProps<T>) => {
  const handleHeaderClick = (column: SheetColumn<T>) => {
    if (!column.sortable || !onSortChange) return;
    const nextDirection: SheetSortDirection =
      sort?.key === column.key && sort.direction === 'ASC' ? 'DESC' : 'ASC';
    onSortChange(column.key, nextDirection);
  };

  return (
    <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white'>
      <div className='overflow-x-auto'>
        <table className='w-full table-auto text-sm'>
          <thead className='bg-gray-50'>
            <tr>
              {columns.map((column) => {
                const isSorted = sort?.key === column.key;
                return (
                  <th
                    key={column.key}
                    style={column.width ? { width: column.width } : undefined}
                    className={`px-4 py-3 text-left text-xs font-bold tracking-wider whitespace-nowrap text-gray-600 uppercase ${
                      column.sortable ? 'cursor-pointer select-none hover:text-gray-900' : ''
                    }`}
                    onClick={() => handleHeaderClick(column)}>
                    <span className='inline-flex items-center gap-1'>
                      {column.label}
                      {column.sortable && (
                        <span className='text-gray-400'>
                          {isSorted ? (
                            sort?.direction === 'ASC' ? (
                              <ArrowUp className='h-3.5 w-3.5' />
                            ) : (
                              <ArrowDown className='h-3.5 w-3.5' />
                            )
                          ) : (
                            <ArrowUpDown className='h-3.5 w-3.5' />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
              {actions && (
                <th className='px-4 py-3 text-right text-xs font-bold tracking-wider text-gray-600 uppercase'>
                  {''}
                </th>
              )}
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`}>
                  {columns.map((column) => (
                    <td key={column.key} className='px-4 py-4'>
                      <div className='h-3 w-full animate-pulse rounded bg-gray-100' />
                    </td>
                  ))}
                  {actions && (
                    <td className='px-4 py-4'>
                      <div className='h-3 w-16 animate-pulse rounded bg-gray-100' />
                    </td>
                  )}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className='px-4 py-16 text-center text-sm font-medium text-gray-400'>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={rowKey ? rowKey(row, idx) : idx}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`transition-colors ${
                    onRowClick ? 'hover:bg-main/5 cursor-pointer' : 'hover:bg-gray-50'
                  }`}>
                  {columns.map((column) => (
                    <td key={column.key} className='px-4 py-3 align-middle text-sm text-gray-800'>
                      {renderCell(column, row)}
                    </td>
                  ))}
                  {actions && (
                    <td className='px-4 py-3 text-right' onClick={(e) => e.stopPropagation()}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SheetTable;
