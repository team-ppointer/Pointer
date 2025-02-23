import { $api } from 'src/apis/client';

const deletePublish = () => {
  return $api.useMutation('delete', '/api/v1/publish/{publishId}');
};

export default deletePublish;
