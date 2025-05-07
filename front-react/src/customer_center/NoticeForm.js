import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import RefreshToken from '../jwt/RefreshToken';
import styles from '../Css/customer_center/NoticeForm.module.css';
const NoticeForm = () => {
  const { id } = useParams();
  const isEdit    = Boolean(id);
  const navigate  = useNavigate();
  const [form, setForm] = useState({
    category: '', title: '', content: ''
  });

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (isEdit) {
      RefreshToken.get(`/notices/${id}`)
        .then(res => setForm(res.data))
        .catch(err => console.error(err));
    }
  }, [isEdit, id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const api = isEdit
      ? RefreshToken.put(`/notices/edit/${id}`, form)
      : RefreshToken.post('/notices', form);

    api
      .then(() => {
        alert(isEdit ? '수정 완료' : '등록 완료');
        navigate('/notices');
      })      
      .catch(err => console.error('Error saving notice:', err));
  };

  return (
    <Form className={styles.noticeFormContainer} onSubmit={handleSubmit}>
      <Form.Group className={styles.formGroup} controlId="category">
        <Form.Label className={styles.formLabel}>카테고리</Form.Label>
        <Form.Control as="select" name="category" className={styles.formControl}
          value={form.category} onChange={handleChange} required>
          <option value="">-- 선택 --</option>
          <option value="서비스">서비스</option>
          <option value="개정">개정</option>
          <option value="대출통지">대출통지</option>
          <option value="시스템 점검">시스템 점검</option>
        </Form.Control>
      </Form.Group>

      <Form.Group controlId="title">
        <Form.Label>제목</Form.Label>
        <Form.Control
          type="text" name="title" value={form.title}
          onChange={handleChange}
          placeholder="제목을 입력하세요" required
        />
      </Form.Group>

      <Form.Group controlId="content">
        <Form.Label>내용</Form.Label>
        <Form.Control
          as="textarea" name="content" value={form.content}
          onChange={handleChange} rows={10}
          placeholder="내용을 입력하세요" required
        />
      </Form.Group>

      <Button variant="primary" type="submit" className={styles.buttonGroup}>
        {isEdit ? '수정' : '등록'}
      </Button>
      <Button variant="secondary" onClick={() => navigate(-1)} className={`${styles.secondaryButton}`} >
        취소
      </Button>
    </Form>
  );
};

export default NoticeForm;
