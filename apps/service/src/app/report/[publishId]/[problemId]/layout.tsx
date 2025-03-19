import { ReportProvider } from '@contexts/ReportContext';

const ReportLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <ReportProvider>{children}</ReportProvider>;
};

export default ReportLayout;
