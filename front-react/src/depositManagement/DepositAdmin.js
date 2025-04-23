import React, { useState } from "react";
import "../Css/Admin/DepositAdmin.css"; // 관리자 화면용 CSS 파일

const DepositAdmin = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "정기예금",
      interestRate: "3.5%",
      minAmount: "1,000,000원",
      maxAmount: "50,000,000원",
      term: "12개월",
    },
    {
      id: 2,
      name: "자유적금",
      interestRate: "3.2%",
      minAmount: "500,000원",
      maxAmount: "30,000,000원",
      term: "6개월 ~ 24개월",
    },
  ]); // 초기 상품 데이터
  const [newProduct, setNewProduct] = useState({
    name: "",
    interestRate: "",
    minAmount: "",
    maxAmount: "",
    term: "",
  }); // 새 상품 입력 상태

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = () => {
    if (
      !newProduct.name ||
      !newProduct.interestRate ||
      !newProduct.minAmount ||
      !newProduct.maxAmount ||
      !newProduct.term
    ) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;
    setProducts((prev) => [...prev, { id: newId, ...newProduct }]);
    setNewProduct({ name: "", interestRate: "", minAmount: "", maxAmount: "", term: "" });
    alert("상품이 추가되었습니다.");
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm("정말로 삭제하시겠습니까?")) {
      setProducts((prev) => prev.filter((product) => product.id !== id));
      alert("상품이 삭제되었습니다.");
    }
  };

  const handleEditProduct = (id) => {
    const productToEdit = products.find((product) => product.id === id);
    if (productToEdit) {
      setNewProduct(productToEdit);
      setProducts((prev) => prev.filter((product) => product.id !== id));
    }
  };

  return (
    <div className="deposit-admin-container">
      <h1 className="deposit-admin-title">예금/적금 관리자 화면</h1>

      {/* 상품 등록 */}
      <div className="product-form">
        <h2>상품 등록</h2>
        <input
          type="text"
          name="name"
          placeholder="상품명"
          value={newProduct.name}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="interestRate"
          placeholder="금리"
          value={newProduct.interestRate}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="minAmount"
          placeholder="최소 금액"
          value={newProduct.minAmount}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="maxAmount"
          placeholder="최대 금액"
          value={newProduct.maxAmount}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="term"
          placeholder="기간"
          value={newProduct.term}
          onChange={handleInputChange}
        />
        <button onClick={handleAddProduct} className="add-button">
          상품 추가
        </button>
      </div>

      {/* 상품 목록 */}
      <div className="product-list">
        <h2>상품 목록</h2>
        <table className="product-table">
          <thead>
            <tr>
              <th>상품명</th>
              <th>금리</th>
              <th>최소 금액</th>
              <th>최대 금액</th>
              <th>기간</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.interestRate}</td>
                <td>{product.minAmount}</td>
                <td>{product.maxAmount}</td>
                <td>{product.term}</td>
                <td>
                  <button
                    onClick={() => handleEditProduct(product.id)}
                    className="edit-button"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="delete-button"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepositAdmin;