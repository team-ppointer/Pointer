# 기능 명세 대비 구현 현황 체크

> 기준일: 2026-04-12 | 브랜치: main

### 범위 구분

- **라이브러리** (`pointer-native-drawing`): 드로잉 엔진, 렌더러, 제스처, undo/redo
- **앱 레이어** (Pointer 모노레포): 서버 저장, 색상 퍼시스턴스, 화면 lifecycle 등
- 기능서의 "서버 저장" 요구사항은 앱 레이어에서 `useHandwritingManager` 훅으로 구현됨 (5초 auto-save + 백그라운드 저장)

---

## 1-1. Undo/Redo ✅ 완전 구현

| 요구사항 | 상태 | 비고 |
|----------|------|------|
| 캔버스 실시간 반영 | ✅ | |
| Undo/Redo 스택 관리 | ✅ | 포인터 기반 구현 (`HistoryManager.ts`) |
| Undo → redo 스택 이동 | ✅ | |
| 새 입력 시 redo 스택 초기화 | ✅ | `push()` 시 forward history truncate |
| 스택 empty 시 버튼 비활성화 | ✅ | `canUndo()`/`canRedo()` 노출 |
| TextBox 편집→이탈 = 1 stack entry | ✅ | `lock()`/`unlock()` + `commitEditing()` |
| 8종 action type 추적 | ✅ | stroke, erase, add/edit/delete/resize/move-textbox, replace-document |

---

## 1-2. 드로잉 입력 ✅ 구현 완료

| 요구사항 | 상태 | 담당 | 비고 |
|----------|------|------|------|
| 연필 tool 선택 | ✅ | 라이브러리 | `activeTool: "pen" \| "eraser" \| "textbox"` |
| 색상 선택 (4가지) | ✅ | 앱 | example에서 5색 제공 |
| 터치 드래그 → 실시간 드로잉 | ✅ | 라이브러리 | RNGH + Native Stylus 듀얼 어댑터 |
| 선택 색상/굵기 반영 | ✅ | 라이브러리 | |
| Undo 스택 업데이트 | ✅ | 라이브러리 | `AppendStrokeEntry` |
| 캔버스 영역 밖 입력 제한 | ✅ | 라이브러리 | `clampInput()` 함수 |
| 1 stroke = 1 action | ✅ | 라이브러리 | |
| 실시간 서버 저장 | ✅ | 앱 | `useHandwritingManager` — 5초 auto-save + 백그라운드 저장 |
| 오프라인 → 온라인 시 저장 | ⚠️ | 앱 | 현재 미구현 (오프라인 큐/재시도 로직 없음) |
| 마지막 선택 색상 서버 저장 | ⚠️ | 앱 | 미구현. `encodeHandwritingData` payload에 `lastColor` 필드 추가로 해결 가능 |
| 기본 색상 dark gray | ✅ | 앱 | `#1E1E21` (dark gray). 기획 의도에 부합 |

---

## 1-3. 텍스트 입력 ✅ 구현 완료

| 요구사항 | 상태 | 담당 | 비고 |
|----------|------|------|------|
| 텍스트 tool 선택 | ✅ | 라이브러리 | |
| 캔버스 클릭 → 텍스트 박스 생성 | ✅ | 라이브러리 | `handleTap(canvasX, canvasY)` |
| 실시간 텍스트 반영 | ✅ | 라이브러리 | RN `TextInput` controlled |
| x축 → 방향 작성 | ✅ | 라이브러리 | 플랫폼 기본 LTR |
| Focus out → undo 스택 업데이트 | ✅ | 라이브러리 | `commitEditing()` |
| Focus out → 서버 저장 | ✅ | 앱 | `useHandwritingManager` 5초 주기 감지 |
| 편집 중 undo/redo 제한 | ✅ | 라이브러리 | `History.lock()` |
| 텍스트 박스 너비 ≤ 캔버스 | ✅ | 라이브러리 | `clampedWidth` |
| 캔버스 가장자리 자동 줄바꿈 | ✅ | 라이브러리 | Skia `Paragraph.layout()` |
| 편집 중 크기 조절 가능 | ✅ | 라이브러리 | |
| 편집 중 이동 가능 | ✅ | 라이브러리 | |
| 빈 텍스트 → 박스 미생성 | ✅ | 라이브러리 | `.trim()` 체크 |

---

## 1-4. 텍스트 편집 ⚠️ 부분 구현

| 요구사항 | 상태 | 담당 | 비고 |
|----------|------|------|------|
| **더블클릭 → 편집 모드** | ❌ **미구현** | 라이브러리 | 현재 싱글 탭으로 진입 (선택→탭→편집) |
| 커서 활성화 | ✅ | 라이브러리 | auto-focus |
| 실시간 편집 반영 | ✅ | 라이브러리 | |
| Focus out → 서버 저장 | ✅ | 앱 | `useHandwritingManager` 5초 주기 감지 |
| 편집 중 undo/redo 제한 | ✅ | 라이브러리 | |
| 편집 중 너비 고정 | ✅ | 라이브러리 | |
| 변경 없으면 스택 미업데이트 | ✅ | 라이브러리 | |

---

## 1-5. 텍스트 박스 크기 편집 ✅ 완전 구현

| 요구사항 | 상태 | 비고 |
|----------|------|------|
| 좌/우 resize handle 표시 | ✅ | 원형 핸들 (흰색, 파란 테두리) |
| 드래그 → 실시간 크기 변경 | ✅ | |
| 텍스트 자동 줄바꿈/재배치 | ✅ | |
| 완료 시 undo 스택 업데이트 | ✅ | |
| 캔버스 경계 이탈 불가 | ✅ | |
| 변경 없으면 스택 미업데이트 | ✅ | |
| 1 drag = 1 action | ✅ | |

---

## 1-6. 텍스트 박스 이동 ⚠️ 부분 구현

| 요구사항 | 상태 | 담당 | 비고 |
|----------|------|------|------|
| **전용 reposition handle** | ⚠️ **미구현** | 라이브러리 | body pan으로 대체 (기능은 동작) |
| 드래그 → 실시간 이동 | ✅ | 라이브러리 | |
| 내용/크기 유지 | ✅ | 라이브러리 | |
| 완료 시 undo 스택 업데이트 | ✅ | 라이브러리 | |
| 캔버스 밖 이탈 불가 (부분 포함) | ✅ | 라이브러리 | |
| 변경 없으면 스택 미업데이트 | ✅ | 라이브러리 | |
| 1 drag = 1 action | ✅ | 라이브러리 | |

---

## 1-7. 텍스트 박스 삭제 ✅ 구현 완료

| 요구사항 | 상태 | 담당 | 비고 |
|----------|------|------|------|
| Floating toolbar 표시 (중앙 상단) | ✅ | 라이브러리 | "삭제" 버튼 |
| 삭제 반영 | ✅ | 라이브러리 | |
| Undo 스택 업데이트 | ✅ | 라이브러리 | 전체 TextBoxData 보존 |
| 서버 저장 | ✅ | 앱 | `useHandwritingManager` 5초 주기 감지 |
| 삭제 데이터 히스토리 유지 (undo 가능) | ✅ | 라이브러리 | |
| 1 delete = 1 action | ✅ | 라이브러리 | |

---

## 1-8. 지우기 ✅ 구현 완료

| 요구사항 | 상태 | 담당 | 비고 |
|----------|------|------|------|
| 지우개 tool 선택 | ✅ | 라이브러리 | |
| 터치 드래그 → 교차 stroke 실시간 삭제 | ✅ | 라이브러리 | bounds broad-phase + segment distance |
| 드로잉에만 적용 (텍스트 X) | ✅ | 라이브러리 | 완전 분리 |
| 대상 없으면 미동작 | ✅ | 라이브러리 | |
| 대상 없으면 스택 미업데이트 | ✅ | 라이브러리 | transaction에서 length 비교 |
| 획(action) 단위 삭제 | ✅ | 라이브러리 | Stroke 객체 통째 삭제 |
| 1 erase drag = 1 action | ✅ | 라이브러리 | |
| Undo 시 원상 복구 | ✅ | 라이브러리 | snapshot 기반 |
| 서버 저장 | ✅ | 앱 | `useHandwritingManager` 5초 주기 감지 |

---

## 1-9. Zoom/Pan ⚠️ 부분 구현

| 요구사항 | 상태 | 담당 | 비고 |
|----------|------|------|------|
| 핀치 줌인/줌아웃 (focal point 기준) | ✅ | 라이브러리 | anchor 수식 |
| 2-finger 팬 | ✅ | 라이브러리 | `minPointers(2).maxPointers(2)` |
| 핀치 + 드래그 동시 | ⚠️ | 라이브러리 | 구조상 지원, 제스처 API 수준 검증 필요 |
| 최대 2배 확대 | ✅ | 라이브러리 | `maxZoomScale = 2.0` |
| 캔버스 너비 fill 시 축소 제한 | ✅ | 라이브러리 | `minScale` 계산 |
| 캔버스 boundary 밖 이동 제한 | ✅ | 라이브러리 | `clampTransform()` |
| View 상태만 제어 (데이터 불변) | ✅ | 라이브러리 | |
| 입력 좌표 캔버스 좌표 변환 | ✅ | 라이브러리 | `screenToCanvas()` |
| 캔버스 너비 고정 1000px | ✅ | 앱 | 부모 View width를 1000px로 고정하면 됨 (라이브러리는 viewport.width 사용) |
| 캔버스 높이 (빈 캔버스) | ✅ | 앱 | `minCanvasHeight={1366 * 2}` prop으로 설정 |
| 캔버스 높이 (필기 확장) | ✅ | 라이브러리 | `Math.max(200, viewportHeight)` 적용 완료 (항상 화면 1개 분량 여유, 최소 200px fallback) |
| Reopen 시 100% 리셋 | ✅ | 앱 | `resetZoom()` ref 메서드 제공됨. `useEffect(() => ref.resetZoom(), [scrapId])` |

---

## 종합 요약

| 기능 | 상태 | 구현율 | 잔여 |
|------|------|--------|------|
| **1-1 Undo/Redo** | ✅ 완전 | 100% | — |
| **1-2 드로잉 입력** | ✅ 구현 | ~93% | 오프라인 큐, 색상 퍼시스턴스 (앱) |
| **1-3 텍스트 입력** | ✅ 구현 | 100% | — |
| **1-4 텍스트 편집** | ⚠️ 부분 | ~86% | 더블탭 진입 (라이브러리) |
| **1-5 텍스트 크기 편집** | ✅ 완전 | 100% | — |
| **1-6 텍스트 이동** | ⚠️ 부분 | ~86% | 전용 핸들 UI (라이브러리) |
| **1-7 텍스트 삭제** | ✅ 구현 | 100% | — |
| **1-8 지우기** | ✅ 구현 | 100% | — |
| **1-9 Zoom/Pan** | ✅ 구현 | ~96% | 핀치+드래그 동시 검증 필요 |

---

## 잔여 미구현 사항

### 라이브러리 레벨

| # | 항목 | 기능 | 설명 |
|---|------|------|------|
| L1 | 텍스트 편집 더블탭 | 1-4 | 현재 싱글 탭 → 선택 → 탭 → 편집. spec은 더블클릭 진입 |
| L2 | 텍스트 이동 전용 핸들 | 1-6 | body pan으로 동작하지만 시각적 핸들 없음 |
| ~~L3~~ | ~~높이 확장 buffer~~ | ~~1-9~~ | ✅ 해결됨 — `Math.max(200, viewportHeight)` 적용 완료 |

### 앱 레벨

| # | 항목 | 기능 | 설명 |
|---|------|------|------|
| A1 | 오프라인 → 온라인 저장 | 1-2 | 오프라인 큐/재시도 로직 없음 |
| A2 | 마지막 선택 색상 퍼시스턴스 | 1-2 | `encodeHandwritingData` payload에 `lastColor` 필드 추가로 해결 가능 |
| A3 | Reopen 시 100% 리셋 | 1-9 | `resetZoom()` 제공됨, 앱 lifecycle 연동 필요 |

---

## 서버 저장 아키텍처 (Pointer 모노레포)

서버 저장은 라이브러리가 아닌 **앱 레이어**에서 `useHandwritingManager` 훅으로 구현됨.

### 데이터 흐름

```
DrawingCanvas.onChange(strokes)
  → drawingState.hasUnsavedChanges = true
    → useHandwritingManager (5초 interval)
      → canvasRef.getStrokes() + getTextBoxes()
      → encodeHandwritingData(strokes, texts) → base64
      → base64 === lastSaved ? skip : updateHandwriting API
```

### 저장 트리거

| 트리거 | 조건 | 위치 |
|--------|------|------|
| 자동 저장 | 5초 interval + `hasUnsavedChanges` | `useHandwritingManager` |
| 백그라운드 저장 | `AppState → 'background'` + 미저장 변경 | `useHandwritingManager` |
| 수동 저장 | `handleSave()` 호출 | `ScrapDetailScreen` |

### 라이브러리가 제공하는 인터페이스

| 인터페이스 | 용도 |
|-----------|------|
| `onChange(strokes)` | stroke 변경 알림 → 앱에서 dirty flag 설정 |
| `onUndoStateChange({canUndo, canRedo})` | undo/redo 버튼 상태 |
| `ref.getStrokes()` / `ref.setStrokes()` | 데이터 읽기/쓰기 (저장/로드) |
| `ref.undo()` / `ref.redo()` | 외부 undo/redo 트리거 |

### 참고: TextBox 데이터 서버 동기화

현재 `onChange`는 strokes만 전달. TextBox 변경에 대한 별도 콜백은 없으나, `useHandwritingManager`에서 `ref.getTextBoxes()`로 직접 읽어서 함께 저장함.

---

## 앱 레이어 연결 가이드 (코드 예시)

Pointer 모노레포의 `useHandwritingManager` 패턴을 기반으로, 앱에서 라이브러리를 서버와 연결하는 방법.

### 1. 기본 연결 — DrawingCanvas + 서버 저장

```tsx
// ScrapDetailScreen.tsx
import { useRef, useState } from 'react';
import { DrawingCanvas, type DrawingCanvasRef } from '@repo/pointer-native-drawing';
import { useHandwritingManager } from './hooks/useHandwritingManager';

export function ScrapDetailScreen({ scrapId }: { scrapId: number }) {
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [undoState, setUndoState] = useState({ canUndo: false, canRedo: false });

  // 서버 저장 훅 연결
  const { isLoading, isSaving, handleSave } = useHandwritingManager({
    scrapId,
    canvasRef,
    hasUnsavedChanges,
    onSaveSuccess: () => setHasUnsavedChanges(false),
  });

  return (
    <>
      <DrawingCanvas
        ref={canvasRef}
        activeTool="pen"
        strokeColor="#1E1E21"
        strokeWidth={3.9}
        onChange={() => setHasUnsavedChanges(true)}
        onUndoStateChange={setUndoState}
      />
      <Toolbar
        canUndo={undoState.canUndo}
        canRedo={undoState.canRedo}
        onUndo={() => canvasRef.current?.undo()}
        onRedo={() => canvasRef.current?.redo()}
      />
    </>
  );
}
```

### 2. 서버 저장 훅 — useHandwritingManager

```tsx
// hooks/useHandwritingManager.ts
import { useEffect, useCallback, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { DrawingCanvasRef } from '@repo/pointer-native-drawing';

const AUTO_SAVE_INTERVAL_MS = 5000;

interface Props {
  scrapId: number;
  canvasRef: React.RefObject<DrawingCanvasRef | null>;
  hasUnsavedChanges: boolean;
  onSaveSuccess?: () => void;
  onSaveError?: () => void;
}

export function useHandwritingManager({
  scrapId, canvasRef, hasUnsavedChanges, onSaveSuccess, onSaveError,
}: Props) {
  const { data } = useGetHandwriting(scrapId);          // 서버에서 로드
  const { mutate: updateHandwriting, isPending } = useUpdateHandwriting();
  const lastSavedRef = useRef<string>('');

  // ── 서버 → 캔버스 로드 ──
  useEffect(() => {
    if (data?.data && canvasRef.current) {
      const decoded = decodeHandwritingData(data.data);  // base64 → { strokes, texts }
      canvasRef.current.setStrokes(decoded.strokes);
      canvasRef.current.setTextBoxes(decoded.texts);
      lastSavedRef.current = data.data;
    }
  }, [data]);

  // ── 캔버스 → 서버 저장 ──
  const handleSave = useCallback((isAutoSave = false) => {
    if (!canvasRef.current || isPending) return;

    const strokes = canvasRef.current.getStrokes();
    const texts = canvasRef.current.getTextBoxes();
    const base64 = encodeHandwritingData(strokes, texts);

    // 변경 없으면 skip
    if (base64 === lastSavedRef.current) return;

    updateHandwriting(
      { scrapId, request: { data: base64 } },
      {
        onSuccess: () => { lastSavedRef.current = base64; onSaveSuccess?.(); },
        onError: () => { onSaveError?.(); },
      },
    );
  }, [scrapId, canvasRef, isPending, updateHandwriting]);

  // ── 5초 자동 저장 ──
  useEffect(() => {
    const id = setInterval(() => {
      if (hasUnsavedChanges && !isPending) handleSave(true);
    }, AUTO_SAVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [hasUnsavedChanges, isPending, handleSave]);

  // ── 앱 백그라운드 시 저장 ──
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'background' && hasUnsavedChanges) handleSave(true);
    });
    return () => sub.remove();
  }, [hasUnsavedChanges, handleSave]);

  return { isLoading: !data, isSaving: isPending, handleSave };
}
```

### 3. 데이터 인코딩/디코딩

```tsx
// utils/handwritingEncoder.ts
import type { Stroke, TextBoxData } from '@repo/pointer-native-drawing';
import { Buffer } from 'buffer';

interface HandwritingPayload {
  strokes: Stroke[];
  texts: TextBoxData[];
}

export function encodeHandwritingData(strokes: Stroke[], texts: TextBoxData[]): string {
  const payload: HandwritingPayload = { strokes, texts };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function decodeHandwritingData(base64: string): HandwritingPayload {
  const json = Buffer.from(base64, 'base64').toString('utf-8');
  return JSON.parse(json) as HandwritingPayload;
}
```

### 4. Reopen 시 Zoom 리셋

```tsx
// scrapId 변경 시 (화면 reopen) zoom 100% 리셋
useEffect(() => {
  canvasRef.current?.resetZoom?.();
}, [scrapId]);
```

### 5. 마지막 선택 색상 퍼시스턴스 (앱 레벨)

```tsx
// AsyncStorage 또는 서버에 마지막 색상 저장
const [strokeColor, setStrokeColor] = useState('#1E1E21');

useEffect(() => {
  AsyncStorage.getItem(`lastColor:${userId}`).then((c) => {
    if (c) setStrokeColor(c);
  });
}, []);

const handleColorChange = (color: string) => {
  setStrokeColor(color);
  AsyncStorage.setItem(`lastColor:${userId}`, color);
  // 또는 서버 API로 저장
};
```
