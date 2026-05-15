import { useMemo } from 'react';
import { getNode } from '@apis';
import type { components } from '@schema';

type ConceptNodeResp = components['schemas']['ConceptNodeResp'];

// FocusCardResp.actionNode 는 { id, name } 만 담은 요약이라 description / payload 등의 상세 정보를
// 얻으려면 별도 lookup 이 필요하다. BE 에 단건 GET 이 없어 전체 노드 목록에서 id 매칭으로 찾는다.
// 결과는 TanStack Query 캐시로 공유되므로 페이지 간 재호출 비용은 낮다.
const useActionNodeDetail = (id: number | undefined): ConceptNodeResp | undefined => {
  const { data } = getNode();
  return useMemo(() => {
    if (id === undefined) return undefined;
    return data?.data?.find((n) => n.id === id);
  }, [data, id]);
};

export default useActionNodeDetail;
