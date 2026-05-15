import { $api } from '@apis';

const getConceptHistory = (studentId: number, options?: { enabled?: boolean }) => {
  return $api.useQuery(
    'get',
    '/api/admin/analytics/concept-history/{studentId}',
    {
      params: {
        path: { studentId },
      },
    },
    options
  );
};

export default getConceptHistory;
