import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import RefreshToken from "../../jwt/RefreshToken";
import "../../Css/loan/LoanInsert.css";

const LoanInsertForm = () => {
  const navigate = useNavigate();
  const formRef = useRef();
  const [loan, setLoan] = useState({
    loan_name: "",
    loan_min_amount: null,
    loan_max_amount: null,
    interest_rate: null,
    prepayment_penalty: null,
    loan_term: null,
    loan_info: "",
    loan_type: "",
    term_title: "",
    term_content: "",
  });

  const changeValue = (e) => {
    setLoan({
      ...loan,
      [e.target.name]: e.target.value,
    });
  };

  const resetBtn = () => {
    formRef.current.reset();
  };

  const submitLoan = (e) => {
    e.preventDefault();
    const minAmount = parseInt(loan.loan_min_amount, 10);
    const maxAmount = parseInt(loan.loan_max_amount, 10);
    if (!loan.loan_name) return alert("대출상품명을 입력하세요.");
    if (!loan.loan_type) return alert("대출 유형을 선택하세요.");
    if (!loan.loan_min_amount) return alert("최소 대출금액을 입력하세요.");
    if (!loan.loan_max_amount) return alert("최대 대출금액을 입력하세요.");
    if (minAmount >= maxAmount)
      return alert("최소 대출금액은 최대 대출금액보다 작아야 합니다.");
    if (!loan.interest_rate) return alert("금리를 입력하세요.");
    if (!loan.loan_term) return alert("대출 기간을 입력하세요.");
    if (!loan.loan_info) return alert("대출 정보를 입력하세요.");

    RefreshToken.post("/loanInsert", loan)
      .then(() => {
        alert("상품이 등록되었습니다.");
        navigate("/loanList");
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        alert("서버 오류 발생!");
      });
  };

  return (
    <div className="loanInsertContainer">
      <h2 className="loanInsertTitle">대출 상품 등록</h2>
      <form ref={formRef} onSubmit={submitLoan} className="loanInsertForm">
        <table className="loanInsertTable">
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
                />
              </td>
            </tr>
            <tr>
              <th>
                <label htmlFor="loan_type">대출 유형 :</label>
              </th>
              <td>
                <select name="loan_type" onChange={changeValue} defaultValue="">
                  <option value="">유형을 선택하세요</option>
                  <option value="신용 대출">신용 대출</option>
                  <option value="담보 대출">담보 대출</option>
                  <option value="전세 대출">전세 대출</option>
                  <option value="자동차 대출">자동차 대출</option>
                  <option value="정책자금 대출">정책자금 대출</option>
                </select>
              </td>
            </tr>
            <tr>
              <th>
                <label htmlFor="loan_min_amount">최소 대출금액 :</label>
              </th>
              <td>
                <input
                  type="text"
                  id="loan_min_amount"
                  name="loan_min_amount"
                  value={loan.loan_min_amount || ""}
                  onChange={(e) =>
                    setLoan({
                      ...loan,
                      loan_min_amount: e.target.value.replace(/[^0-9]/g, ""),
                    })
                  }
                />
              </td>
            </tr>
            <tr>
              <th>
                <label htmlFor="loan_max_amount">최대 대출금액 :</label>
              </th>
              <td>
                <input
                  type="text"
                  id="loan_max_amount"
                  name="loan_max_amount"
                  value={loan.loan_max_amount || ""}
                  onChange={(e) =>
                    setLoan({
                      ...loan,
                      loan_max_amount: e.target.value.replace(/[^0-9]/g, ""),
                    })
                  }
                />
              </td>
            </tr>
            <tr>
              <th>
                <label htmlFor="interest_rate">대출 금리 :</label>
              </th>
              <td>
                <input
                  type="text"
                  id="interest_rate"
                  name="interest_rate"
                  value={loan.interest_rate || ""}
                  onChange={(e) =>
                    setLoan({
                      ...loan,
                      interest_rate: e.target.value.replace(/[^0-9.]/g, ""),
                    })
                  }
                />
              </td>
            </tr>
            <tr>
              <th>
                <label htmlFor="prepayment_penalty">
                  중도 상환수수료(율) :
                </label>
              </th>
              <td>
                <input
                  type="text"
                  id="prepayment_penalty"
                  name="prepayment_penalty"
                  value={loan.prepayment_penalty || ""}
                  onChange={(e) =>
                    setLoan({
                      ...loan,
                      prepayment_penalty: e.target.value.replace(
                        /[^0-9.]/g,
                        ""
                      ),
                    })
                  }
                />
              </td>
            </tr>
            <tr>
              <th>
                <label htmlFor="loan_term">대출기간 :</label>
              </th>
              <td>
                <input
                  type="text"
                  id="loan_term"
                  name="loan_term"
                  value={loan.loan_term || ""}
                  onChange={(e) =>
                    setLoan({
                      ...loan,
                      loan_term: e.target.value.replace(/[^0-9]/g, ""),
                    })
                  }
                />
              </td>
            </tr>
            <tr>
              <th>
                <label htmlFor="loan_info">대출 정보 :</label>
              </th>
              <td>
                <textarea
                  id="loan_info"
                  name="loan_info"
                  onChange={changeValue}
                />
              </td>
            </tr>
            <tr>
              <th>
                <label htmlFor="term_title">약관 제목 :</label>
              </th>
              <td>
                <input
                  type="text"
                  id="term_title"
                  name="term_title"
                  onChange={changeValue}
                />
              </td>
            </tr>
            <tr>
              <th>
                <label htmlFor="term_content">약관 내용 :</label>
              </th>
              <td>
                <textarea
                  id="term_content"
                  name="term_content"
                  onChange={changeValue}
                />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="loanInsertActions">
                <button type="submit">등록</button>
                <button type="button" onClick={resetBtn}>
                  리셋
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </form>
    </div>
  );
};

export default LoanInsertForm;
