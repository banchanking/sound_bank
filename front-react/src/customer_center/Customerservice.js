import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../Css/customer_center/CustomerService.css";

const CustomerService = () => {
  return (
    <Container fluid className="customer-service-container">
      <div className="customer-service-header text-center">
        <h2 className="customer-service-title">고객센터</h2>
        <p className="customer-service-subtitle">
          SoundBank 고객센터에서 365일 24시간 상담이 가능합니다.
        </p>
      </div>
      
      <Row className="customer-service-row">
        {[ 
          { title: "이용안내", links: [
              { text: "공지사항", path: "/notice" },
              { text: "자주 묻는 질문", path: "/faq" },
              { text: "이용안내 시간", path: "/business_hour" },
              { text: "금리 안내", path: "#" },
              { text: "수수료 안내", path: "#" }
          ]},
          { title: "온라인 상담", links: [
              { text: "자주 묻는 질문", path: "/chatbot" },
              { text: "누르는 상담", path: "/voicebot" },
              { text: "말하는 상담", path: "/bankauth" }
          ]},
          { title: "인증도우미", links: [
              { text: "증명서 진위 확인", path: "/bankauth" },
              { text: "주민등록증 인증", path: "/idauth" },
              { text: "통장 인증", path: "/bankauth" }
          ]},
          { title: "문의", links: [
              { text: "사업 제휴", path: "#" },
              { text: "불법도박 계좌 신고", path: "#" }
          ]},
          { title: "기타", links: [
              { text: "고객의 소리", path: "#" },
              { text: "서비스 개선 제안", path: "#" }
          ]}
        ].map((section, index) => (
          <Col key={index} xs={12} md={2} className="customer-service-col">
            <h5>{section.title}</h5>
            <ul>
              {section.links.map((link, i) => (
                <li key={i}>
                  <Link to={link.path}>{link.text}</Link>
                </li>
              ))}
            </ul>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default CustomerService;