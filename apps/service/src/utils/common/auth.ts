const getAccessToken = () => localStorage.getItem('accessToken');
const setAccessToken = (accessToken: string) => localStorage.setItem('accessToken', accessToken);
const getRefreshToken = () => localStorage.getItem('refreshToken');
const setRefreshToken = (refreshToken: string) =>
  localStorage.setItem('refreshToken', refreshToken);
const getName = () => localStorage.getItem('name');
const setName = (name: string) => localStorage.setItem('name', name);
const getGrade = () => localStorage.getItem('grade');
const setGrade = (grade: number) => localStorage.setItem('grade', grade.toString());

export {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  getName,
  setName,
  setGrade,
  getGrade,
};
