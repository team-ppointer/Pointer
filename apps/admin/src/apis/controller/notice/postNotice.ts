import { $api } from '@apis';

const postNotice = () => {
  return $api.useMutation('post', '/api/admin/notice');
};

export default postNotice;
