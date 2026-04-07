import { type FC, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { XIcon } from 'lucide-react-native';

import { type components } from '@schema';
import { Container } from '@components/common';
import { colors } from '@theme/tokens';

type ProblemProgress = NonNullable<components['schemas']['ProblemWithStudyInfoResp']['progress']>;

const STATUS_META: Partial<
  Record<
    ProblemProgress,
    {
      label: string;
      textClass: string;
      backgroundClass: string;
    }
  >
> = {
  CORRECT: {
    label: '정답',
    textClass: 'text-blue-500',
    backgroundClass: 'bg-blue-500/20',
  },
  INCORRECT: {
    label: '오답',
    textClass: 'text-red-500',
    backgroundClass: 'bg-red-500/20',
  },
};

type HeaderRootProps = {
  children?: ReactNode;
  onClose?: () => void;
  className?: string;
  contentClassName?: string;
};

type TitleVariant = 'primary' | 'secondary' | 'accent';

const TITLE_STYLE: Record<TitleVariant, string> = {
  primary: 'text-20b text-gray-900',
  secondary: 'text-20r text-gray-900',
  accent: 'text-20b text-primary-600',
};

const HeaderRoot = ({
  children,
  onClose,
  className = '',
  contentClassName = '',
}: HeaderRootProps) => {
  const paddingClass = onClose ? 'pr-[56px]' : '';

  return (
    <Container className={className}>
      <View className={`relative justify-center py-[14px] ${contentClassName}`}>
        <View className={`gap-[4px] ${paddingClass}`}>{children}</View>
        {onClose && (
          <Pressable
            accessibilityRole='button'
            hitSlop={8}
            className='absolute right-0 size-[48px] items-center justify-center'
            onPress={onClose}>
            <XIcon color={colors.black} />
          </Pressable>
        )}
      </View>
    </Container>
  );
};

const Subtitle = ({ children, className = '' }: { children: ReactNode; className?: string }) =>
  children ? <Text className={`text-18m text-gray-700 ${className}`}>{children}</Text> : null;

const TitleGroup = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <View className={`flex-row items-center gap-[10px] ${className}`}>{children}</View>
);

type TitleProps = {
  children: ReactNode;
  variant?: TitleVariant;
  className?: string;
};

const Title = ({ children, variant = 'primary', className = '' }: TitleProps) => {
  if (!children) {
    return null;
  }
  return <Text className={`${TITLE_STYLE[variant]} ${className}`}>{children}</Text>;
};

const Status = ({ status }: { status?: ProblemProgress | null }) => {
  if (!status) {
    return null;
  }
  const meta = STATUS_META[status];
  if (!meta) {
    return null;
  }
  return (
    <View className={`h-[24px] justify-center rounded-[4px] px-[6px] ${meta.backgroundClass}`}>
      <Text className={`text-14m ${meta.textClass}`}>{meta.label}</Text>
    </View>
  );
};

type HeaderComponent = FC<HeaderRootProps> & {
  Subtitle: typeof Subtitle;
  TitleGroup: typeof TitleGroup;
  Title: typeof Title;
  Status: typeof Status;
};

const Header = HeaderRoot as HeaderComponent;

Header.Subtitle = Subtitle;
Header.TitleGroup = TitleGroup;
Header.Title = Title;
Header.Status = Status;

export default Header;
