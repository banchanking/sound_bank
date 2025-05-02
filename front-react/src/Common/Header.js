import { React, useState, useEffect } from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../Css/Common/Header.css";
import RefreshToken from "../jwt/RefreshToken";

const Header = () => {
  const [loginStatus, setLoginStatus] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMainPage = location.pathname === "/";

  useEffect(() => {
    const customerId = localStorage.getItem("customerId");
    setLoginStatus(!!customerId);
  }, [location.pathname]);

  const logout = () => {
    RefreshToken.post(
      "/logout",
      {
        customerId: localStorage.getItem("customerId"),
        role: localStorage.getItem("role"),
      },
      {
        withCredentials: true,
      }
    )
      .then((res) => {
        console.log(res.data);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("customerId");
        localStorage.removeItem("role");
        alert("로그아웃 되었습니다.");
        navigate("/");
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
        alert("로그아웃 실패.");
      });
  };

  return (
    <Navbar
      variant="dark"
      className={`nav-bar ${isMainPage ? "nav-bar-main" : "nav-bar-default"}`}
      expand="md"
    >
      <Container fluid>
        <Navbar.Toggle aria-controls="nav-menu" className="menu-toggle" />
        <Link to="/">
          <Navbar.Brand className="logo">
            <img
              src="./Images/main/logo.png"
              alt="Sound Bank Logo"
              width="70"
              height="50"
              className="d-inline-block align-top"
            />
          </Navbar.Brand>
        </Link>

        <Navbar.Collapse id="nav-menu">
          <Nav className="menu">
            <Link to="/" className="nav-item">
              Home
            </Link>

            {/* 예적금 */}
            <NavDropdown
              title="예/적금"
              id="deposit-menu"
              className="NavDropdown-menu"
            >
              <div className="deposit-saving-row">
                <ul>
                  <div className="dropdown-mid-title">조회/입출금</div>
                  <li>
                    <NavDropdown.Item as={Link} to="/depositAccountInquiry">
                      계좌조회
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/depositTransactionDetails">
                      거래내역
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/depositWithdrawal">
                      입출금
                    </NavDropdown.Item>
                  </li>
                </ul>
                <ul>
                  <div className="dropdown-mid-title">상품가입</div>
                  <li>
                    <NavDropdown.Item as={Link} to="/depositJoin">
                      예금가입
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/savingsJoin">
                      적금가입
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/depositComparison">
                      예적금비교
                    </NavDropdown.Item>
                  </li>
                </ul>
                <ul>
                  <div className="dropdown-mid-title">예금관리</div>
                  <li>
                    <NavDropdown.Item as={Link} to="/depositChange">
                      예금변경
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/depositAutosettings">
                      자동이체설정
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/depositAutoManagement">
                      자동이체관리
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/depositCancellation">
                      예금해지
                    </NavDropdown.Item>
                  </li>
                </ul>
              </div>
            </NavDropdown>

            {/* 조회/이체 */}
            <NavDropdown
              title="조회/이체"
              id="transfer-menu"
              className="NavDropdown-menu"
            >
              <div className="deposit-saving-row">
                <ul>
                  <div className="dropdown-mid-title">조회</div>
                  <li>
                    <NavDropdown.Item as={Link} to="/inquireAccont">
                      보유계좌
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/inquireTransfer">
                      거래내역
                    </NavDropdown.Item>
                  </li>
                </ul>
                <ul>
                  <div className="dropdown-mid-title">이체</div>
                  <li>
                    <NavDropdown.Item as={Link} to="/transInstant">
                      실시간 계좌이체
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/transAuto">
                      자동이체
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/transMulti">
                      다건이체
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/transLimit">
                      이체한도 변경
                    </NavDropdown.Item>
                  </li>
                </ul>
              </div>
            </NavDropdown>

            {/* 대출 */}
            <NavDropdown
              title="대출"
              id="loan-menu"
              className="NavDropdown-menu"
            >
              <div className="deposit-saving-row">
                <ul>
                  <div className="dropdown-mid-title">대출 상품</div>
                  <li>
                    <NavDropdown.Item as={Link} to="/loanApply">
                      대출 신청
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/LoanCalculator">
                      대출 계산기
                    </NavDropdown.Item>
                  </li>
                </ul>
                <ul>
                  <div className="dropdown-mid-title">대출 관리</div>
                  <li>
                    <NavDropdown.Item as={Link} to="/MainLoanStatus">
                      나의 대출정보
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/MyInterest">
                      이자 납부 내역
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/MyLateInterest">
                      나의 연체 이력
                    </NavDropdown.Item>
                  </li>
                </ul>
              </div>
            </NavDropdown>

            {/* 펀드 */}
            <NavDropdown
              title="펀드"
              id="fund-menu"
              className="NavDropdown-menu"
            >
              <div className="deposit-saving-row">
                <ul>
                  <div className="dropdown-mid-title">펀드 상품</div>
                  <li>
                    <NavDropdown.Item as={Link} to="/fundList">
                      펀드 상품보기
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/fundTest">
                      투자성향분석 테스트
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/fundRecommend">
                      AI 펀드 추천
                    </NavDropdown.Item>
                  </li>
                </ul>
                <ul>
                  <div className="dropdown-mid-title">My 펀드</div>
                  <li>
                    <NavDropdown.Item as={Link} to="/myFundInfo">
                      펀드 정보 조회
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/openAccount">
                      펀드 계좌 개설
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/closeAccount">
                      펀드 계좌 해지
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/transHistory">
                      거래 내역 (매수, 환매)
                    </NavDropdown.Item>
                  </li>
                </ul>
              </div>
            </NavDropdown>

            {/* 외환 */}
            <NavDropdown
              title="외환"
              id="forex-menu"
              className="NavDropdown-menu"
            >
              <div className="deposit-saving-row">
                <ul>
                  <div className="dropdown-mid-title">외환</div>
                  <li>
                    <NavDropdown.Item as={Link} to="/ex_rate">
                      환율조회/환율계산기
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/ex_request">
                      환전신청하기
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/exchangeRequestList">
                      환전 신청 현황
                    </NavDropdown.Item>
                  </li>
                </ul>
                <ul>
                  <div className="dropdown-mid-title">지갑 관리</div>
                  <li>
                    <NavDropdown.Item as={Link} to="/exchange_wallet_status">
                      MY 지갑
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/exchange_list">
                      환전내역 조회
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/ex_account_management">
                      외환 지갑 해지
                    </NavDropdown.Item>
                  </li>
                </ul>
              </div>
            </NavDropdown>

            <NavDropdown
              title="고객센터"
              id="support-menu"
              className="NavDropdown-menu"
            >
              <div className="deposit-saving-row">
                <ul>
                  <div className="dropdown-mid-title">이용안내</div>
                  <li>
                    <NavDropdown.Item as={Link} to="/notice">
                      공지사항
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/businesshour">
                      이용안내시간
                    </NavDropdown.Item>
                  </li>
                </ul>
                <ul>
                  <div className="dropdown-mid-title">온라인상담</div>
                  <li>
                    <NavDropdown.Item as={Link} to="/faq">
                      자주 묻는 질문
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/chatbot">
                      누르는 상담
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/voicebot">
                      말하는 상담
                    </NavDropdown.Item>
                  </li>
                </ul>
                <ul>
                  <div className="dropdown-mid-title">인증도우미</div>
                  <li>
                    <NavDropdown.Item as={Link} to="/roi">
                      실시간 신분증 인증
                    </NavDropdown.Item>
                  </li>
                  <li>
                    <NavDropdown.Item as={Link} to="/idauth">
                      신분증 인증
                    </NavDropdown.Item>
                  </li>
                </ul>
                <ul>
                  <div className="dropdown-mid-title">문의</div>
                  <li>
                    <NavDropdown.Item as={Link} to="/Stopgambling">
                      불법도박 계좌 신고
                    </NavDropdown.Item>
                  </li>
                </ul>
              </div>
            </NavDropdown>
          </Nav>

          <div className="auth-buttons">
            {!loginStatus && (
              <Link to="/join" className="auth-btn signup-btn">
                계좌개설
              </Link>
            )}
            {loginStatus ? (
              localStorage.getItem("role") === "ADMIN" ? (
                <>
                  <Link to="/adminPage" className="auth-btn admin-btn">
                    관리자 페이지
                  </Link>
                  <Link to="/" className="auth-btn logout-btn" onClick={logout}>
                    로그아웃
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/mypage" className="auth-btn mypage-btn">
                    마이페이지
                  </Link>
                  <Link to="/" className="auth-btn logout-btn" onClick={logout}>
                    로그아웃
                  </Link>
                </>
              )
            ) : (
              <Link to="/login" className="auth-btn login-btn">
                로그인
              </Link>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
