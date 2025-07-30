import ProblemViewer from '@repo/pointer-editor/ProblemViewer';
import BaseModalTemplate from './BaseModalTemplate';
import { components } from '@schema';

type problemContent = components['schemas']['ContentResp'];

const ProblemPreviewModalTemplate = ({ problemContent }: { problemContent: problemContent }) => {
  return (
    <BaseModalTemplate>
      <ProblemViewer problem={problemContent} loading={false} />
    </BaseModalTemplate>
  );
};

export default ProblemPreviewModalTemplate;
