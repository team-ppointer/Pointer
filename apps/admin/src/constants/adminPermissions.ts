import {
  Bell,
  Calendar,
  ChartNoAxesCombined,
  FileText,
  Megaphone,
  MessageCircle,
  Package,
  PanelsTopLeft,
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
  | 'GRAPH'
  | 'QNA'
  | 'PROBLEM'
  | 'PROBLEM_ITEM'
  | 'PROBLEM_SET'
  | 'CONCEPT_TAG'
  | 'TEACHER'
  | 'SETTING'
  | 'ADMIN_ACCOUNT'
  | 'ADMIN_ROLE'
  | 'ADMIN_MENU';

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
  menuName?: AdminMenuName;
  items: AdminNavItem[];
};

type AdditionalRoutePermission = {
  menuName: AdminMenuName | AdminMenuName[];
  routePrefixes: string[];
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
    menuName: 'PROBLEM',
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
    menuName: 'SETTING',
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
      {
        menuName: 'ADMIN_MENU',
        to: '/setting/menus',
        label: '메뉴 관리',
        icon: PanelsTopLeft,
        routePrefixes: ['/setting/menus'],
      },
    ],
  },
];

const ADDITIONAL_ROUTE_PERMISSIONS: AdditionalRoutePermission[] = [
  {
    menuName: 'GRAPH',
    routePrefixes: ['/concept-graph'],
  },
];

const ALL_MENU_NAMES = new Set([
  ...ADMIN_NAV_SECTIONS.flatMap((section) => [
    ...(section.menuName ? [section.menuName] : []),
    ...section.items.map((item) => item.menuName),
  ]),
  ...ADDITIONAL_ROUTE_PERMISSIONS.flatMap((permission) =>
    Array.isArray(permission.menuName) ? permission.menuName : [permission.menuName]
  ),
]);

const getAllowedMenuNames = (item: AdminNavItem, section?: AdminNavSection) => {
  return section?.menuName ? [item.menuName, section.menuName] : [item.menuName];
};

export const isAdminMenuName = (name?: string): name is AdminMenuName => {
  return !!name && ALL_MENU_NAMES.has(name as AdminMenuName);
};

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
    items: section.items.filter((item) =>
      hasMenuPermission(session, getAllowedMenuNames(item, section))
    ),
  })).filter((section) => section.items.length > 0);
};

export const getFirstAccessibleRoute = (session: AdminSession | null) => {
  const navRoute = getAccessibleNavSections(session)[0]?.items[0]?.to;
  if (navRoute) return navRoute;

  // GNB 메뉴에 노출되지 않지만 ADDITIONAL_ROUTE_PERMISSIONS 로만 권한을 가진
  // 사용자도 첫 접근 가능 경로를 가질 수 있도록 fallback 처리
  const additional = ADDITIONAL_ROUTE_PERMISSIONS.find((permission) =>
    hasMenuPermission(session, permission.menuName)
  );
  return additional?.routePrefixes[0] ?? null;
};

export const canAccessPath = (session: AdminSession | null, pathname: string) => {
  if (pathname === '/') return true;

  return (
    ADMIN_NAV_SECTIONS.some((section) =>
      section.items.some((item) => {
        if (!hasMenuPermission(session, getAllowedMenuNames(item, section))) return false;

        return item.routePrefixes.some(
          (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
        );
      })
    ) ||
    ADDITIONAL_ROUTE_PERMISSIONS.some((permission) => {
      if (!hasMenuPermission(session, permission.menuName)) return false;

      return permission.routePrefixes.some(
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
