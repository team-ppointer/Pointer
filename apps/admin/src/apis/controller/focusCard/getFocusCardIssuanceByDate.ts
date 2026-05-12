import { $api } from '@apis';
import { GetFocusCardIssuanceByDateParams } from '@types';

const getFocusCardIssuanceByDate = (
  { studentId, issuedDate }: GetFocusCardIssuanceByDateParams,
  options?: { enabled?: boolean }
) => {
  return $api.useQuery(
    'get',
    '/api/admin/focus-card/issuance/by-date',
    {
      params: {
        query: {
          studentId,
          ...(issuedDate ? { issuedDate } : {}),
        },
      },
    },
    options
  );
};

export default getFocusCardIssuanceByDate;
