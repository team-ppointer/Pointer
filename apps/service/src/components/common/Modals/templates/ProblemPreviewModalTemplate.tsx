import { components } from '@schema';
import { ProblemViewer } from '@components';

import BaseModalTemplate from './BaseModalTemplate';

type problemContent = components['schemas']['ContentResp'];

const ProblemPreviewModalTemplate = ({ problemContent }: { problemContent: problemContent }) => {
  return (
    <BaseModalTemplate>
      <ProblemViewer content={problemContent} />
    </BaseModalTemplate>
  );
};

export default ProblemPreviewModalTemplate;
