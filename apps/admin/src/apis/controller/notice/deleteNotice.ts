import { $api } from '@apis';

const deleteNotice = () => {
  return $api.useMutation('delete', '/api/admin/notice/{id}');
};

export default deleteNotice;
