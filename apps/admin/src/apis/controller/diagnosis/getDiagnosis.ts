import { $api } from '@apis';
import { GetDiagnosisParams } from '@types';

const getDiagnosis = (params: GetDiagnosisParams) => {
  return $api.useQuery('get', '/api/admin/diagnosis', {
    params: {
      query: params,
    },
  });
};

export default getDiagnosis;
