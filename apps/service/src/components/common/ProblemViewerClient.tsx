'use client';

import dynamic from 'next/dynamic';

const ProblemViewer = dynamic(
  () =>
    import('@team-ppointer/pointer-editor-v2').then(
      (mod) => mod.ProblemViewer,
    ),
  {
    ssr: false, // ★ 서버 렌더링에서는 이 컴포넌트 로딩 자체를 안 함
  },
);

export default ProblemViewer;