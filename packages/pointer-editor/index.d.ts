export type ProblemBlock = {
  id: number;
  style?: string;
  rank?: number;
  type?: 'TEXT' | 'IMAGE';
  data?: string;
};

export type Problem = {
  id: number;
  blocks: ProblemBlock[];
};

export type ProblemViewerProps = {
  problem: Problem;
  loading?: boolean;
};

export default ProblemViewer;
export { EditorModal };
