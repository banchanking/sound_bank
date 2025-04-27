import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "../Css/customer_center/Notice.module.css"; // 모듈화된 CSS import

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
      const response = await axios.get(`http://15.165.57.30:8000/notices/category/${category}`);
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
    setVisibleNotices(10);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotices(activeTab);
    const filteredNotices = notices.filter((notice) =>
      notice.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setNotices(filteredNotices);
  };

  return (
    
    <div className={styles["notice-container"]}>
      {/* 기존 클래스명: notice-container */}
      
      <h2 className={styles["notice-title"]}>공지사항</h2>
      {/* 기존 클래스명: notice-title */}

      
      <div className={styles["notice-tabs"]}>
        {/* 기존 클래스명: notice-tabs */}
        {["서비스", "개정", "대출통지", "시스템 점검"].map((tab) => (
          
          <div
            key={tab}
            className={`${styles["notice-tab"]} ${activeTab === tab ? styles.active : ""}`}
            // 기존 클래스명: notice-tab
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* 기존 클래스명: notice-search-box */}
      <Form className={styles["notice-search-box"]} onSubmit={handleSearch}>
        {/* 기존 클래스명: notice-search-input */}
        <Form.Control
          type="search"
          placeholder="검색어를 입력해주세요"
          className={styles["notice-search-input"]}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* 기존 클래스명: notice-search-btn */}
        <Button className={styles["notice-search-btn"]} type="submit">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </Button>
      </Form>

      {/* 기존 클래스명: notice-list */}
      <table className={styles["notice-list"]}>
        <thead>
          <tr>
            {/* 기존 클래스명: notice-header-title */}
            <th className={styles["notice-header-title"]}>제목</th>
            {/* 기존 클래스명: notice-header-date */}
            <th className={styles["notice-header-date"]}>게시일자</th>
          </tr>
        </thead>
        <tbody>
          {notices.slice(0, visibleNotices).map((notice) => (
            // 기존 클래스명: notice-item
            <tr key={notice.id} className={styles["notice-item"]}>
              {/* 기존 클래스명: notice-item-title */}
              <td className={styles["notice-item-title"]}>
                <Link to={`/notice/${notice.id}`}>{notice.title}</Link>
              </td>
              {/* 기존 클래스명: notice-item-date */}
              <td className={styles["notice-item-date"]}>
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
        // 기존 클래스명: notice-load-more
        <Button className={styles["notice-load-more"]} onClick={handleLoadMore}>
          더보기
        </Button>
      )}
    </div>
  );
};

export default Notice;
