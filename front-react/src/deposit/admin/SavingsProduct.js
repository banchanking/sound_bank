import React, { useEffect, useState } from 'react';
import RefreshToken from '../../jwt/RefreshToken';
import '../../Css/depositcss/SavingsProduct.css';

function SavingsProduct() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    productName: '',
    productType: '',
    interestRate: '',
    minAmount: '',
    maxAmount: '',
    termMonths: '',
    productDescription: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await RefreshToken.get('/deposit/products/savings');
      setProducts(res.data);
    } catch {
      alert('적금 상품 조회 실패');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (product = null) => {
    if (product) {
      setForm(product);
      setEditingId(product.id);
    } else {
      setForm({
        productName: '',
        productType: '',
        interestRate: '',
        minAmount: '',
        maxAmount: '',
        termMonths: '',
        productDescription: ''
      });
      setEditingId(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    const endpoint = editingId
      ? `/deposit/products/savings/${editingId}`
      : `/deposit/products/savings`;
    const method = editingId ? 'put' : 'post';

    try {
      await RefreshToken[method](endpoint, {
        ...form,
        productType: form.productType.toLowerCase()
      });
      alert('상품 저장 완료');
      fetchProducts();
      closeModal();
    } catch {
      alert('상품 저장 실패');
    }
  };

  const handleDelete = async (id) => {
    try {
      await RefreshToken.delete(`/deposit/products/savings/${id}`);
      alert('삭제 완료');
      fetchProducts();
    } catch {
      alert('삭제 실패');
    }
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentData = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderType = (type) => {
    const map = {
      installment: '적금',
      housing: '주택청약적금',
      pension: '연금적금',
      youth: '청년적금',
      fixed: '정기적금'
    };
    return map[type?.toLowerCase()] || type;
  };

  return (
    <div className="deposit-container">
      <div className="deposit-header">
        <h2>적금 상품 관리</h2>
      </div>
      <button className="depositAddP-btn" onClick={() => openModal()}>상품 추가</button>

      <table className="deposit-table">
        <thead>
          <tr>
            <th>상품명</th>
            <th>유형</th>
            <th>이자율</th>
            <th>최소금액</th>
            <th>최대금액</th>
            <th>기간</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map(p => (
            <tr key={p.id}>
              <td>{p.productName}</td>
              <td>{renderType(p.productType)}</td>
              <td>{p.interestRate}%</td>
              <td>{Number(p.minAmount).toLocaleString()}원</td>
              <td>{Number(p.maxAmount).toLocaleString()}원</td>
              <td>{p.termMonths}개월</td>
              <td>
                <button onClick={() => openModal(p)} className="btnBlue">수정</button>
                <button onClick={() => handleDelete(p.id)} className="btnRed">삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pageButtonArea">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx + 1}
              className={`pageButton ${currentPage === idx + 1 ? 'activePage' : ''}`}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{editingId ? '상품 수정' : '상품 추가'}</h3>
            <input name="productName" placeholder="상품명" value={form.productName} onChange={handleChange} />
            <select name="productType" value={form.productType} onChange={handleChange}>
              <option value="">유형 선택</option>
              <option value="installment">적금</option>
              <option value="housing">주택청약적금</option>
              <option value="pension">연금적금</option>
              <option value="youth">청년적금</option>
              <option value="fixed">정기적금</option>
            </select>
            <input name="interestRate" placeholder="이자율 (%)" value={form.interestRate} onChange={handleChange} />
            <input name="minAmount" placeholder="최소금액" value={form.minAmount} onChange={handleChange} />
            <input name="maxAmount" placeholder="최대금액" value={form.maxAmount} onChange={handleChange} />
            <input name="termMonths" placeholder="기간(개월)" value={form.termMonths} onChange={handleChange} />
            <textarea name="productDescription" placeholder="상품 설명" value={form.productDescription} onChange={handleChange}></textarea>
            <div className="modal-btns">
              <button onClick={handleSubmit} className="btnBlue">저장</button>
              <button onClick={closeModal} className="btnGray">취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavingsProduct;
