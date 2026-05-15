import {
  Activity,
  Bell,
  Calendar,
  ChartNoAxesCombined,
  Circle,
  ClipboardList,
  FileText,
  Layers,
  ListChecks,
  Megaphone,
  MessageCircle,
  Network,
  NotebookPen,
  Package,
  Settings,
  Sparkles,
  Tags,
  Users,
} from 'lucide-react';
import { components } from '@schema';

export type AdminMenuName =
  | 'PUBLISH'
  | 'NOTICE'
  | 'NOTIFICATION'
  | 'DIAGNOSIS'
  | 'MOCK_EXAM_RESULT'
  | 'MOCK_EXAM_TYPE'
  | 'FOCUS_CARD_ISSUANCE'
  | 'QNA'
  | 'DAILY_COMMENT'
  | 'PROBLEM_ITEM'
  | 'PROBLEM_SET'
  | 'CONCEPT_TAG'
  | 'FOCUS_CARD'
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
    title: '개별 학생 관리',
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
      {
        menuName: 'MOCK_EXAM_RESULT',
        to: '/mock-exam-results',
        label: '모의고사 정오답 및 질문',
        icon: ClipboardList,
        routePrefixes: ['/mock-exam-results'],
      },
      {
        menuName: 'MOCK_EXAM_TYPE',
        to: '/mock-exam-types',
        label: '모의고사 타입 관리',
        icon: ListChecks,
        routePrefixes: ['/mock-exam-types'],
      },
    ],
  },
  {
    title: '전체 학생 관리',
    items: [
      {
        menuName: 'QNA',
        to: '/qna',
        label: 'Q&A',
        icon: MessageCircle,
        routePrefixes: ['/qna'],
      },
      {
        menuName: 'DAILY_COMMENT',
        to: '/daily-comments',
        label: '당신만을 위한 코멘트',
        icon: NotebookPen,
        routePrefixes: ['/daily-comments'],
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
    title: '집중학습',
    items: [
      {
        menuName: 'FOCUS_CARD',
        to: '/focus-card',
        label: '집중학습 카드',
        icon: Sparkles,
        routePrefixes: ['/focus-card'],
      },
      {
        menuName: 'FOCUS_CARD_ISSUANCE',
        to: '/focus-card/issuance',
        label: '집중학습 카드 발급',
        icon: Layers,
        routePrefixes: ['/focus-card/issuance'],
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

// 현재 pathname 에 대해 가장 구체적(prefix 가 가장 긴) routePrefix 를 가진 nav item 을 반환.
// 그렇지 않으면 `/focus-card` 가 `/focus-card/issuance` 까지 흡수해 권한 누수/active 표시 중복이 발생한다.
export const getMostSpecificNavItem = (pathname: string): AdminNavItem | null => {
  const matches: { item: AdminNavItem; prefix: string }[] = [];
  ADMIN_NAV_SECTIONS.forEach((section) => {
    section.items.forEach((item) => {
      item.routePrefixes.forEach((prefix) => {
        if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
          matches.push({ item, prefix });
        }
      });
    });
  });

  if (matches.length === 0) return null;

  matches.sort((a, b) => b.prefix.length - a.prefix.length);
  return matches[0].item;
};

export const canAccessPath = (session: AdminSession | null, pathname: string) => {
  if (pathname === '/') return true;
  const item = getMostSpecificNavItem(pathname);
  if (!item) return false;
  return hasMenuPermission(session, item.menuName);
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
