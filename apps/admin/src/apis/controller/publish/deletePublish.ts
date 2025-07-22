import { $api } from '@apis';

const deletePublish = () => {
  return $api.useMutation('delete', '/api/admin/publish/{id}');
};

export default deletePublish;
