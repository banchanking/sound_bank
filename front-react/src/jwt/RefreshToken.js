import axios from "axios";
import { getAuthToken, refreshAccessToken } from "./AxiosToken";

const RefreshToken = axios.create({
  baseURL: "http://localhost:8081/api",
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

RefreshToken.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

RefreshToken.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.log("🔄 토큰 만료됨. 재발급 시도 중...");
      const newToken = await refreshAccessToken();
      if (newToken) {
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return RefreshToken(error.config); // 원래 요청 재시도
      } else {
        // window.location.href = "/login";
        alert("서버 오류 발생");
      }
    }
    return Promise.reject(error);
  }
);

export default RefreshToken;
