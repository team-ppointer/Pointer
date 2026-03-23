import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from '@/apis/client';

export const useEmptyTrash = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await client.DELETE('/api/student/scrap/trash/all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrap', 'trash'] });
    },
  });
};
