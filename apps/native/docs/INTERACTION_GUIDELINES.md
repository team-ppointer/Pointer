# 인터랙션 및 트랜지션 가이드라인

이 문서는 Pointer 앱의 버튼 및 인터랙티브 컴포넌트에 적용된 애니메이션과 트랜지션에 대한 상세
가이드를 제공합니다.

---

## 목차

1. [사용 가능한 컴포넌트](#1-사용-가능한-컴포넌트)
2. [버튼 Press 인터랙션](#2-버튼-press-인터랙션)
3. [토글 상태 트랜지션](#3-토글-상태-트랜지션)
4. [애니메이션 파라미터 레퍼런스](#4-애니메이션-파라미터-레퍼런스)
5. [구현 패턴](#5-구현-패턴)
6. [주의사항](#6-주의사항)

---

## 1. 사용 가능한 컴포넌트

프로젝트에서 일관된 인터랙션을 적용하기 위해 제공되는 컴포넌트들입니다.

### 1.1 AnimatedPressable

가장 기본적인 애니메이션 Pressable 컴포넌트입니다. `Pressable`을 대체하여 사용할 수 있습니다.

**경로**: `@components/common/AnimatedPressable`

**Props**:

| Prop                | 타입                                               | 설명                                        |
| ------------------- | -------------------------------------------------- | ------------------------------------------- |
| `containerStyle`    | `StyleProp<ViewStyle>`                             | 외부 컨테이너 스타일 (flex 등)              |
| `animatedStyle`     | `Animated.WithAnimatedValue<StyleProp<ViewStyle>>` | 애니메이션 스타일 (backgroundColor 등)      |
| `disableScale`      | `boolean`                                          | Scale 애니메이션 비활성화 (리스트 아이템용) |
| `...PressableProps` | -                                                  | 기본 Pressable props 모두 지원              |

**사용 예시**:

```tsx
import { AnimatedPressable } from '@components/common';

// 기본 사용
<AnimatedPressable
  className='bg-primary-500 h-[42px] items-center justify-center rounded-[8px] px-[18px]'
  onPress={handlePress}>
  <Text className='text-16m text-white'>버튼</Text>
</AnimatedPressable>

// 토글 애니메이션과 함께 사용
<AnimatedPressable
  animatedStyle={{ backgroundColor: animatedBgColor }}
  onPress={handleToggle}>
  <Icon />
</AnimatedPressable>

// 리스트 아이템에서 사용 (scale 없이 opacity만)
<AnimatedPressable
  className='h-[48px] flex-row items-center bg-white'
  onPress={handlePress}
  disableScale>
  <Text>메뉴 아이템</Text>
</AnimatedPressable>
```

### 1.2 BottomActionBar.Button

하단 액션바 전용 버튼 컴포넌트입니다. `AnimatedPressable`과 동일한 인터랙션이 적용되어 있습니다.

**경로**: `@features/student/problem/components/BottomActionBar`

**Props**: | Prop | 타입 | 설명 | |------|------|------| | `className` | `string` | NativeWind
클래스 | | `containerStyle` | `StyleProp<ViewStyle>` | 외부 컨테이너 스타일 | | `animatedStyle` |
`Animated.WithAnimatedValue<StyleProp<ViewStyle>>` | 애니메이션 스타일 | | `...PressableProps` | - |
기본 Pressable props 모두 지원 |

**사용 예시**:

```tsx
<BottomActionBar bottomInset={insets.bottom}>
  <BottomActionBar.Button
    className='bg-primary-500 h-[42px]'
    containerStyle={{ flex: 1 }}
    onPress={handlePress}>
    <Text className='text-16m text-white'>버튼</Text>
  </BottomActionBar.Button>
</BottomActionBar>
```

### 1.3 컴포넌트 선택 가이드

| 상황                      | 권장 컴포넌트                         |
| ------------------------- | ------------------------------------- |
| 일반적인 버튼             | `AnimatedPressable`                   |
| 하단 액션바 내 버튼       | `BottomActionBar.Button`              |
| BottomSheet 내 버튼       | `AnimatedPressable`                   |
| 키패드/숫자 버튼          | `AnimatedPressable`                   |
| 토글 버튼 (스크랩 등)     | `AnimatedPressable` + `animatedStyle` |
| 탭 바 아이템              | `AnimatedTabItem` (내장)              |
| 리스트 아이템             | `AnimatedPressable` + `disableScale`  |
| 아이콘 버튼 (뒤로가기 등) | `AnimatedPressable`                   |

### 1.4 탭 바 인터랙션 (MainTabBar)

탭 바의 각 아이템에 press 애니메이션이 적용되어 있습니다.

**애니메이션 스펙**: | 속성 | Press In | Press Out | | --- | --- | --- | | **Scale** | `0.9` | `1` |
| **애니메이션** | spring | spring | | **tension** | `300` | `300` | | **friction** | `10` | `10` |

**구현 위치**: `@navigation/student/components/MainTabBar.tsx`

### 1.5 화면 전환 애니메이션 (Tab Navigation)

현재 탭 간 이동 시 애니메이션은 적용하지 않습니다.

> ⚠️ **참고**: React Navigation 7의 Bottom Tab Navigator에서 `animation: 'fade'` 등의 전환
> 애니메이션을 사용하면 lazy loading과 함께 사용 시 간헐적으로 화면이 표시되지 않는 문제가 발생할 수
> 있어 현재는 애니메이션을 사용하지 않습니다.

### 1.6 리스트 아이템 인터랙션

리스트 아이템(MenuListItem, IconMenuItem 등)은 scale 애니메이션이 어색할 수 있어, opacity만
적용합니다.

**Props 설정**:

```tsx
<AnimatedPressable
  className='h-[48px] flex-row items-center bg-white px-[16px]'
  onPress={onPress}
  disableScale>
  {' '}
  {/* scale 애니메이션 비활성화 */}
  <Text>리스트 아이템</Text>
</AnimatedPressable>
```

**애니메이션 스펙**:

| 속성               | Press In | Press Out |
| ------------------ | -------- | --------- |
| **Scale**          | 없음     | 없음      |
| **Opacity**        | `0.7`    | `1`       |
| **duration (in)**  | `100ms`  | -         |
| **duration (out)** | -        | `150ms`   |

**적용 대상**:

- `MenuListItem`: 메뉴 목록 아이템
- `IconMenuItem`: 아이콘이 있는 메뉴 아이템
- 기타 리스트 형태의 터치 가능한 요소

---

## 2. 버튼 Press 인터랙션

버튼을 누를 때 자연스러운 피드백을 제공하는 애니메이션입니다.

### 2.1 Scale 애니메이션

| 속성                | Press In | Press Out |
| ------------------- | -------- | --------- |
| **toValue**         | `0.95`   | `1`       |
| **애니메이션 타입** | `spring` | `spring`  |
| **tension**         | `300`    | `300`     |
| **friction**        | `10`     | `10`      |
| **useNativeDriver** | `true`   | `true`    |

### 2.2 Opacity 애니메이션

| 속성                | Press In | Press Out |
| ------------------- | -------- | --------- |
| **toValue**         | `0.7`    | `1`       |
| **애니메이션 타입** | `timing` | `timing`  |
| **duration**        | `100ms`  | `150ms`   |
| **useNativeDriver** | `true`   | `true`    |

### 2.3 구현 예시

```tsx
import { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

const AnimatedButton = ({ children, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
        {children}
      </Pressable>
    </Animated.View>
  );
};
```

---

## 3. 토글 상태 트랜지션

토글 버튼(스크랩, 좋아요 등)의 상태 변경 시 적용되는 애니메이션입니다.

### 3.1 배경색 트랜지션

| 속성                | 값                                                   |
| ------------------- | ---------------------------------------------------- |
| **애니메이션 타입** | `spring`                                             |
| **tension**         | `200`                                                |
| **friction**        | `20`                                                 |
| **useNativeDriver** | `false` (색상 애니메이션은 네이티브 드라이버 미지원) |

#### 스크랩 버튼 색상 예시

| 상태       | 배경색                 | 아이콘 Stroke             | 아이콘 Fill               |
| ---------- | ---------------------- | ------------------------- | ------------------------- |
| **비활성** | `gray-200` (`#F3F5FB`) | `gray-700` (`#6B6F77`)    | `transparent`             |
| **활성**   | `gray-400` (`#DFE2E7`) | `primary-500` (`#617AF9`) | `primary-500` (`#617AF9`) |

### 3.2 Interpolation 설정

```tsx
const animValue = useRef(new Animated.Value(0)).current;

// 배경색 interpolation
const backgroundColor = animValue.interpolate({
  inputRange: [0, 1],
  outputRange: [colors['gray-200'], colors['gray-400']],
});

// 아이콘 색상 interpolation (필요시)
const iconColor = animValue.interpolate({
  inputRange: [0, 1],
  outputRange: [colors['gray-700'], colors['primary-500']],
});
```

### 3.3 Optimistic Update 패턴

서버 응답을 기다리지 않고 즉시 UI를 업데이트하고, 에러 시에만 롤백합니다.

```tsx
const handleToggle = useCallback(() => {
  if (mutation.isPending) return;

  const previousState = isActive;
  const newState = !previousState;

  // 1. 즉시 상태 업데이트
  setIsActive(newState);

  // 2. 애니메이션 시작
  Animated.spring(animValue, {
    toValue: newState ? 1 : 0,
    useNativeDriver: false,
    tension: 200,
    friction: 20,
  }).start();

  // 3. API 호출
  mutation.mutate(request, {
    onError: () => {
      // 4. 에러 시 롤백
      setIsActive(previousState);
      Animated.spring(animValue, {
        toValue: previousState ? 1 : 0,
        useNativeDriver: false,
        tension: 200,
        friction: 20,
      }).start();
      Alert.alert('실패', '다시 시도해주세요.');
    },
  });
}, [isActive, animValue, mutation]);
```

---

## 4. 애니메이션 파라미터 레퍼런스

### 4.1 Spring 애니메이션

| 용도           | tension | friction | 특성            |
| -------------- | ------- | -------- | --------------- |
| **버튼 Press** | `300`   | `10`     | 빠르고 탄력적   |
| **상태 토글**  | `200`   | `20`     | 부드럽고 안정적 |

#### Spring 파라미터 설명

- **tension**: 스프링의 강도. 높을수록 빠르게 목표값에 도달
- **friction**: 마찰력. 높을수록 오버슈팅이 줄어듦

### 4.2 Timing 애니메이션

| 용도                  | duration | 특성            |
| --------------------- | -------- | --------------- |
| **Press In Opacity**  | `100ms`  | 빠른 피드백     |
| **Press Out Opacity** | `150ms`  | 자연스러운 복귀 |

### 4.3 useNativeDriver 사용 기준

| 속성                                   | useNativeDriver |
| -------------------------------------- | --------------- |
| `transform` (scale, rotate, translate) | ✅ `true`       |
| `opacity`                              | ✅ `true`       |
| `backgroundColor`                      | ❌ `false`      |
| `width`, `height`                      | ❌ `false`      |
| `borderRadius`                         | ❌ `false`      |

---

## 5. 구현 패턴

### 5.1 Native/Non-Native 애니메이션 분리

`useNativeDriver: true`와 `false`를 같은 `Animated.View`에 적용하면 에러가 발생합니다. 반드시 별도의
`Animated.View`로 분리해야 합니다.

```tsx
// ✅ 올바른 패턴
const AnimatedButton = ({ animatedStyle, children }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Inner: Native driver (scale, opacity)
  const innerContent = (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
      <Pressable>{children}</Pressable>
    </Animated.View>
  );

  // Outer: Non-native driver (backgroundColor 등)
  if (animatedStyle) {
    return (
      <Animated.View style={[{ borderRadius: 8, overflow: 'hidden' }, animatedStyle]}>
        {innerContent}
      </Animated.View>
    );
  }

  return innerContent;
};
```

### 5.2 Flex 레이아웃과 Animated.View

`flex-1` 같은 레이아웃 속성은 가장 바깥 컨테이너에 적용해야 합니다.

```tsx
// Props에 containerStyle 추가
type ButtonProps = {
  containerStyle?: StyleProp<ViewStyle>;
  // ...
};

// 사용 예시
<Button containerStyle={{ flex: 1 }} />;
```

---

## 6. 주의사항

### 6.1 애니메이션 충돌 방지

```tsx
// ❌ 에러 발생
<Animated.View style={[
  { transform: [{ scale: scaleAnim }] },  // useNativeDriver: true
  { backgroundColor: bgColorAnim },        // useNativeDriver: false
]}>

// ✅ 분리하여 해결
<Animated.View style={{ backgroundColor: bgColorAnim }}>
  <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
    {content}
  </Animated.View>
</Animated.View>
```

### 6.2 성능 최적화

1. **useRef 사용**: `Animated.Value`는 반드시 `useRef`로 생성
2. **useNativeDriver 활용**: 가능한 경우 항상 `true`로 설정
3. **불필요한 리렌더링 방지**: 애니메이션 핸들러는 `useCallback`으로 메모이제이션

### 6.3 일관성 유지

| 요소                     | 권장 값 |
| ------------------------ | ------- |
| Press Scale              | `0.95`  |
| Press Opacity            | `0.7`   |
| Border Radius            | `8px`   |
| Spring Tension (Press)   | `300`   |
| Spring Friction (Press)  | `10`    |
| Spring Tension (Toggle)  | `200`   |
| Spring Friction (Toggle) | `20`    |

---

## 참조 컴포넌트

| 컴포넌트                 | 경로                                   | 용도                             |
| ------------------------ | -------------------------------------- | -------------------------------- |
| `AnimatedPressable`      | `@components/common`                   | 범용 애니메이션 버튼             |
| `BottomActionBar.Button` | `@features/student/problem/components` | 하단 액션바 전용 버튼            |
| `AnimatedTabItem`        | `@navigation/student/components`       | 탭 바 아이템 (내장)              |
| `ProblemScreen`          | `@features/student/problem/screens`    | 스크랩 토글 구현 예시            |
| `ResultSheet`            | `@features/student/problem/components` | BottomSheet 내 버튼 예시         |
| `AnswerKeyboardSheet`    | `@features/student/problem/components` | 키패드 버튼 인터랙션 예시        |
| `MainTabBar`             | `@navigation/student/components`       | 탭 바 인터랙션 예시              |
| `StudentTabs`            | `@navigation/student`                  | 탭 전환 애니메이션 예시          |
| `MenuListItem`           | `@features/student/menu/components`    | 리스트 아이템 인터랙션 예시      |
| `IconMenuItem`           | `@features/student/menu/components`    | 아이콘 메뉴 아이템 인터랙션 예시 |
| `ScreenLayout`           | `@features/student/menu/components`    | 뒤로가기 버튼 인터랙션 예시      |
| `EditScreenLayout`       | `@features/student/menu/components`    | CTA/뒤로가기 버튼 인터랙션 예시  |
| `UserProfileCard`        | `@features/student/menu/components`    | 수정 버튼 인터랙션 예시          |

---

## 사용 팁

### Flex 레이아웃에서 AnimatedPressable 사용

`AnimatedPressable`은 내부에 `Animated.View` 래퍼가 있으므로, `flex` 관련 스타일은
`containerStyle`로 전달해야 합니다.

```tsx
// ❌ className의 flex-1은 내부 Pressable에만 적용됨
<AnimatedPressable className='flex-1 ...' />

// ✅ containerStyle로 flex 적용
<AnimatedPressable
  className='h-[46px] items-center justify-center rounded-full bg-white'
  containerStyle={{ flex: 1 }}
  onPress={onPress}
/>

// ✅ 전체 너비 사용 시
<AnimatedPressable
  className='w-full ...'
  containerStyle={{ width: '100%' }}
  onPress={onPress}
/>
```

---

## 변경 이력

| 날짜       | 버전 | 변경 내용                                                         |
| ---------- | ---- | ----------------------------------------------------------------- |
| 2026-01-09 | 1.0  | 최초 작성                                                         |
| 2026-01-09 | 1.1  | `AnimatedPressable` 컴포넌트 추가, 사용 가능한 컴포넌트 섹션 추가 |
| 2026-01-09 | 1.2  | `AnswerKeyboardSheet` 참조 추가, Flex 레이아웃 사용 팁 추가       |
| 2026-01-09 | 1.3  | 탭 바 인터랙션, 화면 전환 애니메이션 섹션 추가                    |
| 2026-01-09 | 1.4  | 커스텀 탭 전환 애니메이션 시도                                    |
| 2026-01-09 | 1.5  | 커스텀 sceneStyleInterpolator 제거, 기본 fade 애니메이션으로 변경 |
| 2026-01-09 | 1.6  | 탭 전환 애니메이션 제거 (lazy loading 호환성 문제)                |
| 2026-01-13 | 1.7  | `disableScale` prop 추가, 리스트 아이템 인터랙션 섹션 추가        |
