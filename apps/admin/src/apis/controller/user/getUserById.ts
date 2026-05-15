import { $api } from '@apis';

const getUserById = (id: number) => {
  return $api.useQuery('get', '/api/admin/user/{id}', {
    params: {
      path: {
        id,
      },
    },
  });
};

export default getUserById;
