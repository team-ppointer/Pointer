import { $api } from '@apis';

const postUploadFile = () => {
  return $api.useMutation('post', '/api/common/upload-file');
};

export default postUploadFile;
