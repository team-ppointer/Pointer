# @team-ppointer/pointer-editor-v2

React 19와 TipTap 3 위에 구축된 수학 문제 제작용 에디터/뷰어 컴포넌트 모음입니다. 수식 편집, 이미지
업로드·OCR, 답안 박스, 모바일 대응 툴바 등 Math Pointer 서비스에서 사용 중인 편의 기능들을 그대로
제공합니다.

## 주요 특징

- **문제 편집기 `ProblemEditor`**: TipTap 기반 리치 텍스트/수식 편집기. 변경 사항을 `TiptapPayload`
  형태로 전달합니다.
- **문제 뷰어 `ProblemViewer`**: JSON 또는 HTML 콘텐츠를 안전하게 표시하는 전용 뷰어.
- **모달 프로바이더 `PointerEditorModalProvider`**: 글로벌 상태(Zustand)를 이용해 모달 형태의
  에디터를 쉽게 띄우고 결과를 Promise 로 수신합니다.
- **수학/과학 특화 기능**: KaTeX 기반 수식, Mathpix OCR 연동(선택), 답안 박스, 리스트, 하이라이터,
  테이블 등 제공.
- **이미지 업로드 유틸**: S3 업로드를 위한 `getFileUploadUrl`, `uploadFileToS3` API 유틸 포함.

## 설치

```bash
pnpm add @team-ppointer/pointer-editor-v2
# 또는
npm install @team-ppointer/pointer-editor-v2
```

React 19 및 React DOM 19 이상이 피어 의존성으로 필요합니다.

## 빠른 시작

### 에디터/뷰어 렌더링

```tsx
'use client';

import { useState } from 'react';
import { ProblemEditor, ProblemViewer, type TiptapPayload } from '@team-ppointer/pointer-editor-v2';
import '@team-ppointer/pointer-editor-v2/style.css';

export default function Example() {
  const [payload, setPayload] = useState<TiptapPayload | null>(null);

  return (
    <div className='grid gap-6'>
      <ProblemEditor initialJSON={payload?.json} onChange={setPayload} />
      <ProblemViewer content={payload?.json ?? ''} />
    </div>
  );
}
```

### 모달형 에디터 사용하기

```tsx
'use client';

import {
  PointerEditorModalProvider,
  usePointerEditorModal,
} from '@team-ppointer/pointer-editor-v2';

function EditorButton() {
  const { open } = usePointerEditorModal();

  const handleClick = async () => {
    const result = await open({
      initialJSON: null,
      ocrApiCall: (body) =>
        fetch('/api/ocr', { method: 'POST', body: JSON.stringify(body) }).then((r) => r.json()),
    });

    if (result) {
      console.log('저장된 데이터', result);
    }
  };

  return <button onClick={handleClick}>문제 작성</button>;
}

export default function Page() {
  return (
    <>
      <EditorButton />
      <PointerEditorModalProvider />
    </>
  );
}
```

## 내보내는 모듈

- `ProblemEditor`
  - `initialJSON?: Record<string, unknown>`: TipTap JSON 초기값.
  - `onChange: (payload: TiptapPayload) => void`: 변경 시마다 호출. 디바운스(300ms) 적용.
  - `useContainerPortal?: boolean`(기본값 `true`): 툴팁/팝오버를 에디터 컨테이너에 포탈.
  - `ocrApiCall?: (data: any) => Promise<any>`: Mathpix OCR API 래퍼. 제공 시 OCR 버튼 활성화.
- `ProblemViewer`
  - `content: Record<string, unknown> | string`: TipTap JSON 또는 HTML 문자열.
- `PointerEditorModalProvider`
- `usePointerEditorModal`
  - `open(props: { initialJSON?: any; ocrApiCall?: (data: any) => Promise<any> | null; }) => Promise<TiptapPayload | null>`
- `type TiptapPayload`
  - `{ json: any; text: string; excerpt?: string }`

## 스타일링

- 패키지는 `@team-ppointer/pointer-editor-v2/style.css` 를 제공하며 내부에서 SCSS 변수와
  애니메이션을 불러옵니다.
- 기본 폰트/색상은 Tailwind + custom SCSS 조합 기반입니다. 필요 시 상위 프로젝트에서 CSS 변수를
  재정의하거나 추가 스타일을 덮어쓰면 됩니다.

## OCR 연동

- `ocrApiCall` 인자로 Mathpix 또는 사내 OCR API를 호출하는 함수를 전달하면 OCR 버튼이 노출됩니다.
- Vite 환경에서 직접 Mathpix API를 호출하려면 `.env.local` 에 `VITE_MATHPIX_APP_ID`,
  `VITE_MATHPIX_API_KEY` 를 설정하고 `ocrApiCall` 구현에서 활용하세요.

## 개발 & 빌드 스크립트

```bash
pnpm install
pnpm lint
pnpm check-types
pnpm build
```

빌드 결과는 `dist/` 폴더에 CommonJS, ESM, 타입 정의로 출력됩니다. 배포 전에는 `pnpm build` 가 자동
실행됩니다.

## 라이선스

패키지에 포함된 `LICENSE` 파일을 참고하세요.
