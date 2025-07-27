const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

const setAccessToken = (accessToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
  }
};

const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

const setRefreshToken = (refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

const getName = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('name');
  }
  return null;
};

const setName = (name: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('name', name);
  }
};

const getGrade = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('grade');
  }
  return null;
};

const setGrade = (grade: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('grade', grade.toString());
  }
};

const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.clear();
  }
};

export {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  getName,
  setName,
  setGrade,
  getGrade,
  logout,
};
