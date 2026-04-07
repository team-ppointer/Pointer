import { useMutation } from '@tanstack/react-query';

import { client, TanstackQueryClient } from '@/apis/client';
import { type components } from '@/types/api/schema';

type FeedbackCreateRequest = components['schemas']['FeedbackDTO.Request'];

const usePostFeedback = () => {
  return useMutation({
    mutationFn: async (data: FeedbackCreateRequest) => {
      const response = await client.POST('/api/student/feedback', {
        body: data,
      });
      return response.data;
    },
  });
};

export default usePostFeedback;
