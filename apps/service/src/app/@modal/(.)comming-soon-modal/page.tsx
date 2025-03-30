'use client';
import { useRouter } from 'next/navigation';

import { BaseModalTemplate, RouteModal } from '@components';

const Page = () => {
  const router = useRouter();

  return (
    <RouteModal>
      <BaseModalTemplate>
        <BaseModalTemplate.Content>
          <BaseModalTemplate.Text text={`현재 준비중인 기능입니다!`} />
        </BaseModalTemplate.Content>
        <BaseModalTemplate.ButtonSection>
          <BaseModalTemplate.Button variant='blue' onClick={() => router.back()}>
            닫기
          </BaseModalTemplate.Button>
        </BaseModalTemplate.ButtonSection>
      </BaseModalTemplate>
    </RouteModal>
  );
};

export default Page;
