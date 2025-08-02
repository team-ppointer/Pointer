import ProblemViewer from '@repo/pointer-editor/ProblemViewer';

import { components } from '@schema';

import BaseModalTemplate from './BaseModalTemplate';

type problemContent = components['schemas']['ContentResp'];

const ProblemPreviewModalTemplate = ({ problemContent }: { problemContent: problemContent }) => {
  return (
    <BaseModalTemplate>
      <ProblemViewer problem={problemContent} loading={false} />
    </BaseModalTemplate>
  );
};

export default ProblemPreviewModalTemplate;
