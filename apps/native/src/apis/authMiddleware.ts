import { type Middleware } from 'openapi-fetch';

import {
  getAccessToken,
  getGrade,
  getName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- teacher 트랙 복원 시 사용
  getTeacherAccessToken,
  getTeacherName,
  setAccessToken,
  setGrade,
  setName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- teacher 트랙 복원 시 사용
  setTeacherAccessToken,
  setTeacherName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- teacher 트랙 복원 시 사용
  setTeacherRefreshToken,
} from '@utils/auth';
import { bareClient } from '@apis/bareClient';
import refreshAndPersistTokens from '@apis/refreshAndPersistTokens';
import { useAuthStore } from '@stores';
// import { postTeacherRefreshToken } from '@apis/controller-teacher/auth';

const UNPROTECTED_ROUTES = [
  '/api/student/auth/login/social',
  '/api/student/auth/login/local',
  '/api/student/auth/signup/local',
  '/api/student/auth/register',
  '/api/student/auth/refresh',
  '/api/student/auth/password/reset',
  '/api/student/auth/password/reset/send-code',
  '/api/student/auth/password/reset/verify-code',
  '/api/student/auth/email/exists',
  '/api/common/upload-file',
];
const TEACHER_UNPROTECTED_ROUTES = [
  '/api/teacher/auth/login',
  '/api/teacher/auth/refresh',
  '/api/common/upload-file',
];

const isTeacherRoute = (schemaPath: string) => {
  return schemaPath.startsWith('/api/teacher/') || schemaPath.includes('teacher');
};

const isUnprotectedRoute = (schemaPath: string, isTeacher: boolean) => {
  const routes = isTeacher ? TEACHER_UNPROTECTED_ROUTES : UNPROTECTED_ROUTES;
  // 인증 우회는 실패 시 영향이 크므로 정확 매칭 또는 명시적 하위 경로(`/`)
  // 매칭만 허용한다. prefix-only 매칭은 미래 라우트와 우발 충돌 가능.
  return routes.some(
    (pathname) => schemaPath === pathname || schemaPath.startsWith(`${pathname}/`)
  );
};

// 401 재시도 시 body가 이미 소비된 원본 대신 사용할 clone을 보관한다.
const retryRequestClones = new WeakMap<Request, Request>();

let studentRefreshPromise: Promise<string | null> | null = null;

const reissueStudentToken = async ({ forceRefresh = false } = {}) => {
  if (!forceRefresh) {
    const accessToken = getAccessToken();
    if (accessToken) {
      return accessToken;
    }
  }

  if (studentRefreshPromise) {
    return studentRefreshPromise;
  }

  studentRefreshPromise = (async () => {
    try {
      if (forceRefresh) {
        await setAccessToken(null);
      }

      const result = await refreshAndPersistTokens();

      if (!result.success) {
        if (result.transient) {
          // 서버 5xx/네트워크 장애. refresh token 자체가 무효라고 단정할 수 없으므로
          // 자격증명을 보존한다. 실패한 호출은 401 그대로 caller 에 전달되어
          // 사용자 메시징/재시도로 이어진다.
          console.warn('Student token refresh transient failure; keeping credentials.');
          return null;
        }
        console.warn('Student token refresh failed (token invalid), clearing credentials.');
        await useAuthStore.getState().signOut();
        return null;
      }

      if (result.data.name !== undefined) {
        await setName(result.data.name);
      }
      if (result.data.grade !== undefined) {
        await setGrade(result.data.grade);
      }

      return result.data.token.accessToken;
    } finally {
      studentRefreshPromise = null;
    }
  })();

  return studentRefreshPromise;
};

const reissueTeacherToken = async () => {
  // let accessToken = getTeacherAccessToken();
  // if (accessToken) {
  //   return accessToken;
  // }
  // const result = await postTeacherRefreshToken();
  // if (!result.isSuccess || !result.data) {
  //   console.warn('Teacher token refresh failed, clearing credentials.');
  //   await clearAuthState();
  //   return null;
  // }
  // if (result.data?.token.accessToken) {
  //   accessToken = result.data.token.accessToken;
  //   await setTeacherAccessToken(accessToken);
  // }
  // if (result.data?.token.refreshToken) {
  //   await setTeacherRefreshToken(result.data.token.refreshToken);
  // }
  // return accessToken;
};

const authMiddleware: Middleware = {
  async onRequest({ schemaPath, request }: { schemaPath: string; request: Request }) {
    // const isTeacher = isTeacherRoute(schemaPath);
    const isTeacher = false;

    // 보호되지 않은 라우트 체크
    if (isUnprotectedRoute(schemaPath, isTeacher)) {
      return;
    }

    // 적절한 토큰 갱신 함수 호출
    const accessToken = isTeacher ? await reissueTeacherToken() : await reissueStudentToken();

    if (accessToken) {
      request.headers.set('Authorization', `Bearer ${accessToken}`);
    }

    if (accessToken && !isTeacher && !getName() && !getGrade()) {
      const { data } = await bareClient.GET('/api/student/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (data) {
        await setName(data.name);
        await setGrade(data.grade);
      }
    }

    if (accessToken && isTeacher && !getTeacherName()) {
      const { data } = await bareClient.GET('/api/teacher/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (data) {
        setTeacherName(data.name);
      }
    }

    // body 있는 요청에 한해 retry용 clone을 확보한다. body-less 요청
    // (GET/HEAD 등)은 onResponse에서 원본 request를 그대로 fetch해도
    // 안전하므로 clone 비용을 들이지 않는다.
    if (request.body !== null) {
      retryRequestClones.set(request, request.clone());
    }

    return request;
  },

  async onResponse({ request, response, schemaPath }) {
    if (response.status === 401) {
      const isTeacher = isTeacherRoute(schemaPath);

      // 로그인/refresh/회원가입 같은 unprotected 라우트의 401은 토큰 만료가
      // 아니라 자격 검증 실패다. refresh/retry를 시도하면 불필요한 signOut
      // 또는 body 소비된 원본 재전송으로 이어지므로 그대로 전달한다.
      if (isUnprotectedRoute(schemaPath, isTeacher)) {
        retryRequestClones.delete(request);
        return response;
      }

      console.warn(`${isTeacher ? '선생님' : '학생'} Access token expired. Attempting reissue...`);

      const newAccessToken = isTeacher
        ? await reissueTeacherToken()
        : await reissueStudentToken({ forceRefresh: true });

      if (!newAccessToken) {
        retryRequestClones.delete(request);
        console.warn('Reissue failed, redirecting to login page.');
        return response;
      }

      const retryRequest = retryRequestClones.get(request) ?? request;
      retryRequestClones.delete(request);
      retryRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
      return fetch(retryRequest);
    }
    retryRequestClones.delete(request);
    return response;
  },
};

export default authMiddleware;
