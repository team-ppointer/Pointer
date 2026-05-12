import { $api } from '@apis';

const deletePublishFocusCardLink = () => {
  return $api.useMutation('delete', '/api/admin/publish-focus-card-links/{linkId}');
};

export default deletePublishFocusCardLink;
