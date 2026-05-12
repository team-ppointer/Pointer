import { $api } from '@apis';
import { GetFocusCardIssuanceCandidatesParams } from '@types';

const getFocusCardIssuanceCandidates = (
  { studentId, problemId, targetDate }: GetFocusCardIssuanceCandidatesParams,
  options?: { enabled?: boolean }
) => {
  return $api.useQuery(
    'get',
    '/api/admin/focus-card/issuance/candidates',
    {
      params: {
        query: {
          studentId,
          problemId,
          ...(targetDate ? { targetDate } : {}),
        },
      },
    },
    options
  );
};

export default getFocusCardIssuanceCandidates;
