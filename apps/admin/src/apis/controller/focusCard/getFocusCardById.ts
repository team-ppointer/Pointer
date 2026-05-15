import { $api } from '@apis';

const getFocusCardById = (id: number) => {
  return $api.useQuery('get', '/api/admin/focus-card/{id}', {
    params: {
      path: { id },
    },
  });
};

export default getFocusCardById;
