import { GNB } from '@components';
import { createFileRoute, Outlet } from '@tanstack/react-router';

import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { SelectedStudentProvider } from '@/contexts/SelectedStudentContext';

export const Route = createFileRoute('/_GNBLayout')({
  component: RouteComponent,
});

function LayoutContent() {
  const { isCollapsed } = useSidebar();

  return (
    <div className='flex min-h-screen w-full bg-gray-50'>
      <GNB />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-80'}`}>
        <main
          className={`mx-auto ${isCollapsed ? 'max-w-[100dvw - 20rem]' : 'max-w-[100dvw - 80rem]'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function RouteComponent() {
  return (
    <SidebarProvider>
      <SelectedStudentProvider>
        <LayoutContent />
      </SelectedStudentProvider>
    </SidebarProvider>
  );
}
