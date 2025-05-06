import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { request } from '../jwt/AxiosToken'; // request import
import styles from '../Css/customer_center/Notice.module.css';

const Notice = () => {
  const [notices, setNotices] = useState([]);
  const [visibleNotices, setVisibleNotices] = useState(10);
  const [activeTab, setActiveTab] = useState('서비스');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotices(activeTab, searchQuery);
  }, [activeTab]);

  const fetchNotices = async (category, query = '') => {
    try {
      const response = await request.get(`/notices/category/${category}`, {
        params: { search: query }, // 서버 측 검색 쿼리
      });
      setNotices(response.data);
    } catch (error) {
      console.error('Error fetching notices:', error.response?.data || error.message);
      setNotices([]); // 오류 시 빈 배열
    }
  };

  const handleLoadMore = () => {
    setVisibleNotices((prev) => prev + 10);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setVisibleNotices(10);
    setSearchQuery(''); // 탭 변경 시 검색어 초기화
    fetchNotices(tab);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotices(activeTab, searchQuery); // 서버 측 검색
  };

  return (
    <div className={styles['notice-container']}>
      <h2 className={styles['notice-title']}>공지사항</h2>
      <div className={styles['notice-tabs']}>
        {['서비스', '개정', '대출통지', '시스템 점검'].map((tab) => (
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
                <Link to={`/notice/${notice.id}`}>{notice.title}</Link>
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
      {visibleNotices < notices.length && (
        <Button className={styles['notice-load-more']} onClick={handleLoadMore}>
          더보기
        </Button>
      )}
    </div>
  );
};

export default Notice;