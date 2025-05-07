import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RefreshToken from '../jwt/RefreshToken';
import styles from '../Css/customer_center/NoticeDetail.module.css';

const NoticeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchNotice();
    setIsAdmin(localStorage.getItem('role') === 'ADMIN');
  }, [id]);

  const fetchNotice = async () => {
    try {
      const res = await RefreshToken.get(`/notices/${id}`);
      setNotice(res.data);
    } catch {
      console.error('Error fetching notice:');
      setNotice(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await RefreshToken.delete(`/notices/${id}`);
      alert('삭제 완료');
      navigate('/notices');
    } catch (err) {
      alert('삭제 실패');
      console.error('Error deleting notice:', err);
    }
  };

  if (!notice) {
    return <div className={styles['notice-container']}>로딩 중...</div>;
  }

  const formattedDate = new Date(notice.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return (
    <div className={styles['notice-container']}>
      <h2 className={styles['notice-title']}>공지사항 상세</h2>

      <div className={styles['notice-top-btn-wrapper']}>
        <button
          onClick={() => navigate('/notices')}
          className={styles['notice-list-btn']}
        >
          목록
        </button>
      </div>

      <table className={styles['notice-detail-table']}>
        <tbody>
          <tr>
            <th className={styles['notice-detail-th']}>제목</th>
            <td className={styles['notice-detail-td']}>{notice.title}</td>
          </tr>
          <tr>
            <th className={styles['notice-detail-th']}>게시일자</th>
            <td className={styles['notice-detail-td']}>{formattedDate}</td>
          </tr>
          <tr>
            <th className={styles['notice-detail-th']}>내용</th>
            <td className={styles['notice-detail-td']}>
              <div className={styles['notice-content']}>{notice.content}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {isAdmin && (
        <div className={styles['notice-actions']}>
          <button
            onClick={() => navigate(`/notices/edit/${id}`)}
            className={styles['notice-edit-btn']}
          >
            수정
          </button>
          <button
            onClick={() => handleDelete(id)}
            className={styles['notice-delete-btn']}
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
};

export default NoticeDetail;
