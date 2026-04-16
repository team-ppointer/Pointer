# PR #262 리뷰 수정 계획

## Issue 1: tsc error — onUndo/onRedo optional vs required

**파일**: `DrawingToolbar.tsx`, `ProblemDrawingToolbar.tsx`
**수정**: `onUndo?`/`onRedo?` → `onUndo`/`onRedo` (required)
**이유**: 호출부(ScrapDetailScreen, ProblemScreen)가 항상 값을 넘기므로 optional 불필요
**위험도**: 없음

## Issue 2: 텍스트 박스 dirty 미반영 (데이터 유실)

**문제**: useTextBoxManager가 텍스트 추가/편집/삭제/이동/리사이즈 시 historyRef.push()만 하고 onChange를 트리거하지 않음. 백그라운드 전환 시 autosave 미작동.

**수정**:
1. `DrawingCanvasProps`에 `onDirty?: () => void` 추가
2. `useTextBoxManager`에 `onDirty` 콜백 전달
3. textbox mutation 시점(commitEditing, endMove, endResize, deleteSelected)에서 onDirty 호출
4. `useDrawingDocumentController`의 stroke 변경(notifyChange)에서도 onDirty 호출
5. `ScrapDetailScreen`: `onChange={drawingState.markAsUnsaved}` → `onDirty={drawingState.markAsUnsaved}`로 교체

**예상 문제 검토**:
- 편집 중 백그라운드: updateEditingText가 setTextBoxes로 실시간 반영하므로 getTextBoxes()는 현재 텍스트 포함. 저장 안전.
- onDirty 호출 빈도: commit/end 단위로만 호출. autosave는 5초 interval이라 무관.
- 기존 onChange: stroke 데이터 전달용으로 유지. onDirty는 dirty flag 전용.

**위험도**: 낮음

## Issue 3: minCanvasHeight 고정값 주석

**수정**: 주석 추가 완료 (ProblemScreen.tsx:503)

## Issue 4: Metro Skia dedupe (false positive)

**결론**: 수정 불필요. 소스 번들링(react-native 필드) + peerDep이므로 중복 번들 발생 안 함.
Codex도 동의.

---

## 후속 작업 (이 PR 범위 밖)

### TODO: ProblemScreen.tsx — runOnJS deprecated 교체
- **파일**: `apps/native/src/features/student/problem/screens/ProblemScreen.tsx`
- **위치**: line 16 (import), line 183, line 202
- **원인**: reanimated 4.x에서 `runOnJS` deprecated. develop에서 `@typescript-eslint/no-deprecated` 룰 활성화되어 lint 에러 발생 예정
- **수정 방향**: `useAnimatedReaction` 콜백 내부에서 `runOnJS` 대신 reanimated 4.x 권장 방식으로 교체
- **코드 주석**: 해당 import 라인에 TODO 주석 추가 완료

### TODO: PointerContentView import 경로 확인
- develop 머지 후 `PointerContentView`가 `@components/common`으로 이동됨
- `ProblemScreen.tsx`, `AllPointingsScreen.tsx`, `PointingScreen.tsx` 등에서 import 경로가 옛 위치를 가리키는지 머지 후 확인 필요
