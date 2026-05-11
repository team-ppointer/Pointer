import dayjs from 'dayjs';

interface ExpiryBadgeProps {
  expiryAt?: string;
}

const ExpiryBadge = ({ expiryAt }: ExpiryBadgeProps) => {
  const isExpired = !!expiryAt && dayjs().isAfter(expiryAt);

  if (isExpired) {
    return (
      <span className='inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600'>
        만료
      </span>
    );
  }

  return (
    <span className='inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600'>
      활성
    </span>
  );
};

export default ExpiryBadge;
