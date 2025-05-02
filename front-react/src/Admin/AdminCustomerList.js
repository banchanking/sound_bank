import React, { useEffect, useState } from "react";
import "../Css/admin/AdminCustomerList.css";
import RefreshToken from "../jwt/RefreshToken";

const AdminCustomerList = () => {
  const [customerList, setCustomerList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    RefreshToken.get("/adminPageCustomerList")
      .then((res) => {
        setCustomerList(res.data);
        setFilteredList(res.data);
      })
      .catch((err) => {
        console.error("고객 목록 조회 실패", err);
      });
  }, []);

  const handleSearch = () => {
    const term = searchTerm.toLowerCase();
    const filtered = customerList.filter(
      (customer) =>
        customer.customerId.toLowerCase().includes(term) ||
        customer.customerName.toLowerCase().includes(term) ||
        customer.customer_status.toLowerCase().includes(term)
    );
    setFilteredList(filtered);
    setCurrentPage(1);
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="adminCustomer-container">
      <h2 className="adminCustomer-title">고객 목록</h2>

      <div className="adminCustomer-searchContainer">
        <input
          type="text"
          placeholder="고객 ID, 이름 또는 상태 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="adminCustomer-searchInput"
        />
        <button className="adminCustomer-button" onClick={handleSearch}>
          검색
        </button>
      </div>

      {filteredList.length > 0 ? (
        <>
          <table className="adminCustomer-table">
            <thead>
              <tr>
                <th>고객 ID</th>
                <th>이름</th>
                <th>전화번호</th>
                <th>대표계좌번호</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((customer, idx) => (
                <tr key={idx}>
                  <td>{customer.customerId}</td>
                  <td>{customer.customerName}</td>
                  <td>{customer.customerPhoneNumber}</td>
                  <td>{customer.customer_account_number}</td>
                  <td>{customer.customer_status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="adminCustomer-pagination">
            <button
              className="adminCustomer-button"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              이전
            </button>
            <span className="adminCustomer-pageInfo">
              {currentPage} / {totalPages}
            </span>
            <button
              className="adminCustomer-button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              다음
            </button>
          </div>
        </>
      ) : (
        <p className="adminCustomer-empty">해당 조건에 맞는 고객이 없습니다.</p>
      )}
    </div>
  );
};

export default AdminCustomerList;
