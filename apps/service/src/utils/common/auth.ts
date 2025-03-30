const getAccessToken = () => localStorage.getItem('accessToken');
const setAccessToken = (accessToken: string) => localStorage.setItem('accessToken', accessToken);
const getName = () => localStorage.getItem('name');
const setName = (name: string) => localStorage.setItem('name', name);

export { getAccessToken, setAccessToken, getName, setName };
