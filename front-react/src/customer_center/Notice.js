import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import RefreshToken from "../jwt/RefreshToken";
import styles from '../Css/customer_center/Notice.module.css';

const Notice = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [visibleNotices, setVisibleNotices] = useState(10);
  const [activeTab, setActiveTab] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const isAdmin = localStorage.getItem('role') === 'ADMIN';

  useEffect(() => {
    fetchNotices(activeTab, searchQuery);
  }, [activeTab]);

  const fetchNotices = async (category, query = '') => {
    try {
      const url = `/notices/category?category=${encodeURIComponent(category)}&search=${encodeURIComponent(query)}`;
      const { data } = await RefreshToken.get(url);
      setNotices(data);
    } catch (error) {
      console.error('Error fetching notices:', error.response?.data || error.message);
      setNotices([]);
    }
  };

  const handleLoadMore = () => {
    setVisibleNotices((prev) => prev + 10);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setVisibleNotices(10);
    setSearchQuery('');
    fetchNotices(tab);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotices(activeTab, searchQuery);
  };

  return (
    <div className={styles['notice-container']}>
      <h2 className={styles['notice-title']}>공지사항</h2>

      <div className={styles['notice-tabs']}>
        {['전체', '서비스', '개정', '대출통지', '시스템 점검'].map((tab) => (
          <div
            key={tab}
            className={`${styles['notice-tab']} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      <Form className={styles['notice-search-box']} onSubmit={handleSearch}>
        <Form.Control
          type="search"
          placeholder="검색어를 입력해주세요"
          className={styles['notice-search-input']}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button className={styles['notice-search-btn']} type="submit">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </Button>
      </Form>

      <table className={styles['notice-list']}>
        <thead>
          <tr>
            <th className={styles['notice-header-title']}>제목</th>
            <th className={styles['notice-header-date']}>게시일자</th>
          </tr>
        </thead>
        <tbody>
          {notices.slice(0, visibleNotices).map((notice) => (
            <tr key={notice.id} className={styles['notice-item']}>
              <td className={styles['notice-item-title']}>
                <Link to={`/notices/${notice.id}`}>{notice.title}</Link>
              </td>
              <td className={styles['notice-item-date']}>
                {new Date(notice.date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 고정된 하단 등록 버튼 */}
      {isAdmin && (
        <div className={styles['notice-footer']}>
          <button
            onClick={() => navigate('/notices/create')}
            className={styles['notice-create-btn']}
          >
            등록
          </button>
        </div>
      )}

      {visibleNotices < notices.length && (
        <Button className={styles['notice-load-more']} onClick={handleLoadMore}>
          더보기
        </Button>
      )}
    </div>
  );
};

export default Notice;
