import React from "react";
import "../Css/Common/Footer.css";
import { Link, useLocation } from 'react-router-dom'; //  useLocation 추가

const Footer = () => {
  const location = useLocation(); //  현재 경로 확인
  const isMainPage = location.pathname === '/'; //  메인 페이지 여부 판단

  return (
    <footer className={`footer ${isMainPage ? 'footer-main' : 'footer-default'}`}> {/*  클래스 조건부로 부여 */}
      <div className="footer-wrap">
        <div className="footer-info">
          <h3 className="footer-logo">SoundBank</h3>
          <p className="footer-desc">
            혁신적인 금융 서비스로 당신의 미래를 설계합니다.
          </p>
        </div>
        <div className="footer-links">
          <div className="link-group">
            <h4 className="link-title">회사</h4>
            <ul>
            <li><Link to="/#">소개</Link></li>
            <li><Link to="/#">연혁</Link></li>
            <li><Link to="/#">채용</Link></li>
            </ul>
          </div>
          <div className="link-group">
            <h4 className="link-title">고객센터</h4>
            <ul>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/chatbot">챗봇</Link></li>
              <li><Link to="/businesshour">이용시간</Link></li>
            </ul>
          </div>
          <div className="link-group">
            <h4 className="link-title">서비스</h4>
            <ul>
              <li><Link to="/ex_rate">외환</Link></li>
              <li><Link to="/loanApply">대출</Link></li>
              <li><Link to="/openAccount">펀드</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-contact">
          <p>고객센터: 1234-5678</p>
          <p>이메일: support@soundbank.com</p>
          <p>© 2025 SoundBank. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
