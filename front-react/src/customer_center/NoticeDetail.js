import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import RefreshToken from '../jwt/RefreshToken';
import styles from '../Css/customer_center/Notice.module.css';

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
      setNotice(null); // 오류 시 null로 설정
    }
  };

  const checkAdminRole = () => {
    const role = localStorage.getItem('role');
    if (!role) return;
    try {
      const payload = JSON.parse(atob(role.split('.')[1]));
      setIsAdmin(payload.role === 'ADMIN');
    } catch {
      setIsAdmin(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await RefreshToken.delete(`/notices/${id}`);
      alert('삭제 완료');
      navigate('/notices'); // 삭제 후 목록으로 이동
    }catch (err) {
      alert('삭제 실패');
      // 오류 처리 로직 추가
      console.error('Error deleting notice:', err);
    }
  };

  if (!notice) {
    return <div className={styles['notice-container']}>로딩 중...</div>;
  }

  // 날짜 포맷 유틸
  const formattedDate = new Date(notice.date).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  return (
    <div className={styles['notice-container']}>
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
              <div className={styles['notice-content']}>
                {notice.content}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {isAdmin && (
        <div className={styles['notice-actions']}>
          <Button
            variant="primary"
            onClick={() => navigate(`/notices/edit/${id}`)}
          >
            수정
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDelete(id)}
            className="ml-2"
          >
            삭제
          </Button>
        </div>
      )}

      <Button
        variant="secondary"
        onClick={() => navigate('/notices')}
        className="mt-3"
      >
        목록으로 돌아가기
      </Button>
    </div>
  );
};

export default NoticeDetail;
