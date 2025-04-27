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
  const customerId = getCustomerID();
  if (!customerId) {
    return null;
  }

  try {
    const response = await axios.post(
      "http://localhost:8081/api/refresh-token",
      {
        customerId: customerId
      }
    );

    const newAccessToken = response.data;
    localStorage.setItem("auth_token", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("🔁 Failed to refresh access token:", error);
    return null;
  }
};
