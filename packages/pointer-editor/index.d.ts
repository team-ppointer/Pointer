import React from 'react';

export interface ProblemBlock {
  type: 'TEXT' | 'IMAGE';
  content?: string;
  data?: string;
  style?: string;
}

export interface Problem {
  id: number;
  title: string;
  blocks: ProblemBlock[];
}

export interface ProblemViewerProps {
  problem: Problem;
  loading?: boolean;
}

export default ProblemViewer;
export { EditorModal };
