import { Link } from '@tanstack/react-router';

const TABS = [
  { to: '/concept-graph/node', label: '개념 노드' },
  { to: '/concept-graph/edge', label: '개념 엣지' },
  { to: '/concept-graph/action-edge', label: '액션 그래프' },
  { to: '/concept-graph/types', label: '타입 관리' },
] as const;

const ConceptGraphTabs = () => {
  return (
    <div className='border-b border-gray-200 bg-white px-8'>
      <nav className='flex gap-2'>
        {TABS.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            className='relative inline-flex h-12 items-center px-4 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-800'
            activeProps={{
              className:
                'relative inline-flex h-12 items-center px-4 text-sm font-semibold text-main after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-main',
            }}>
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default ConceptGraphTabs;
