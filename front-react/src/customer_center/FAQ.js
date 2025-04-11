import React, { useState } from "react";
import { Container, Tabs, Tab, Accordion, Form, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import "../Css/customer_center/FAQ.css";

const FAQ = () => {
  // FAQ 데이터 (카테고리별로 분류, 나중에 API로 대체 가능)
  const faqData = {
    all: [
      { question: "계좌 개설은 어떻게 하나요?", answer: "홈페이지 우측 상단의 '계좌개설' 버튼을 클릭하여 진행할 수 있습니다." },
      { question: "비밀번호를 잊어버렸어요. 어떻게 해야 하나요?", answer: "로그인 페이지에서 '비밀번호 찾기'를 통해 재설정할 수 있습니다." },
      { question: "환전 수수료는 얼마인가요?", answer: "환전 수수료는 통화와 금액에 따라 다르며, '외환' 메뉴에서 확인 가능합니다." },
      { question: "대출 신청은 어떻게 하나요?", answer: "대출 메뉴에서 '대출 신청'을 선택하여 진행할 수 있습니다." },
    ],
    account: [
      { question: "계좌 개설은 어떻게 하나요?", answer: "홈페이지 우측 상단의 '계좌개설' 버튼을 클릭하여 진행할 수 있습니다." },
      { question: "계좌 해지는 어떻게 하나요?", answer: "예금관리 메뉴에서 '예금해지'를 선택하여 진행할 수 있습니다." },
    ],
    transfer: [
      { question: "이체 한도는 어떻게 변경하나요?", answer: "이체 메뉴에서 '이체한도 변경'을 선택하여 설정할 수 있습니다." },
    ],
    loan: [
      { question: "대출 신청은 어떻게 하나요?", answer: "대출 메뉴에서 '대출 신청'을 선택하여 진행할 수 있습니다." },
    ],
    forex: [
      { question: "환전 수수료는 얼마인가요?", answer: "환전 수수료는 통화와 금액에 따라 다르며, '외환' 메뉴에서 확인 가능합니다." },
    ],
    fund:[
      {question: "펀드 해지 시 수수료는 어떻게 되나요?" ,answer:"연금저축신탁 해지 시 기타소득세가 부과될 수 있으며, 소득공제 여부에 따라 세율이 달라집니다. 영업점에서 상담 후 처리하세요."}
    ],
  };

  // 검색어 상태
  const [searchTerm, setSearchTerm] = useState("");
  // 선택된 탭 상태
  const [activeTab, setActiveTab] = useState("all");

  // 검색어와 탭에 따라 FAQ 필터링
  const filteredFAQs = faqData[activeTab].filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="faq-container">
      {/* 제목 */}
      <h2 className="faq-title">자주하는 질문</h2>

      {/* 검색창 */}
      <div className="faq-search-box">
        <Form className="faq-search-form">
          <Form.Control
            type="search"
            placeholder="궁금한 점을 검색해 보세요"
            className="faq-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button className="faq-search-btn">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </Button>
        </Form>
      </div>

      {/* 추천 검색어 (태그) */}
      <div className="faq-tags">
        <span className="faq-tag">계좌 개설</span>
        <span className="faq-tag">비밀번호</span>
        <span className="faq-tag">환전</span>
        <span className="faq-tag">펀드</span>
        <span className="faq-tag">대출</span>
      </div>

      {/* 카테고리 탭 */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="faq-tabs"
      >
        <Tab eventKey="all" title="전체" />
        <Tab eventKey="account" title="계좌" />
        <Tab eventKey="transfer" title="이체" />
        <Tab eventKey="loan" title="대출" />
        <Tab eventKey="forex" title="외환" />
        <Tab eventKey="fund" title="펀드" />
      </Tabs>

      {/* FAQ 목록 */}
      <div className="faq-list">
        <Accordion>
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <Accordion.Item eventKey={index.toString()} key={index} className="faq-item">
                <Accordion.Header>{faq.question}</Accordion.Header>
                <Accordion.Body>{faq.answer}</Accordion.Body>
              </Accordion.Item>
            ))
          ) : (
            <p className="faq-no-results">검색 결과가 없습니다.</p>
          )}
        </Accordion>
      </div>
    </Container>
  );
};

export default FAQ;