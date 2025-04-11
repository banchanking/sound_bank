import { React, useState, useRef, useEffect } from "react";
import {
  Button,
  Container,
  Form,
  Nav,
  Navbar,
  NavDropdown,
} from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import "../Css/Common/Header.css";

const Header = () => {
  // 현재 열려 있는 드롭다운 메뉴 ID를 저장
  const [showDropdown, setShowDropdown] = useState(null);
  const navigate = useNavigate();

  // 드롭다운 메뉴 DOM 참조 저장 (마우스 벗어날 때 처리를 위해)
  const dropdownRefs = useRef({});

  // 현재 페이지 경로 확인 (메인 페이지인지 판단)
  const location = useLocation();
  const isMainPage = location.pathname === "/";

  // 메뉴 항목에 마우스를 올렸을 때 드롭다운 표시
  const handleMouseEnter = (id) => {
    setShowDropdown(id);
  };

  // 메뉴 밖으로 마우스가 나갔을 때 드롭다운 숨김
  const handleMouseLeave = (event) => {
    if (
      dropdownRefs.current[showDropdown] &&
      !dropdownRefs.current[showDropdown].contains(event.relatedTarget)
    ) {
      setShowDropdown(null);
    }
  };

  // 드롭다운 내부에 마우스 들어왔을 때 (닫히는 것 방지)
  const handleDropdownMouseEnter = (id) => {
    setShowDropdown(id);
  };

  // 드롭다운 내부에서 마우스가 벗어났을 때 드롭다운 닫기
  const handleDropdownMouseLeave = (event, id) => {
    if (
      dropdownRefs.current[id] &&
      !dropdownRefs.current[id].contains(event.relatedTarget)
    ) {
      setShowDropdown(null);
    }
  };
  const [loginStatus, setLoginStatus] = useState(false);
  // 드롭다운 요소 참조 저장 + 클릭 외부 감지해서 드롭다운 닫기
  useEffect(() => {
    // 컴포넌트가 마운트될 때 localStorage에서 customer_id를 확인하여 로그인 상태 설정
    const customerId = localStorage.getItem("customerId");
    setLoginStatus(!!customerId); // customerId가 있으면 true, 없으면 false로 설정

    const dropdownElements = document.querySelectorAll(".NavDropdown-menu");
    dropdownElements.forEach((element) => {
      const id = element.id;
      dropdownRefs.current[id] = element;
    });

    const handleDocumentClick = (event) => {
      const isInsideDropdown = Object.values(dropdownRefs.current).some(
        (dropdownEl) => dropdownEl && dropdownEl.contains(event.target)
      );
      if (!isInsideDropdown) {
        setShowDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStorage.getItem("customerId")]);

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("customerId");
    localStorage.removeItem("refresh_token");
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  console.log(loginStatus);
  return (
    <Navbar
      variant="dark"
      className={`nav-bar ${isMainPage ? "nav-bar-main" : "nav-bar-default"}`}
      expand="md"
    >
      <Container fluid>
        {/* 햄버거 메뉴 (모바일 화면용) */}
        <Navbar.Toggle aria-controls="nav-menu" className="menu-toggle" />

        {/* 로고 이미지 */}
        <Navbar.Brand className="logo">
          <img
            src="./Images/main/logo.png"
            alt="Sound Bank Logo"
            width="70"
            height="50"
            className="d-inline-block align-top"
          />
        </Navbar.Brand>

        <Navbar.Collapse id="nav-menu">
          <Nav className="menu">
            {/* 홈 */}
            <Link to="/" className="nav-item">
              Home
            </Link>

            {/* 예/적금 메뉴 */}
            <NavDropdown
              title="예/적금"
              id="deposit-menu"
              className="NavDropdown-menu"
              show={showDropdown === "deposit-menu"}
              onMouseEnter={() => handleMouseEnter("deposit-menu")}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="NavDropdown-menu"
                onMouseEnter={() => handleDropdownMouseEnter("deposit-menu")}
                onMouseLeave={(event) =>
                  handleDropdownMouseLeave(event, "deposit-menu")
                }
              >
                <div className="deposit-saving-row">
                  <ul>
                    <NavDropdown.Item as={Link} to="/accountOverview">
                      조회/입출금
                    </NavDropdown.Item>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/depositInquire"
                      >
                        계좌조회
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/transactionHistory"
                      >
                        거래내역
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/depositWithdrawal"
                      >
                        입출금
                      </NavDropdown.Item>
                    </li>
                  </ul>
                  <ul>
                    <NavDropdown.Item as={Link} to="/productSubscription">
                      상품가입
                    </NavDropdown.Item>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/fixedDeposit"
                      >
                        정기예금
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/installmentSavings"
                      >
                        적금
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/precautions"
                      >
                        유의사항
                      </NavDropdown.Item>
                    </li>
                  </ul>
                  <ul>
                    <NavDropdown.Item as={Link} to="/depositManagement">
                      예금관리
                    </NavDropdown.Item>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/depositChange"
                      >
                        예금변경
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/autoTransferSettings"
                      >
                        자동이체설정
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/taxPreferenceManagement"
                      >
                        세금우대관리
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/depositTermination"
                      >
                        예금해지
                      </NavDropdown.Item>
                    </li>
                  </ul>
                </div>
              </div>
            </NavDropdown>

            {/* 조회/이체 메뉴 */}
            <NavDropdown
              title="조회/이체"
              id="transfer-menu"
              className="NavDropdown-menu"
              show={showDropdown === "transfer-menu"}
              onMouseEnter={() => handleMouseEnter("transfer-menu")}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="dropdown-items-container"
                onMouseEnter={() => handleDropdownMouseEnter("transfer-menu")}
                onMouseLeave={(event) =>
                  handleDropdownMouseLeave(event, "transfer-menu")
                }
              >
                <div className="deposit-saving-row">
                  <ul>
                    <NavDropdown.Item as={Link} to="/inquire">
                      조회
                    </NavDropdown.Item>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/inquireAccont"
                      >
                        보유계좌
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/inquireTransfer"
                      >
                        거래내역
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/inquireAssets"
                      >
                        자산통계
                      </NavDropdown.Item>
                    </li>
                  </ul>

                  <ul>
                    <NavDropdown.Item as={Link} to="/transfer">
                      이체(고객)
                    </NavDropdown.Item>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/transInstant"
                      >
                        실시간 계좌이체
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/transAuto"
                      >
                        자동이체
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/transMulti"
                      >
                        다건이체
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/transLimit"
                      >
                        이체한도 변경
                      </NavDropdown.Item>
                    </li>
                  </ul>

                  <ul>
                    <NavDropdown.Item as={Link} to="/transferAdmin">
                      이체(관리자)
                    </NavDropdown.Item>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/multiAdmin"
                      >
                        다건이체 승인
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/limitAdmin"
                      >
                        이체한도 심사
                      </NavDropdown.Item>
                    </li>
                  </ul>
                </div>
              </div>
            </NavDropdown>

            {/* 대출 메뉴 */}
            <NavDropdown
              title="대출"
              id="loan-menu"
              className="NavDropdown-menu"
              show={showDropdown === "loan-menu"}
              onMouseEnter={() => handleMouseEnter("loan-menu")}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="dropdown-items-container"
                onMouseEnter={() => handleDropdownMouseEnter("loan-menu")}
                onMouseLeave={(event) =>
                  handleDropdownMouseLeave(event, "loan-menu")
                }
              >
                <div className="deposit-saving-row">
                  <ul>
                    <NavDropdown.Item as={Link} to="#">
                      고객
                    </NavDropdown.Item>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/loanApply"
                      >
                        대출 신청
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/loanStatus"
                      >
                        대출 진행현황
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/loanManage"
                      >
                        대출 관리
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/loanService"
                      >
                        기타 서비스{" "}
                      </NavDropdown.Item>
                    </li>
                  </ul>
                  <ul>
                    <NavDropdown.Item as={Link} to="#">
                      관리자
                    </NavDropdown.Item>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/loanList"
                      >
                        대출상품목록
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/loanInsertForm"
                      >
                        대출상품등록
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/loanCustomerList"
                      >
                        대출고객목록
                      </NavDropdown.Item>
                    </li>
                  </ul>
                </div>
              </div>
            </NavDropdown>

            {/* 펀드 메뉴 */}
            <NavDropdown
              title="펀드"
              id="fund-menu"
              className="NavDropdown-menu"
              show={showDropdown === "fund-menu"}
              onMouseEnter={() => handleMouseEnter("fund-menu")}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="dropdown-items-container"
                onMouseEnter={() => handleDropdownMouseEnter("fund-menu")}
                onMouseLeave={(event) =>
                  handleDropdownMouseLeave(event, "fund-menu")
                }
              >
                <div className="deposit-saving-row">
                  <ul>
                    <NavDropdown.Item as={Link} to="/fund">
                      펀드 상품
                    </NavDropdown.Item>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/fundSearch"
                      >
                        펀드 상품검색
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/fundList"
                      >
                        펀드 상품보기
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/fundTest"
                      >
                        투자성향분석 테스트
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/fundRecommend"
                      >
                        AI 펀드 추천
                      </NavDropdown.Item>
                    </li>
                  </ul>
                  <ul>
                    <NavDropdown.Item as={Link} to="/myFund">
                      My 펀드
                    </NavDropdown.Item>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/myFundInfo"
                      >
                        펀드 정보 조회
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/openAccount"
                      >
                        펀드 계좌 개설
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/closeAccount"
                      >
                        펀드 계좌 해지
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/transHistory"
                      >
                        거래 내역 (매수, 환매)
                      </NavDropdown.Item>
                    </li>
                  </ul>
                  <ul>
                    <NavDropdown.Item as={Link} to="/fundProductAdmin">
                      펀드 상품
                    </NavDropdown.Item>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/fundProductManage"
                      >
                        펀드 상품 관리
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/fundTestManage"
                      >
                        투자성향분석 테스트 관리
                      </NavDropdown.Item>
                    </li>
                  </ul>
                  <ul>
                    <NavDropdown.Item as={Link} to="/fundCustomer">
                      고객 펀드
                    </NavDropdown.Item>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/findFundCustomer"
                      >
                        고객 펀드 조회
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/openApplyList"
                      >
                        계좌 개설신청 목록
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/closeApplyList"
                      >
                        계좌 해지신청 목록
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/customerTransHistory"
                      >
                        회원 거래내역 조회
                      </NavDropdown.Item>
                    </li>
                  </ul>
                </div>
              </div>
            </NavDropdown>

            {/* 외환 메뉴 */}
            <NavDropdown
              title="외환"
              id="forex-menu"
              className="NavDropdown-menu"
              show={showDropdown === "forex-menu"}
              onMouseEnter={() => handleMouseEnter("forex-menu")}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="dropdown-items-container"
                onMouseEnter={() => handleDropdownMouseEnter("forex-menu")}
                onMouseLeave={(event) =>
                  handleDropdownMouseLeave(event, "forex-menu")
                }
              >
                {/* customer 시작 */}
                <div className="deposit-saving-row">
                  <ul>
                    <NavDropdown.Item as={Link} to="#">
                      외환
                    </NavDropdown.Item>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/ex_rate"
                      >
                        환율조회/환율계산기
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/ex_request"
                      >
                        환전신청하기
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/admin_ex_request_list"
                      >
                        환전 신청 현황
                      </NavDropdown.Item>
                    </li>
                  </ul>
                  <ul>
                    <NavDropdown.Item as={Link} to="#">
                      지갑 관리
                    </NavDropdown.Item>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/exchange_wallet_status"
                      >
                        MY 지갑
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/exchange_list"
                      >
                        환전내역 조회
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/ex_account_management"
                      >
                        외환 지갑 해지
                      </NavDropdown.Item>
                    </li>
                  </ul>
                  {/* customer 끝 */}

                  {/* admin 시작 */}
                  <ul>
                    <NavDropdown.Item as={Link} to="#">
                      (관리자)
                    </NavDropdown.Item>
                    <li>
                      <NavDropdown.Item
                        className="sub-item"
                        as={Link}
                        to="/admin_ex_management"
                      >
                        지갑상태변경
                      </NavDropdown.Item>
                    </li>                    
                  </ul>
                  {/* admin 끝 */}
                </div>
              </div>
            </NavDropdown>
            {/* 외환메뉴 끝 */}

            {/* 고객센터 메뉴 */}
            <NavDropdown
              title="고객센터"
              id="support-menu"
              className="NavDropdown-menu"
              show={showDropdown === "support-menu"}
              onMouseEnter={() => handleMouseEnter("support-menu")}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="dropdown-items-container"
                onMouseEnter={() => handleDropdownMouseEnter("support-menu")}
                onMouseLeave={(event) =>
                  handleDropdownMouseLeave(event, "support-menu")
                }
              >
                <div className="deposit-saving-row" style={{ display: "flex", alignItems: "flex-start" }}>
                  {/* 고객센터 설명 문구 */}
                  <div className="customer-service-header" style={{ marginRight: "20px", padding: "10px", maxWidth: "200px" }}>
                    <h2 style={{ color: "#fff", marginBottom: "15px" }}>고객센터</h2>
                    <p style={{ color: "#ccc", fontSize: "14px", lineHeight: "1.5" }}>
                      SoundBank<br/> 고객센터에서 365일 ! <br/>24시간 상담이 가능합니다.
                    </p>
                  </div>

                  {/* 이용안내 */}
                  <ul>
                    <NavDropdown.Item as={Link} to="#">이용안내</NavDropdown.Item>
                    <li>
                      <NavDropdown.Item className="sub-item" as={Link} to="/notice">
                        공지사항
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item className="sub-item" as={Link} to="/businesshour">
                        이용안내 시간
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item className="sub-item" as={Link} to="charge">
                        금리 안내
                      </NavDropdown.Item>
                    </li>                    
                  </ul>

                  {/* 온라인 상담 */}
                  <ul>
                  <NavDropdown.Item as={Link} to="#">온라인 상담</NavDropdown.Item>
                    <li>
                      <NavDropdown.Item className="sub-item" as={Link} to="/faq">
                        자주 묻는 질문
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item className="sub-item" as={Link} to="/chatbot">
                        누르는 상담
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item className="sub-item" as={Link} to="/voicebot">
                        말하는 상담
                      </NavDropdown.Item>
                    </li>
                  </ul>

                  {/* 인증도우미 */}
                  <ul>
                    <NavDropdown.Item as={Link} to="#">인증도우미</NavDropdown.Item>
                    <li>
                      <NavDropdown.Item className="sub-item" as={Link} to="/bankauth">
                        증명서 진위 확인
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item className="sub-item" as={Link} to="/idauth">
                        주민등록증 인증
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item className="sub-item" as={Link} to="/bankauth">
                        통장 인증
                      </NavDropdown.Item>
                    </li>
                  </ul>

                  {/* 문의 */}
                  <ul>
                    <NavDropdown.Item as={Link} to="#">문의</NavDropdown.Item>
                    <li>
                      <NavDropdown.Item className="sub-item" as={Link} to="#">
                        사업 제휴
                      </NavDropdown.Item>
                    </li>
                    <li>
                      <NavDropdown.Item className="sub-item" as={Link} to="#">
                        불법도박 계좌 신고
                      </NavDropdown.Item>
                    </li>
                 </ul>                              
                </div>
              </div>
            </NavDropdown>

            {/* 검색창 */}
            <Form className="search-box">
              <Form.Control
                type="search"
                placeholder="Search"
                className="search-input"
              />
              <Button className="search-btn">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </Button>
            </Form>
          </Nav>

          {/* 계좌개설/로그인 버튼 */}
          <div className="auth-buttons">
            <Link to="/join" className="auth-btn signup-btn">
              계좌개설
            </Link>
            {loginStatus ? (
              <Link to="/" className="auth-btn logout-btn" onClick={logout}>
                로그아웃
              </Link>
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
