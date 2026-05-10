// 부팅 후 세션을 한 번 강제 갱신했는지 추적하는 module-scoped 플래그.
// session.ts / checkIsLoggedIn.ts / logout.ts 가 import 사이클 없이 공유하기 위해
// 별도 모듈로 분리한다.
let hasBootRefreshed = false;

export const isBootRefreshed = () => hasBootRefreshed;

export const markBootRefreshed = () => {
  hasBootRefreshed = true;
};

export const resetBootRefresh = () => {
  hasBootRefreshed = false;
};
