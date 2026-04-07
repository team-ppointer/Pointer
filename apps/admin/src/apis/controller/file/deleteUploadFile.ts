import { $api } from '@apis';

const deleteUploadFile = () => {
  return $api.useMutation('delete', '/api/common/upload-file/{id}');
};

export default deleteUploadFile;
