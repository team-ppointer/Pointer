'use client';

import { ChildProblemProvider } from '@contexts';

const ChildProblemLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <ChildProblemProvider>{children}</ChildProblemProvider>;
};

export default ChildProblemLayout;
