import { type Middleware } from 'openapi-fetch';

import {
  getAccessToken,
  getGrade,
  getName,
  getTeacherAccessToken,
  getTeacherName,
  setAccessToken,
  setGrade,
  setName,
  setTeacherAccessToken,
  setTeacherName,
  setTeacherRefreshToken,
} from '@utils/auth';
import { bareClient } from '@apis/bareClient';
import refreshAndPersistTokens from '@apis/refreshAndPersistTokens';
import { useAuthStore } from '@stores';
// import { postTeacherRefreshToken } from '@apis/controller-teacher/auth';

const UNPROTECTED_ROUTES = [
  '/api/student/auth/login/social',
  '/api/student/auth/refresh',
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

const reissueStudentToken = async ({ forceRefresh = false } = {}) => {
  const accessToken = getAccessToken();

  if (accessToken && !forceRefresh) {
    return accessToken;
  }

  if (forceRefresh) {
    await setAccessToken(null);
  }

  const result = await refreshAndPersistTokens();

  if (!result.success) {
    console.warn('Student token refresh failed, clearing credentials.');
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
    const unprotectedRoutes = isTeacher ? TEACHER_UNPROTECTED_ROUTES : UNPROTECTED_ROUTES;
    if (unprotectedRoutes.some((pathname) => schemaPath.startsWith(pathname))) {
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
        setName(data.name);
        setGrade(data.grade);
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

    return request;
  },

  async onResponse({ request, response, schemaPath }) {
    if (response.status === 401) {
      const isTeacher = isTeacherRoute(schemaPath);
      console.warn(`${isTeacher ? '선생님' : '학생'} Access token expired. Attempting reissue...`);

      const newAccessToken = isTeacher
        ? await reissueTeacherToken()
        : await reissueStudentToken({ forceRefresh: true });

      if (!newAccessToken) {
        console.warn('Reissue failed, redirecting to login page.');
        return response;
      }

      request.headers.set('Authorization', `Bearer ${newAccessToken}`);
      return fetch(request);
    }
    return response;
  },
};

export default authMiddleware;
