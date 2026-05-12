import { $api } from '@apis';
import { PostPublishFocusCardLinkCandidatesParams } from '@types';

// HTTP 메서드는 POST지만 read-only 후보 조회 — body 파라미터 크기가 커서 BE가 POST 로 노출.
// 의미상 query 이므로 useQuery 사용 (enabled / 캐시 / staleness 정상 동작).
const getPublishFocusCardLinkCandidates = (
  { studentId, problemSetId, targetDate }: PostPublishFocusCardLinkCandidatesParams,
  options?: { enabled?: boolean }
) => {
  return $api.useQuery(
    'post',
    '/api/admin/publish/focus-card-link-candidates',
    {
      body: {
        studentId,
        problemSetId,
        ...(targetDate ? { targetDate } : {}),
      },
    },
    options
  );
};

export default getPublishFocusCardLinkCandidates;
