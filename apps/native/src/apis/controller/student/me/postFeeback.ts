import { client, TanstackQueryClient } from '@/apis/client';
import { components } from '@/types/api/schema';
import { useMutation } from '@tanstack/react-query';

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
