import axios from "axios";

const AdminAxios = axios.create({
  baseURL: "http://localhost:8081/admin", // 형님이 사용하는 백엔드 주소로 수정
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

export default AdminAxios;
