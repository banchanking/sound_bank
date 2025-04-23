import axios from "axios";

const FlaskToken = axios.create({
  baseURL: "http://localhost:5000", // Flask 서버 포트
  headers: {
    "Content-Type": "application/json",
  },
});

export default FlaskToken;
