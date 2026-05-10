import {
  Activity,
  Bell,
  Calendar,
  ChartNoAxesCombined,
  Circle,
  FileText,
  Megaphone,
  MessageCircle,
  Network,
  Package,
  Settings,
  Tags,
  Users,
} from 'lucide-react';
import { components } from '@schema';

export type AdminMenuName =
  | 'PUBLISH'
  | 'NOTICE'
  | 'NOTIFICATION'
  | 'DIAGNOSIS'
  | 'QNA'
  | 'PROBLEM_ITEM'
  | 'PROBLEM_SET'
  | 'CONCEPT_TAG'
  | 'GRAPH_NODE'
  | 'GRAPH_EDGE'
  | 'GRAPH_ACTION'
  | 'GRAPH_TYPE'
  | 'TEACHER'
  | 'ADMIN_ACCOUNT'
  | 'ADMIN_ROLE';

export type AdminSession = {
  id: number;
  name: string;
  email: string;
  adminType: 'SUPER' | 'ROLE_BASED';
  roleId?: number | null;
  roleName?: string | null;
  accessibleMenus: components['schemas']['AdminMenuResp'][];
};

export type AdminNavItem = {
  menuName: AdminMenuName;
  to: string;
  label: string;
  icon: typeof Calendar;
  routePrefixes: string[];
};

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: '학생 관리',
    items: [
      {
        menuName: 'PUBLISH',
        to: '/publish',
        label: '발행',
        icon: Calendar,
        routePrefixes: ['/publish'],
      },
      {
        menuName: 'NOTICE',
        to: '/notice',
        label: '공지',
        icon: Megaphone,
        routePrefixes: ['/notice'],
      },
      {
        menuName: 'NOTIFICATION',
        to: '/notification',
        label: '알림',
        icon: Bell,
        routePrefixes: ['/notification'],
      },
      {
        menuName: 'DIAGNOSIS',
        to: '/diagnosis',
        label: '학생 진단',
        icon: ChartNoAxesCombined,
        routePrefixes: ['/diagnosis'],
      },
    ],
  },
  {
    title: 'Q&A',
    items: [
      {
        menuName: 'QNA',
        to: '/qna',
        label: 'Q&A',
        icon: MessageCircle,
        routePrefixes: ['/qna'],
      },
    ],
  },
  {
    title: '문제 관리',
    items: [
      {
        menuName: 'PROBLEM_ITEM',
        to: '/problem',
        label: '문제',
        icon: FileText,
        routePrefixes: ['/problem'],
      },
      {
        menuName: 'PROBLEM_SET',
        to: '/problem-set',
        label: '세트',
        icon: Package,
        routePrefixes: ['/problem-set'],
      },
      {
        menuName: 'CONCEPT_TAG',
        to: '/concept-tags',
        label: '개념 태그',
        icon: Tags,
        routePrefixes: ['/concept-tags'],
      },
    ],
  },
  {
    title: '개념 그래프',
    items: [
      {
        menuName: 'GRAPH_NODE',
        to: '/concept-graph/node',
        label: '개념 노드',
        icon: Circle,
        routePrefixes: ['/concept-graph/node'],
      },
      {
        menuName: 'GRAPH_EDGE',
        to: '/concept-graph/edge',
        label: '개념 그래프',
        icon: Network,
        routePrefixes: ['/concept-graph/edge'],
      },
      {
        menuName: 'GRAPH_ACTION',
        to: '/concept-graph/action-edge',
        label: '액션 그래프',
        icon: Activity,
        routePrefixes: ['/concept-graph/action-edge'],
      },
      {
        menuName: 'GRAPH_TYPE',
        to: '/concept-graph/types',
        label: '타입 관리',
        icon: Settings,
        routePrefixes: ['/concept-graph/types'],
      },
    ],
  },
  {
    title: '선생님 관리',
    items: [
      {
        menuName: 'TEACHER',
        to: '/teacher',
        label: '과외 선생 정보',
        icon: Users,
        routePrefixes: ['/teacher'],
      },
    ],
  },
  {
    title: '설정',
    items: [
      {
        menuName: 'ADMIN_ACCOUNT',
        to: '/setting/admins',
        label: '관리자 계정',
        icon: Users,
        routePrefixes: ['/setting/admins', '/admin-user'],
      },
      {
        menuName: 'ADMIN_ROLE',
        to: '/setting/roles',
        label: '역할 관리',
        icon: Settings,
        routePrefixes: ['/setting/roles'],
      },
    ],
  },
];

export const hasMenuPermission = (
  session: AdminSession | null,
  menuName: AdminMenuName | AdminMenuName[]
) => {
  if (!session) return false;
  if (session.adminType === 'SUPER') return true;

  const menuNames = Array.isArray(menuName) ? menuName : [menuName];

  return session.accessibleMenus.some((menu) => {
    return !!menu.name && menuNames.includes(menu.name as AdminMenuName);
  });
};

export const getAccessibleNavSections = (session: AdminSession | null) => {
  return ADMIN_NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => hasMenuPermission(session, item.menuName)),
  })).filter((section) => section.items.length > 0);
};

export const getFirstAccessibleRoute = (session: AdminSession | null) => {
  return getAccessibleNavSections(session)[0]?.items[0]?.to ?? null;
};

export const canAccessPath = (session: AdminSession | null, pathname: string) => {
  if (pathname === '/') return true;

  return ADMIN_NAV_SECTIONS.some((section) =>
    section.items.some((item) => {
      if (!hasMenuPermission(session, item.menuName)) return false;

      return item.routePrefixes.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
      );
    })
  );
};

export const toAdminSession = (data: components['schemas']['AdminTokenResp']): AdminSession => ({
  id: data.id,
  name: data.name,
  email: data.email,
  adminType: data.adminType,
  roleId: data.roleId ?? null,
  roleName: data.roleName ?? null,
  accessibleMenus: data.accessibleMenus ?? [],
});
