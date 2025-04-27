// 리팩토링된 부분만 포함
import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import "../../Css/loan/MyInterest.css";
import { useNavigate } from "react-router-dom";

const MyInterest = ({ onRefresh }) => {
  const navigate = useNavigate();
  const [interestList, setInterestList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const paymentRequest = (item) => {
    RefreshToken.post("/paymentRequest", {
      customerId: localStorage.getItem("customerId"),
      accountNumber: item.accountNumber,
      loanId: item.loanId,
      repaymentAmount: item.repaymentAmount,
      interestpaymentNo: item.interestPaymentNo,
    })
      .then((res) => {
        alert(res.data);
        onRefresh();
      })
      .catch((err) => {
        alert(err.response?.data || "서버 오류 또는 네트워크 문제 발생");
      });
  };

  useEffect(() => {
    if (!localStorage.getItem("customerId")) {
      alert("로그인이 필요한 서비스입니다.");

      navigate("/");
      return;
    }
    RefreshToken.get("/myInterestList", {
      params: { customerId: localStorage.getItem("customerId") },
    })
      .then((res) => {
        setInterestList(res.data);
        setFilteredList(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [onRefresh]);

  const handleDateFilter = () => {
    // 둘 다 비었을 경우 전체 목록 유지
    if (!startDate && !endDate) {
      setFilteredList(interestList);
      return;
    }

    const filtered = interestList.filter((item) => {
      const repaymentDate = new Date(item.repaymentDate);

      if (startDate && !endDate) {
        return repaymentDate >= new Date(startDate);
      } else if (!startDate && endDate) {
        return repaymentDate <= new Date(endDate);
      } else {
        return (
          repaymentDate >= new Date(startDate) &&
          repaymentDate <= new Date(endDate)
        );
      }
    });

    setFilteredList(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const currentData = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="myInterest-container">
      <div className="myInterest-filterBar">
        <div className="myInterest-dateGroup">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <button onClick={() => setStartDate("")}>초기화</button>
        </div>
        <span>~</span>
        <div className="myInterest-dateGroup">
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button onClick={() => setEndDate("")}>초기화</button>
        </div>
        <button onClick={handleDateFilter}>검색</button>
      </div>

      {isLoading ? (
        <div className="myInterest-spinnerContainer">
          <div className="myInterest-spinner"></div>
        </div>
      ) : currentData.length > 0 ? (
        <>
          <table className="myInterest-table">
            <thead>
              <tr>
                <th colSpan={11} className="myInterest-title">
                  {localStorage.getItem("customerId")}님의 대출 이자 납입 현황
                </th>
              </tr>
              <tr>
                {[
                  "no",
                  "가입상품명",
                  "상환 계좌",
                  "총 납입금액",
                  "납입 이자",
                  "납입 원금",
                  "상환 회차",
                  "예정일",
                  "납부일",
                  "납입 상태",
                  "납입 신청",
                ].map((title, idx) => (
                  <th key={idx}>{title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((item) => (
                <tr key={item.no}>
                  <td>{item.no}</td>
                  <td>{item.loanName}</td>
                  <td>{item.accountNumber}</td>
                  <td>{item.repaymentAmount.toLocaleString("ko-KR")}원</td>
                  <td>{item.interestAmount.toLocaleString("ko-KR")}원</td>
                  <td>{item.principalAmount.toLocaleString("ko-KR")}원</td>
                  <td>{item.repaymentTerm}</td>
                  <td>{formatDate(item.repaymentDate)}</td>
                  <td>{formatDate(item.actualRepaymentDate)}</td>
                  <td>{item.repaymentStatus}</td>
                  <td>
                    <button
                      className="myInterest-button"
                      onClick={() => paymentRequest(item)}
                      disabled={item.repaymentStatus === "납부완료"}
                    >
                      {item.repaymentStatus === "납부완료"
                        ? "납부완료"
                        : "납부신청"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="myInterest-pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={currentPage === i + 1 ? "active" : ""}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="myInterest-empty">이자 납입 내역이 존재하지 않습니다.</p>
      )}
    </div>
  );
};

export default MyInterest;
