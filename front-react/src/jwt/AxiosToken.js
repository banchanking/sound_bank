import axios from "axios"; // npm install axios

// backend와 통신
// 로그인이 완료시 JWT를 저장한다.

export const getAuthToken = () => {
  return window.localStorage.getItem("auth_token");
};

export const getCustomerID = () => {
  return window.localStorage.getItem("customerId");
};

export const setAuthToken = (customer_token) => {
  window.localStorage.setItem("auth_token", customer_token);
};

export const setCustomerID = (customerId) => {
  window.localStorage.setItem("customerId", customerId);
};

export const setRefreshToken = (refresh_token) => {
  window.localStorage.setItem("refresh_token", refresh_token);
};

export const setRole = (role) => {
  window.localStorage.setItem("role", role);
};

export const request = (method, url, data) => {
  let headers = {};
  // if (getAuthToken() != null && getAuthToken() !== "undefined") {
  //   headers = { Authorization: `Bearer ${getAuthToken()}` };
  //   console.log("headers: ", headers);
  // }

  console.log("axios !!!!!!!!");
  console.log("method: ", method);
  console.log("url: ", url);
  console.log("data: ", data);
  console.log("헤더:", headers);
  return axios({
    method: method,
    headers: headers,
    url: url,
    data: data,
  });
};

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post(
      "http://localhost:8081/api/refresh-token",
      {
        refreshToken,
      }
    );

    // 👉 백엔드 응답 형식에 따라 다음 줄 조정 필요!
    const newAccessToken = response.data.accessToken || response.data; // 예: accessToken만 응답하거나 전체 객체일 경우
    localStorage.setItem("auth_token", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("🔁 Failed to refresh access token:", error);
    return null;
  }
};
