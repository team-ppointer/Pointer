import { ReportProvider } from '@contexts';

const ReportLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <ReportProvider>{children}</ReportProvider>;
};

export default ReportLayout;
