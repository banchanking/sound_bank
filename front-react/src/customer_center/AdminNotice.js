import React, { useState, useEffect } from "react";
import { Container, Form, Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import axios from "axios";
import '../Css/customer_center/AdminNotice.css';

const AdminNotice = () => {
  const [notices, setNotices] = useState([]);
  const [visibleNotices, setVisibleNotices] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentNotice, setCurrentNotice] = useState({ id: null, title: "", content: "", category: "서비스" });
  const [activeTab, setActiveTab] = useState("서비스");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotices(activeTab);
    }
  }, [activeTab, isAuthenticated]);

  const fetchNotices = async (category) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/notices/category/${category}`, {
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
      });
      setNotices(response.data);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  const handleLoadMore = () => {
    setVisibleNotices((prev) => prev + 10);
  };

  const handleOpenModal = (notice = { id: null, title: "", content: "", category: "서비스" }, isEdit = false) => {
    setCurrentNotice(notice);
    setIsEditMode(isEdit);
    setShowModal(true);
  };

  const handleSaveNotice = async () => {
    try {
      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/notices/${currentNotice.id}`, currentNotice, {
          headers: {
            Authorization: `Basic ${btoa(`${username}:${password}`)}`,
          },
        });
      } else {
        await axios.post("http://localhost:8080/api/notices", currentNotice, {
          headers: {
            Authorization: `Basic ${btoa(`${username}:${password}`)}`,
          },
        });
      }
      fetchNotices(activeTab);
      setShowModal(false);
    } catch (error) {
      console.error("Error saving notice:", error);
    }
  };

  const handleDeleteNotice = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/notices/${id}`, {
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
      });
      fetchNotices(activeTab);
    } catch (error) {
      console.error("Error deleting notice:", error);
    }
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

  const handleLogin = (e) => {
    e.preventDefault();
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <Container className="admin-notice-container">
        <h2 className="admin-notice-title">관리자 로그인</h2>
        <Form onSubmit={handleLogin}>
          <Form.Group controlId="formUsername">
            <Form.Label>아이디</Form.Label>
            <Form.Control
              type="text"
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formPassword">
            <Form.Label>비밀번호</Form.Label>
            <Form.Control
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Button type="submit" className="admin-login-btn">
            로그인
          </Button>
        </Form>
      </Container>
    );
  }

  return (
    <Container className="admin-notice-container">
      <h2 className="admin-notice-title">공지사항 관리</h2>

      <div className="admin-notice-tabs">
        {["서비스", "개정", "대출통지", "시스템 점검"].map((tab) => (
          <div
            key={tab}
            className={`admin-notice-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="admin-notice-actions">
        <Form className="admin-notice-search-box" onSubmit={handleSearch}>
          <Form.Control
            type="search"
            placeholder="검색어를 입력해주세요"
            className="admin-notice-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button className="admin-notice-search-btn" type="submit">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </Button>
        </Form>
        <Button className="admin-notice-add-btn" onClick={() => handleOpenModal()}>
          공지사항 추가
        </Button>
      </div>

      <table className="admin-notice-list">
        <thead>
          <tr>
            <th className="admin-notice-header-title">제목</th>
            <th className="admin-notice-header-date">게시일자</th>
            <th className="admin-notice-header-actions">관리</th>
          </tr>
        </thead>
        <tbody>
          {notices.slice(0, visibleNotices).map((notice) => (
            <tr key={notice.id} className="admin-notice-item">
              <td className="admin-notice-item-title">
                <Link to={`/notice/${notice.id}`}>{notice.title}</Link>
              </td>
              <td className="admin-notice-item-date">
                {new Date(notice.date).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </td>
              <td className="admin-notice-item-actions">
                <Button
                  variant="warning"
                  onClick={() => handleOpenModal(notice, true)}
                  style={{ marginRight: "10px" }}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteNotice(notice.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {visibleNotices < notices.length && (
        <Button className="admin-notice-load-more" onClick={handleLoadMore}>
          더보기
        </Button>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? "공지사항 수정" : "새 공지사항 추가"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formNoticeTitle">
              <Form.Label>제목</Form.Label>
              <Form.Control
                type="text"
                placeholder="제목을 입력하세요"
                value={currentNotice.title}
                onChange={(e) =>
                  setCurrentNotice({ ...currentNotice, title: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="formNoticeContent">
              <Form.Label>내용</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="내용을 입력하세요"
                value={currentNotice.content}
                onChange={(e) =>
                  setCurrentNotice({ ...currentNotice, content: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="formNoticeCategory">
              <Form.Label>카테고리</Form.Label>
              <Form.Control
                as="select"
                value={currentNotice.category}
                onChange={(e) =>
                  setCurrentNotice({ ...currentNotice, category: e.target.value })
                }
              >
                <option value="서비스">서비스</option>
                <option value="개정">개정</option>
                <option value="대출통지">대출통지</option>
                <option value="시스템 점검">시스템 점검</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSaveNotice}>
            {isEditMode ? "수정 저장" : "저장"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminNotice;