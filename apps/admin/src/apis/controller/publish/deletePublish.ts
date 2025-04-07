import { $api } from '@apis';

const deletePublish = () => {
  return $api.useMutation('delete', '/api/v1/publish/{publishId}');
};

export default deletePublish;
