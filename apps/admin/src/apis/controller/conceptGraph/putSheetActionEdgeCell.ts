import { $api } from '@apis';

const putSheetActionEdgeCell = () => {
  return $api.useMutation('put', '/api/admin/concept/graph/sheet/action-edge/cell');
};

export default putSheetActionEdgeCell;
