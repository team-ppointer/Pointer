import '../index.css';
import { PointerViewer } from '../editor';

type ProblemViewerProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  padding?: number | string;
};

export const ProblemViewer = ({ content, padding = 0 }: ProblemViewerProps) => {
  return (
    <div className='pointer-viewer-root h-full w-full overflow-hidden'>
      <PointerViewer content={content} variant='problem' contentPadding={padding} />
    </div>
  );
};
