# Rendering Pipeline Analysis

## 전체 아키텍처

```
Input (Apple Pencil 240Hz / RNGH 60Hz)
  → [1€ Filter (RNGH only)]
  → DrawingEngine.addPoint()
  → scheduleLivePathRender()
  → buildCenterlinePath(samples, config, targetSpacing)
      → Native C++ (SkPathBuilder) 또는 TS fallback
  → <Path style="stroke" strokeWidth={...} />
```

듀얼 구현(C++ JSI + TS fallback) 구조이며, 알고리즘은 완전히 동일하다.

---

## 1. 입력 전처리

### 1€ Filter (`src/model/oneEuroFilter.ts`)

- 속도 적응형 로우패스 필터 (Casiez et al., CHI 2012)
- 저속 시 강한 스무딩(떨림 제거), 고속 시 약한 스무딩(지연 최소화)
- `smoothingFactor = 1 / (1 + τ/te)` → 적응형 cutoff = `minCutoff + β * |dx/dt|`
- **RNGH(60Hz 손가락)에서만 적용** — Apple Pencil(240Hz)은 하드웨어 노이즈가 충분히 낮아 비활성

### Predicted Touches (`src/input/nativeStylusAdapter.tsx`)

- `UITouch.predictedTouchesForTouch:` 으로 OS 레벨 예측 터치 수집
- 렌더링에만 사용, stroke model에 커밋되지 않음 → 시각적 지연 감소

---

## 2. 핵심 렌더링 파이프라인 (buildCenterlinePath)

4단계 순차 처리:

### Step 1: Arc-length Resampling (`resampleByArcLength`)

- 불규칙한 입력 간격을 균일한 호 길이 간격으로 정규화
- `targetSpacing = 3.0 / PixelRatio.get()` (iPad 2x → 1.5pt, iPhone 3x → 1.0pt)
- 누적 호 길이 배열을 구축 → 선형 보간(`lerpSample`)으로 새 샘플 생성
- 모든 속성(pressure, tilt, velocity, timestamp) 함께 보간

### Step 2: Velocity Recomputation (`recomputeVelocities`)

- 리샘플링 후 보간된 velocity는 실제 운동학을 반영하지 않음
- `dx/dt`로 raw velocity 재계산 → EMA 스무딩 (`α * raw + (1-α) * prev`)

### Step 3: Centerline Smoothing (`smoothCenterline`)

- **[0.25, 0.5, 0.25] 가중 이동 평균** 커널
- `smoothed = orig + factor * (kernel_avg - orig)` (factor = 0.3)
- **Sharp turn 보존**: `cos(angle) < 0.5` (60° 이상 꺾임) → 스무딩 건너뜀
- 첫/끝 샘플은 앵커(고정) — 캡 위치 유지

### Step 4: Centripetal Catmull-Rom Spline

- `d^(1/4)` 파라미터화 (centripetal) — uniform보다 루프/커스프에 강건
- 4점 윈도우 `[p(i-1), p(i), p(i+1), p(i+2)]` → 2개 cubic Bezier control point 계산
- 경계 처리: 미러 반사 (`2*current - next`) 로 가상 ghost point 생성
- **Epsilon fallback**: 인접 점 거리가 `< 1e-6`이면 uniform 1/6 비율로 폴백

---

## 3. 라이브 렌더링 최적화 (`useSkiaDrawingRenderer`)

### Frozen Prefix + Live Tail

긴 스트로크에서 전체 경로를 매 프레임 재구축하는 비용을 줄이기 위한 전략:

- **FREEZE_INTERVAL = 10프레임** 마다 prefix 동결
- **TAIL_SIZE = 30** 샘플만 live tail로 유지
- **TAIL_OVERLAP = 1** — 고정폭 stroke 스타일이라 최소 overlap으로 스플라인 연속성 확보
- `combined = frozen_prefix_path + tail_path` (SkPath.addPath)

### Microtask 스케줄링

```typescript
queueMicrotask(() => renderLivePathNow(...));
```

- `requestAnimationFrame` 대신 microtask 사용
- Apple Pencil coalesced touches가 이미 vsync 단위로 도착 → rAF 쓰로틀링은 1프레임 지연만 추가

### SkPath 메모리 관리

- `prevLivePathRef` + `useEffect([livePath])` 패턴으로 deferred dispose
- React가 새 path를 렌더한 뒤에 이전 path를 dispose → use-after-dispose 방지
- `EMPTY_PATH_SENTINEL` 싱글턴으로 빈 상태 표현 (dispose 대상 제외)

---

## 4. Native C++ JSI 가속 (`ios/CatmullRomPathBuilder.cpp`)

- **SkPathBuilder API** (Skia 2.x) — `moveTo/cubicTo/lineTo` → `detach()` → `SkPath`
- Float64Array stride=8 패킹: `[x, y, pressure, tiltX, tiltY, velocity, smoothedVelocity, timestamp]`
- `undefined` → `NaN` 매핑, C++ 측 `std::isnan()` 으로 부재 감지
- TS fallback과 **알고리즘 동일**, 성능만 차이 (GC 압력 해소 + 연산 속도)

---

## 5. Deprecated 가변폭 파이프라인 (`buildVariableWidthPath`)

현재 `fixedWidth = true` 하드코딩으로 미사용이지만, 10단계 파이프라인이 보존됨:

| 단계 | 기법 |
|------|------|
| 1-3 | Resample + Velocity + Smooth (고정폭과 동일) |
| 4 | 동적 폭: `pressure^γ` + hyperbolic velocity thinning + EMA |
| 5 | Smoothstep taper (시작/끝 4샘플, 최소 15%) |
| 6-7 | 법선 벡터 계산 + left/right edge offset |
| 8 | Catmull-Rom edge tracing (양쪽 가장자리) |
| 9 | Cubic Bezier semicircle cap (KAPPA=0.5523, 2-arc 근사) |
| 10 | Close → filled polygon envelope |

---

## 6. DPI 적응

- `targetSpacing = 3.0 / PixelRatio.get()`
  - iPad (2x): 1.5pt 간격 → 적절한 밀도
  - iPhone (3x): 1.0pt 간격 → 고밀도 디스플레이에 맞춤
- C++ JSI에 `targetSpacing` 파라미터 관통 (3번째 인자)

---

## 요약: 강점과 특징

| 영역 | 기법 | 효과 |
|------|------|------|
| 입력 노이즈 | 1€ Filter (60Hz만) | 떨림 제거, 고속 시 지연 최소화 |
| 밀도 정규화 | Arc-length resampling | 속도 무관 균일 커브 품질 |
| 위치 스무딩 | [0.25,0.5,0.25] 커널 + 각도 보존 | 부드러움과 코너 선명도 양립 |
| 커브 피팅 | Centripetal Catmull-Rom → Cubic Bezier | 루프/커스프 안정성 |
| 실시간 성능 | Frozen prefix + microtask | O(tail) 복잡도, 1프레임 지연 제거 |
| 네이티브 | C++ JSI + SkPathBuilder | GC 없는 고속 경로 생성 |
| 지연 감소 | Predicted touches (렌더링 전용) | 시각적 잉크 지연 감소 |
