import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../Css/loan/Loan.css";

const LoanUpdate = () => {
  const formRef = useRef();
  const navigate = useNavigate();
  const { loan_id } = useParams();
  const [loan, setLoan] = useState([
    {
      loan_id: 0,
      loan_name: "",
      loan_min_amount: 0, // 최소 대출 금액
      loan_max_amount: 0, // 최대 대출 금액
      interest_rate: 0.0,
      loan_term: 0,
      loan_info: "",
      loan_type: "",
    },
  ]);

  const changeValue = (e) => {
    setLoan({
      ...loan,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    fetch("http://15.165.57.30:8081/api/loanDetail/" + loan_id)
      .then((res) => res.json())
      .then((res) => {
        setLoan(res);
      });
  }, [loan_id]);

  // 1. 아래 url
  const updateSubmit = (e) => {
    e.preventDefault();
    const minAmount = parseInt(loan.loan_min_amount, 10);
    const maxAmount = parseInt(loan.loan_max_amount, 10);
    if (!loan.loan_name) {
      alert("대출상품명을 입력하세요.");
      return null;
    } else if (!loan.loan_type) {
      alert("대출 유형을 선택하세요.");
      return null;
    } else if (!loan.loan_min_amount) {
      alert("최소 대출금액을 입력하세요.");
      return null;
    } else if (!loan.loan_max_amount) {
      alert("최대 대출금액을 입력하세요.");
      return null;
    } else if (minAmount >= maxAmount) {
      alert("최소 대출금액은 최대 대출금액보다 작아야 합니다.");
      return null;
    } else if (!loan.interest_rate) {
      alert("금리를 입력하세요.");
      return null;
    } else if (!loan.loan_term) {
      alert("대출 기간을 입력하세요.");
      return null;
    } else if (!loan.loan_info) {
      alert("대출 정보를 입력하세요.");
      return null;
    }
    fetch("http://15.165.57.30:8081/api/loanUpdate/" + loan_id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(loan),
    })
      .then((res) => {
        console.log(1, res);
        if (res.status === 201) {
          return res.json();
        } else {
          return null;
        }
      })
      .then((res) => {
        console.log("정상", res);
        if (res != null) {
          navigate("/loanList/");
        } else {
          alert("게시글 수정에 실패하였습니다.");
        }
      })
      .catch((error) => {
        console.log("실패", error);
      });
  };

  const resetBtn = () => {
    formRef.current.reset();
  };

  return (
    <div className="loanInsert">
      <form onSubmit={updateSubmit} ref={formRef}>
        <table className="insertTable">
          <thead>
            <tr>
              <th colSpan={2}>
                <h2>대출 상품 수정</h2>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <th>
                <label htmlFor="loan_name">대출 상품명 :</label>
              </th>
              <td>
                <input
                  type="text"
                  id="loan_name"
                  name="loan_name"
                  onChange={changeValue}
                  value={loan.loan_name}
                />
              </td>
            </tr>
            <tr>
              <th>
                <label htmlFor="loan_type">대출 유형 :</label>
              </th>
              <td>
                <select
                  name="loan_type"
                  onChange={changeValue}
                  value={loan.loan_type}
                >
                  <option value={null}>유형을 선택하세요</option>
                  <option value={"신용 대출"}>신용 대출</option>
                  <option vlaue={"담보 대출"}>담보 대출</option>
                  <option vlaue={"전세 대출"}>전세 대출</option>
                  <option vlaue={"자동차 대출"}>자동차 대출</option>
                </select>
              </td>
            </tr>
            <tr>
              <th>
                {" "}
                <label htmlFor="loan_min_amount">최소 대출금액 :</label>
              </th>
              <td>
                <input
                  type="number"
                  id="loan_min_amount"
                  name="loan_min_amount"
                  onChange={changeValue}
                  value={loan.loan_min_amount}
                />
              </td>
            </tr>
            <tr>
              <th>
                <label htmlFor="loan_max_amount">최대 대출금액 :</label>
              </th>
              <td>
                <input
                  type="number"
                  id="loan_max_amount"
                  name="loan_max_amount"
                  onChange={changeValue}
                  value={loan.loan_max_amount}
                />
              </td>
            </tr>
            <tr>
              <th>
                <label htmlFor="interest_rate">대출 금리 :</label>
              </th>
              <td>
                <input
                  type="number"
                  id="interest_rate"
                  name="interest_rate"
                  onChange={changeValue}
                  step={0.01}
                  value={loan.interest_rate}
                />
              </td>
            </tr>
            <tr>
              <th>
                <label htmlFor="loan_term">대출기간 :</label>
              </th>
              <td>
                <input
                  type="number"
                  id="loan_term"
                  name="loan_term"
                  onChange={changeValue}
                  value={loan.loan_term}
                />
              </td>
            </tr>
            <tr>
              <th>
                {" "}
                <label htmlFor="loan_info">대출 정보 :</label>
              </th>
              <td>
                {" "}
                <textarea
                  type="text"
                  id="loan_info"
                  name="loan_info"
                  onChange={changeValue}
                  value={loan.loan_info}
                />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} align="center">
                <button type="submit">등록</button>
                <button onClick={resetBtn}>리셋</button>
              </td>
            </tr>
          </tfoot>
        </table>
      </form>
    </div>
  );
};

export default LoanUpdate;
