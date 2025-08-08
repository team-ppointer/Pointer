'use client';
import { Middleware } from 'openapi-fetch';

import {
  getAccessToken,
  setAccessToken,
  setGrade,
  setName,
  setRefreshToken,
  getTeacherAccessToken,
  setTeacherAccessToken,
  setTeacherRefreshToken,
  getName,
  getGrade,
  setTeacherName,
  getTeacherName,
} from '@utils';
import { postRefreshToken } from '@/apis/controller/auth';
import { postTeacherRefreshToken } from '@/apis/controller-teacher/auth';

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

const reissueStudentToken = async () => {
  let accessToken = getAccessToken();

  if (accessToken) {
    return accessToken;
  }

  const result = await postRefreshToken();

  if (!result.isSuccess || !result.data) {
    console.warn('Reissue failed, redirecting to login page.');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    return null;
  }

  if (result.data?.token.accessToken) {
    setAccessToken(result.data.token.accessToken);
    accessToken = result.data.token.accessToken;
  }
  if (result.data?.token.refreshToken) {
    setRefreshToken(result.data.token.refreshToken);
  }
  if (result.data?.name) {
    setName(result.data.name);
    setGrade(result.data.grade);
  }
  return accessToken;
};

const reissueTeacherToken = async () => {
  let accessToken = getTeacherAccessToken();

  if (accessToken) {
    return accessToken;
  }

  const result = await postTeacherRefreshToken();

  if (!result.isSuccess || !result.data) {
    console.warn('Reissue failed, redirecting to login page.');
    localStorage.removeItem('teacherAccessToken');
    localStorage.removeItem('teacherRefreshToken');
    window.location.href = '/teacher/login';
    return null;
  }

  if (result.data?.token.accessToken) {
    setTeacherAccessToken(result.data.token.accessToken);
    accessToken = result.data.token.accessToken;
  }
  if (result.data?.token.refreshToken) {
    setTeacherRefreshToken(result.data.token.refreshToken);
  }
  return accessToken;
};

const authMiddleware: Middleware = {
  async onRequest({ schemaPath, request }: { schemaPath: string; request: Request }) {
    const isTeacher = isTeacherRoute(schemaPath);

    // 보호되지 않은 라우트 체크
    const unprotectedRoutes = isTeacher ? TEACHER_UNPROTECTED_ROUTES : UNPROTECTED_ROUTES;
    if (unprotectedRoutes.some((pathname) => schemaPath.startsWith(pathname))) {
      return undefined;
    }

    // 적절한 토큰 갱신 함수 호출
    const accessToken = isTeacher ? await reissueTeacherToken() : await reissueStudentToken();

    if (accessToken) {
      request.headers.set('Authorization', `Bearer ${accessToken}`);
    }

    // 학생이고 로컬스토리지에 이름, 학년 없을때 내정보 api
    if (!isTeacher && !getName() && !getGrade()) {
      const result = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/student/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (result.ok) {
        const data = await result.json();
        setName(data.name);
        setGrade(data.grade);
      }
    }

    // 선생님이고 로컬스토리지에 이름 없을때
    if (isTeacher && !getTeacherName()) {
      const result = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/teacher/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (result.ok) {
        const data = await result.json();
        setTeacherName(data.name);
      }
    }

    return request;
  },

  async onResponse({ request, response, schemaPath }) {
    if (response.status === 401) {
      const isTeacher = isTeacherRoute(schemaPath);
      console.warn(`${isTeacher ? '선생님' : '학생'} Access token expired. Attempting reissue...`);

      const newAccessToken = isTeacher ? await reissueTeacherToken() : await reissueStudentToken();

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
