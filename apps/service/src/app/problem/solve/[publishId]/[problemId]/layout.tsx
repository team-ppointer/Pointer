import { ProblemProvider } from '@contexts';

const ChildProblemLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <ProblemProvider>{children}</ProblemProvider>;
};

export default ChildProblemLayout;
