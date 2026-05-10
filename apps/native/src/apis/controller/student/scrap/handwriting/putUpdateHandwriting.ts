import { useMutation } from '@tanstack/react-query';

import { type paths } from '@schema';
import { client } from '@/apis/client';

type UpdateHandwritingRequest =
  paths['/api/student/scrap/{scrapId}/handwriting']['put']['requestBody']['content']['application/json'];
type UpdateHandwritingResponse =
  paths['/api/student/scrap/{scrapId}/handwriting']['put']['responses']['200']['content']['*/*'];

interface UpdateHandwritingParams {
  scrapId: number;
  request: UpdateHandwritingRequest;
}

export const useUpdateHandwriting = () => {
  return useMutation({
    mutationFn: async ({
      scrapId,
      request,
    }: UpdateHandwritingParams): Promise<UpdateHandwritingResponse> => {
      const { data, response } = await client.PUT('/api/student/scrap/{scrapId}/handwriting', {
        params: {
          path: { scrapId },
        },
        body: request,
      });
      if (!response.ok) {
        throw new Error(`handwriting PUT failed: ${response.status}`);
      }
      return data as UpdateHandwritingResponse;
    },
  });
};
