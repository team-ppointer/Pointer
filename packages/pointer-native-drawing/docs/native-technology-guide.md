# Native Technology Guide

이 프로젝트의 iOS 네이티브 계층에 대한 기술 가이드라인.

---

## 아키텍처 개요

네이티브 코드는 두 가지 독립적 모듈로 구성된다:

```
┌─────────────────────────────────────────────────┐
│                     JS Layer                     │
│  nativePathBuilder.ts    nativeStylusAdapter.tsx  │
└────────┬────────────────────────┬────────────────┘
         │ JSI (synchronous)      │ Fabric Event
         ▼                        ▼
┌──────────────────┐   ┌──────────────────────────┐
│  Path Builder    │   │  Stylus Input            │
│  (C++ / ObjC++)  │   │  (ObjC / UIKit)          │
│                  │   │                          │
│  CatmullRom      │   │  PencilGestureRecognizer │
│  PathBuilder.cpp │   │  StylusInputView.mm      │
│  JSI.mm          │   │  Codegen spec            │
└──────────────────┘   └──────────────────────────┘
         │                        │
         ▼                        ▼
   Skia SkPathBuilder        UITouch coalesced +
   (react-native-skia)       predicted touches
```

---

## 1. JSI Path Builder

### 파일 구조

| 파일 | 역할 |
|------|------|
| `CatmullRomPathBuilder.h` | C++ 헤더 — `Sample`, `Config`, `BuildState`, `PathBuilder` 선언 |
| `CatmullRomPathBuilder.cpp` | 순수 C++ 구현 — Skia 외 의존성 없음 |
| `CatmullRomPathBuilderJSI.h` | JSI install 함수 선언 |
| `CatmullRomPathBuilderJSI.mm` | JSI 바인딩 + ObjC 모듈 (`RCT_EXPORT_MODULE`) |
| `src/nativePathBuilder.ts` | TS 래퍼 — lazy install, Float64Array 패킹 |

### JSI 바인딩 패턴

```
JS: NativeModules.PointerDrawingPathBuilder.install()
  → ObjC: RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(install)
    → bridge.runtime → jsi::Runtime*
    → SkiaManager → RNSkPlatformContext
    → installPathBuilder(runtime, context)
      → runtime.global().setProperty(3개 함수)
```

3개의 글로벌 JSI 함수가 등록된다:
- `__PointerNativeDrawing_buildSmoothPath(buf)` → `SkPath`
- `__PointerNativeDrawing_buildVariableWidthPath(buf, config, state?, taperStart?, taperEnd?)` → `{ path, lastSmoothedWidth }`
- `__PointerNativeDrawing_buildCenterlinePath(buf, config, targetSpacing?)` → `SkPath`

### 데이터 전송: Float64Array stride=8

JS → C++ 데이터 전송은 `Float64Array`를 사용한다. 한 샘플당 8개 double:

```
[x, y, pressure, tiltX, tiltY, velocity, smoothedVelocity, timestamp]
```

- `undefined` 필드는 `NaN`으로 매핑
- C++ 측에서 `std::isnan()`으로 부재 감지
- `ArrayBuffer`의 `byteOffset` + `length`로 직접 포인터 접근 (복사 없음)

### SkPath 반환

```cpp
jsi::Value wrapSkPath(jsi::Runtime &rt,
                      std::shared_ptr<RNSkia::RNSkPlatformContext> ctx,
                      SkPath &&path) {
  return RNSkia::JsiSkPath::toValue(rt, ctx, std::move(path));
}
```

- `RNSkia::JsiSkPath::toValue()`를 통해 C++ `SkPath`를 JS `SkPath` 객체로 변환
- `std::move`로 불필요한 복사 방지

### Fabric / Paper 분기

```objc
#ifdef RCT_NEW_ARCH_ENABLED
  // Fabric: SkiaManager static singleton
  skManager = [SkiaManager latestActiveSkManager];
#else
  // Paper: bridge module lookup
  SkiaManager *skiaModule = [_bridge moduleForClass:[SkiaManager class]];
  skManager = [skiaModule skManager];
#endif
```

### Lazy Install 패턴 (TS 측)

```typescript
let installed = false;
let triedInstall = false;  // 실패 시 재시도 방지

function ensureInstalled(): boolean {
  if (installed) return true;
  // 이미 글로벌에 존재하면 (hot reload 등) 바로 사용
  if (typeof globalThis.__PointerNativeDrawing_buildVariableWidthPath === "function") {
    installed = true;
    return true;
  }
  if (triedInstall) return false;
  triedInstall = true;
  // NativeModules.PointerDrawingPathBuilder.install() 호출
  ...
}
```

- `hasNativePathBuilder()`가 `false`면 TS fallback 자동 사용
- Android에서는 네이티브 모듈이 없으므로 항상 TS fallback

### 에러 처리 전략

모든 JSI 함수는 3-layer try-catch:

```cpp
try {
  // 정상 로직
} catch (const jsi::JSError &) {
  throw;                        // JS 에러 → 그대로 전파
} catch (const std::exception &e) {
  throw jsi::JSError(rt, ...);  // C++ 예외 → JS 에러로 변환
} catch (...) {
  throw jsi::JSError(rt, ...);  // 알 수 없는 예외 → JS 에러로 변환
}
```

---

## 2. Skia 통합

### SkPathBuilder API (Skia 2.x)

Skia 2.x에서는 `SkPath`에 직접 `moveTo/cubicTo`를 호출하지 않는다:

```cpp
SkPathBuilder b;
b.moveTo(x, y);
b.cubicTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
b.close();
SkPath path = b.detach();  // SkPathBuilder → SkPath 변환
```

### 주의사항

- **`addCircle` 없음**: `addOval(SkRect::MakeXYWH(...))` 사용
- **`SkPath`는 immutable builder 패턴**: `detach()` 후 `SkPathBuilder`는 리셋됨
- **`setIsVolatile(true)`**: 매 프레임 변경되는 live path에 설정 (Skia 내부 캐시 비활성화)

### Header Search Paths (podspec)

CocoaPods는 `/**` recursive glob을 `HEADER_SEARCH_PATHS`에서 지원하지 않는다. 모든 Skia 헤더 경로를 명시적으로 나열해야 한다:

```ruby
skia_cpp = "#{skia_pkg}/cpp"
s.pod_target_xcconfig = {
  "HEADER_SEARCH_PATHS" => [
    "\"#{skia_cpp}\"",
    "\"#{skia_cpp}/skia\"",
    "\"#{skia_cpp}/skia/include\"",
    "\"#{skia_cpp}/skia/include/core\"",
    # ... 전체 목록
    "\"#{skia_pkg}/apple\"",
  ].join(" "),
}
```

consumer의 `node_modules`에서 resolve해야 한다 (`Pod::Config.instance.installation_root` 기준).

---

## 3. Stylus Input (Apple Pencil)

### 컴포넌트 계층

```
StylusInputView (Fabric RCTViewComponentView)
  └─ PencilGestureRecognizer (UIGestureRecognizer)
       └─ PencilTouchData (coalesced + predicted)
            └─ Fabric EventEmitter → JS onStylusTouch
```

### PencilGestureRecognizer

- `UIGestureRecognizer` 서브클래스
- `UITouchTypePencil`만 추적, 손가락 터치는 즉시 `UIGestureRecognizerStateFailed` → 하위 RNGH로 패스스루
- 단일 터치 추적 (`_trackedTouch`): 멀티터치 시 추가 터치는 `ignoreTouch:forEvent:` 처리
- delegate 패턴으로 `PencilTouchData` 전달 (UIGestureRecognizer action에는 `UIEvent`가 전달되지 않으므로)

### Coalesced + Predicted Touches

```objc
NSArray<UITouch *> *coalesced = [event coalescedTouchesForTouch:touch] ?: @[touch];
NSArray<UITouch *> *predicted = [event predictedTouchesForTouch:touch] ?: @[];
```

- **Coalesced**: 60Hz 디스플레이 사이에 발생한 240Hz 터치 샘플 (Apple Pencil)
- **Predicted**: OS가 추정한 미래 1~2 터치 위치
- `preciseLocationInView:`로 서브픽셀 정밀도 좌표 획득

### 터치 데이터 추출

각 터치에서 추출하는 데이터:

| 필드 | 소스 | 변환 |
|------|------|------|
| x, y | `preciseLocationInView:` | 뷰 로컬 좌표 |
| timestamp | `touch.timestamp * 1000` | 시스템 부팅 후 초 → ms |
| force | `touch.force / touch.maximumPossibleForce` | 0~1 정규화 |
| altitude | `touch.altitudeAngle` | 라디안 (0=수평, π/2=수직) |
| azimuth | `azimuthAngleInView:` | 라디안 (UIKit 규약) |

### 타임스탬프 도메인 변환 (JS 측)

```typescript
// UITouch.timestamp: 시스템 부팅 후 초 (mach_absolute_time 도메인)
// RNGH adapter: Date.now() (epoch ms)
// 통일을 위해 epoch ms로 변환
const BOOT_TIME_OFFSET_MS = Date.now() - performance.now();

function uptimeMsToEpochMs(uptimeMs: number): number {
  return uptimeMs + BOOT_TIME_OFFSET_MS;
}
```

DrawingEngine의 velocity 계산과 eraser throttling이 일관된 시간 도메인에서 동작하도록 한다.

### Tilt 변환 (altitude/azimuth → tiltX/tiltY)

```typescript
// altitude: 펜과 화면 사이 각도 (0=수평, π/2=수직)
// azimuth: 펜 방향 (0=오른쪽, CW 증가)
// → W3C Pointer Events tiltX/tiltY (도 단위)
tiltX = atan2(cos(azimuth), tan(altitude)) * RAD_TO_DEG
tiltY = atan2(sin(azimuth), tan(altitude)) * RAD_TO_DEG
```

---

## 4. Fabric Codegen Spec

```typescript
// src/specs/StylusInputViewNativeComponent.ts
type StylusTouchEvent = Readonly<{
  phase: Int32;
  xs: Double[];   ys: Double[];   timestamps: Double[];
  forces: Double[];  altitudes: Double[];  azimuths: Double[];
  predictedXs: Double[];  predictedYs: Double[];  // ...
}>;
```

### 제약사항

- **배열 타입**: codegen 이벤트 파서는 `Double[]`만 지원 (`ReadonlyArray<Double>` 불가, react-native#47113)
- **중첩 객체 배열 불가**: `Array<{ x, y, ... }>` 형태 사용 불가 → parallel 배열 패턴으로 우회
- `codegenNativeComponent<NativeProps>("StylusInputView")`로 등록

### Fabric 컴포넌트 등록

```objc
// StylusInputView.mm
+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<StylusInputViewComponentDescriptor>();
}

// 모듈 등록 함수
Class<RCTComponentViewProtocol> StylusInputViewCls(void) {
  return StylusInputView.class;
}
```

---

## 5. podspec 구성

```ruby
Pod::Spec.new do |s|
  s.platforms    = { :ios => "16.0" }
  s.source_files = "ios/**/*.{h,m,mm,cpp}"
  s.dependency "react-native-skia"

  # consumer의 node_modules에서 Skia 경로 resolve
  consumer_root = File.expand_path("#{Pod::Config.instance.installation_root}/..")
  skia_pkg_json = `cd "#{consumer_root}" && node --print "require.resolve(...)"`.strip

  s.pod_target_xcconfig = {
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++20",
    "HEADER_SEARCH_PATHS" => [...].join(" "),
  }

  install_modules_dependencies(s)
end
```

### 핵심 포인트

- **C++20** 표준 사용
- **`react-native-skia`** 의존 — Skia 헤더 + `JsiSkPath`, `RNSkManager` 등
- **`install_modules_dependencies(s)`** — React Native 자동 링킹 지원
- consumer의 `node_modules`에서 Skia 패키지 경로를 런타임에 resolve (monorepo/hoisting 대응)

---

## 6. Gotchas & 주의사항

### Skia 관련

| 문제 | 해결 |
|------|------|
| Skia 2.x에서 `SkPath::moveTo` 없음 | `SkPathBuilder` 사용 → `detach()` |
| `addCircle` 없음 | `addOval(SkRect)` 사용 |
| CocoaPods `/**` glob 미지원 | 헤더 경로 명시적 나열 |
| `-Wdocumentation` 경고 | Skia 헤더에 `#pragma clang diagnostic ignored` |

### JSI 관련

| 문제 | 해결 |
|------|------|
| Float64Array 접근 | `getArrayBuffer` + `byteOffset`으로 직접 포인터 |
| `undefined` 표현 | `NaN` 매핑 + `std::isnan()` 감지 |
| Skia context 수명 | `shared_ptr<RNSkPlatformContext>` 캡처 |
| Hot reload 대응 | `globalThis` 존재 여부 우선 확인 후 install |

### UIKit 관련

| 문제 | 해결 |
|------|------|
| UIGestureRecognizer에 UIEvent 미전달 | delegate 패턴으로 우회 |
| 타임스탬프 도메인 불일치 | `Date.now() - performance.now()` offset 계산 |
| codegen 중첩 객체 배열 불가 | parallel 배열 패턴 |
| 손가락/펜 동시 입력 | Pencil만 추적, 손가락은 `StateFailed` → RNGH로 |

### 빌드/배포 관련

| 문제 | 해결 |
|------|------|
| Android에 네이티브 모듈 없음 | TS fallback 자동 전환 (`triedInstall` 플래그) |
| example ↔ library 동기화 | `pnpm build` → `cd example && npm install` → Metro restart |
| Metro 캐시 | `--reset-cache`로 재시작 |
