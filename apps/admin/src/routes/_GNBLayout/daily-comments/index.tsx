import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Slide, ToastContainer } from 'react-toastify';
import { z } from 'zod';
import { Header, SegmentedControl } from '@components';

import BroadcastTab from './-components/BroadcastTab';
import EditTab from './-components/EditTab';

const tabSchema = z.object({
  tab: z.enum(['edit', 'broadcast']).catch('edit'),
});

export const Route = createFileRoute('/_GNBLayout/daily-comments/')({
  validateSearch: tabSchema,
  component: DailyCommentsPage,
});

const TAB_ITEMS = [
  { label: '조회/편집', value: 'edit' },
  { label: '일괄 발송', value: 'broadcast' },
];

function DailyCommentsPage() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const handleTabChange = (value: string) => {
    if (value !== 'edit' && value !== 'broadcast') return;
    navigate({
      search: { tab: value },
      replace: true,
    });
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <ToastContainer
        position='top-center'
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        draggable
        pauseOnHover
        theme='dark'
        transition={Slide}
        style={{ fontSize: '1.6rem' }}
      />

      <Header title='당신만을 위한 코멘트'>
        <></>
      </Header>

      <div className='mx-auto max-w-7xl px-8 py-8'>
        <div className='mb-6'>
          <SegmentedControl items={TAB_ITEMS} value={tab} onChange={handleTabChange} />
        </div>
        {tab === 'edit' ? <EditTab /> : <BroadcastTab />}
      </div>
    </div>
  );
}
