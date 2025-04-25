import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import styles from "../Css/customer_center/FAQ.module.css";

const FAQ = () => {
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
    fund: [
      { question: "펀드 해지 시 수수료는 어떻게 되나요?", answer: "연금저축신탁 해지 시 기타소득세가 부과될 수 있으며, 소득공제 여부에 따라 세율이 달라집니다. 영업점에서 상담 후 처리하세요." }
    ],
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [openIndex, setOpenIndex] = useState(null); // 열리는 질문 상태

  const filteredFAQs = faqData[activeTab].filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabList = [
    { key: "all", label: "전체" },
    { key: "account", label: "계좌" },
    { key: "transfer", label: "이체" },
    { key: "loan", label: "대출" },
    { key: "forex", label: "외환" },
    { key: "fund", label: "펀드" },
  ];

  return (
    <div className={styles["faq-container"]}>
      <h2 className={styles["faq-title"]}>자주하는 질문</h2>

      <div className={styles["faq-search-box"]}>
        <Form className={styles["faq-search-form"]}>
          <Form.Control
            type="search"
            placeholder="궁금한 점을 검색해 보세요"
            className={styles["faq-search-input"]}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button className={styles["faq-search-btn"]}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </Button>
        </Form>
      </div>

      <div className={styles["faq-tags"]}>
        <span className={styles["faq-tag"]}>계좌 개설</span>
        <span className={styles["faq-tag"]}>비밀번호</span>
        <span className={styles["faq-tag"]}>환전</span>
        <span className={styles["faq-tag"]}>펀드</span>
        <span className={styles["faq-tag"]}>대출</span>
      </div>

      <div className={styles["faq-tabs"]}>
        {tabList.map((tab) => (
          <button
            key={tab.key}
            className={`${styles["faq-tab"]} ${activeTab === tab.key ? styles["active"] : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles["faq-list"]}>
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className={styles["faq-item"]}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className={styles["faq-question"]}>{faq.question}</div>
              <div
                className={`${styles["faq-answer-wrapper"]} ${openIndex === index ? styles["open"] : ""}`}
              >
                <div className={styles["faq-answer"]}>{faq.answer}</div>
              </div>
            </div>
          ))
        ) : (
          <p className={styles["faq-no-results"]}>검색 결과가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default FAQ;
