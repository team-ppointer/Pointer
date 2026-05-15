import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@components';
import { getMockExamByStudent, getMockExamTypes } from '@apis';
import { useSelectedStudent, useModal } from '@hooks';
import { AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';
import { components } from '@schema';

import ResultDetailModal from './-components/ResultDetailModal';
import { getQuestionDisplayText } from './-utils/question';

import { SheetTable, type SheetColumn } from '@/components/conceptGraph';

type MockExamResultResp = components['schemas']['MockExamResultResp'];
type MockExamTypeResp = components['schemas']['MockExamTypeResp'];

export const Route = createFileRoute('/_GNBLayout/mock-exam-results/')({
  component: RouteComponent,
});

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  return dayjs(value).format('YYYY-MM-DD HH:mm');
};

const formatIncorrects = (incorrects: number[]) => {
  if (incorrects.length === 0) return '-';
  const head = incorrects.slice(0, 5).join(', ');
  const rest = incorrects.length > 5 ? ` 외 ${incorrects.length - 5}개` : '';
  return `${head}${rest}`;
};

function RouteComponent() {
  const { selectedStudent } = useSelectedStudent();

  const { data: resultsData, isPending: isResultsPending } = getMockExamByStudent(
    { studentId: selectedStudent?.id ?? 0 },
    !!selectedStudent
  );
  const { data: typesData } = getMockExamTypes();

  const typesByCode = useMemo(() => {
    const map = new Map<string, MockExamTypeResp>();
    typesData?.data?.forEach((type) => {
      if (type.code) map.set(type.code, type);
      if (type.type && type.type !== type.code) map.set(type.type, type);
    });
    return map;
  }, [typesData]);

  const sortedResults = useMemo(() => {
    const rows = resultsData?.data ?? [];
    return [...rows].sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
  }, [resultsData]);

  const [selectedResult, setSelectedResult] = useState<MockExamResultResp | null>(null);
  const { isOpen: isDetailOpen, openModal: openDetail, closeModal: closeDetail } = useModal();

  const handleRowClick = (row: MockExamResultResp) => {
    setSelectedResult(row);
    openDetail();
  };

  const handleCloseDetail = () => {
    closeDetail();
    setSelectedResult(null);
  };

  const getDisplayName = (code?: string | null) => {
    if (!code) return '-';
    return typesByCode.get(code)?.displayName ?? code;
  };

  const columns: SheetColumn<MockExamResultResp>[] = [
    {
      key: 'displayName',
      label: '모의고사',
      width: '10rem',
      render: (row) => (
        <span className='font-medium text-gray-900'>{getDisplayName(row.type)}</span>
      ),
    },
    {
      key: 'incorrects',
      label: '오답',
      render: (row) => {
        const count = row.incorrects?.length ?? 0;
        return (
          <span className='text-sm text-gray-700'>
            <span className='mr-2 inline-flex items-center justify-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700'>
              {count}개
            </span>
            {formatIncorrects(row.incorrects ?? [])}
          </span>
        );
      },
    },
    {
      key: 'question',
      label: '학습 고민',
      render: (row) => {
        const questionText = getQuestionDisplayText(row.question);
        return questionText !== null ? (
          <span className='text-sm text-gray-700'>{questionText}</span>
        ) : (
          <span className='inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500'>
            미제출
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: '제출',
      width: '10rem',
      render: (row) => (
        <span className='text-sm text-gray-600'>{formatDateTime(row.createdAt)}</span>
      ),
    },
    {
      key: 'updatedAt',
      label: '수정',
      width: '10rem',
      render: (row) => (
        <span className='text-sm text-gray-600'>{formatDateTime(row.updatedAt)}</span>
      ),
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header title='모의고사 정오답 및 질문'>
        <></>
      </Header>
      <div className='mx-auto max-w-7xl px-8 py-8'>
        {!selectedStudent ? (
          <div className='mb-6 flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-6'>
            <AlertCircle className='mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600' />
            <div>
              <h3 className='mb-1 text-lg font-bold text-amber-900'>학생을 선택해주세요</h3>
              <p className='text-sm text-amber-700'>
                사이드바에서 학생을 선택하시면 해당 학생의 모의고사 응시 결과를 확인할 수 있습니다.
              </p>
            </div>
          </div>
        ) : (
          <SheetTable<MockExamResultResp>
            columns={columns}
            rows={sortedResults}
            loading={isResultsPending}
            emptyMessage='응시 결과가 없습니다.'
            onRowClick={handleRowClick}
            rowKey={(row) => row.id}
          />
        )}
      </div>

      <ResultDetailModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        result={selectedResult}
        displayName={getDisplayName(selectedResult?.type)}
      />
    </div>
  );
}
