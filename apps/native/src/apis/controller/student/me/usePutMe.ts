import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type components } from '@schema';
import { client, TanstackQueryClient } from '@/apis/client';

type StudentUpdateRequest = components['schemas']['StudentUpdateRequest'];

const usePutMe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: StudentUpdateRequest) => {
      const response = await client.PUT('/api/student/me', {
        body: data,
      });
      return response.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/me').queryKey,
      });
    },
  });
};

export default usePutMe;
