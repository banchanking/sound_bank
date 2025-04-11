import React, { useState, useEffect } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import axios from "axios";
import '../Css/customer_center/Notice.css';

const Notice = () => {
  const [notices, setNotices] = useState([]);
  const [visibleNotices, setVisibleNotices] = useState(10);
  const [activeTab, setActiveTab] = useState("서비스");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchNotices(activeTab);
  }, [activeTab]);

  const fetchNotices = async (category) => {
    try {
      const response = await axios.get(`http://localhost:8080/notices/category/${category}`);
      setNotices(response.data);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  const handleLoadMore = () => {
    setVisibleNotices((prev) => prev + 10);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setVisibleNotices(10); // 탭 변경 시 표시 개수 초기화
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotices(activeTab); // 검색 시 목록 새로고침
    const filteredNotices = notices.filter((notice) =>
      notice.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setNotices(filteredNotices);
  };

  return (
    <Container className="notice-container">
      <h2 className="notice-title">공지사항</h2>

      <div className="notice-tabs">
        {["서비스", "개정", "대출통지", "시스템 점검"].map((tab) => (
          <div
            key={tab}
            className={`notice-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      <Form className="notice-search-box" onSubmit={handleSearch}>
        <Form.Control
          type="search"
          placeholder="검색어를 입력해주세요"
          className="notice-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button className="notice-search-btn" type="submit">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </Button>
      </Form>

      <table className="notice-list">
        <thead>
          <tr>
            <th className="notice-header-title">제목</th>
            <th className="notice-header-date">게시일자</th>
          </tr>
        </thead>
        <tbody>
          {notices.slice(0, visibleNotices).map((notice) => (
            <tr key={notice.id} className="notice-item">
              <td className="notice-item-title">
                <Link to={`/notice/${notice.id}`}>{notice.title}</Link>
              </td>
              <td className="notice-item-date">
                {new Date(notice.date).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {visibleNotices < notices.length && (
        <Button className="notice-load-more" onClick={handleLoadMore}>
          더보기
        </Button>
      )}
    </Container>
  );
};

export default Notice;