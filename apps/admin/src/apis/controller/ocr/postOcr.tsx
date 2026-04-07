import { $api } from '@apis';

export interface OcrRequest {
  src: string;
  formats: string[];
  metadata: {
    improve_mathpix: boolean;
  };
  include_line_data: boolean;
  format_options: {
    text: {
      transform: string[];
    };
  };
}

const postOcr = () => {
  return $api.useMutation('post', '/api/admin/ocr');
};

export default postOcr;
