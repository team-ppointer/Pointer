import { $api } from '@apis';
import { GetDiagnosisByIdParams } from '@types';

const getDiagnosisById = (params: GetDiagnosisByIdParams) => {
  return $api.useQuery('get', '/api/admin/diagnosis/{id}', {
    params: {
      path: params,
    },
  });
};

export default getDiagnosisById;
