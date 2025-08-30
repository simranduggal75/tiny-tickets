export const auth = {
  setToken: (token: string) => localStorage.setItem("token", token),
  getToken: () => localStorage.getItem("token"),
  clearToken: () => localStorage.removeItem("token"),
};
