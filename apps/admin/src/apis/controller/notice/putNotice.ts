import { $api } from '@apis';

const putNotice = () => {
  return $api.useMutation('put', '/api/admin/notice/{id}');
};

export default putNotice;
