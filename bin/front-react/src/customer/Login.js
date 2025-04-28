import React, { useState } from 'react';
import axios from 'axios';
import '../Css/customer/Login.css';

const Login = () => {
  const [form, setForm] = useState({ customer_id: '', customer_password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://15.165.57.30:8081/api/login.do', form);

      // 로그인 성공 후 customer_id 저장
      localStorage.setItem('customer_id', form.customer_id);

      alert(res.data); // 로그인 성공 메시지
      window.location.href = '/'; // 메인 페이지 이동
    } catch (err) {
      alert(err.response?.data || '로그인 실패');
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-container">
        <h1>로그인</h1>
        <form onSubmit={handleLogin}>
          <div>
            <label>아이디</label>
            <input type="text" name="customer_id" value={form.customer_id} onChange={handleChange} required />
          </div>
          <div>
            <label>비밀번호</label>
            <input type="password" name="customer_password" value={form.customer_password} onChange={handleChange} required />
          </div>
          <div className="login-buttons">
            <button type="submit">로그인</button>
            <button type="button" onClick={() => (window.location.href = '/join')}>회원가입</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
