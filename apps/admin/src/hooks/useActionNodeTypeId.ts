import { getNodeType } from '@apis';

import { ACTION_NODE_TYPE_CODE } from '@/components/conceptGraph';

const useActionNodeTypeId = (): number | undefined => {
  const { data } = getNodeType();
  const action = data?.data?.find((t) => t.code === ACTION_NODE_TYPE_CODE);
  return action?.id;
};

export default useActionNodeTypeId;
