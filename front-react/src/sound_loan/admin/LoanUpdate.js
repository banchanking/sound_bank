import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../Css/loan/LoanUpdate.module.css";
import RefreshToken from "../../jwt/RefreshToken";

const LoanUpdate = () => {
  const formRef = useRef();
  const navigate = useNavigate();
  const { loan_id } = useParams();
  const [loan, setLoan] = useState({
    loan_id: 0,
    loan_name: "",
    loan_min_amount: 0,
    loan_max_amount: 0,
    interest_rate: 0.0,
    loan_term: 0,
    loan_info: "",
    loan_type: "",
    prepayment_penalty: 0.0,
  });

  const changeValue = (e) => {
    setLoan({
      ...loan,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    RefreshToken.get("/loanDetail/" + loan_id).then((res) => {
      setLoan(res.data);
    });
  }, [loan_id]);

  const updateSubmit = (e) => {
    e.preventDefault();
    const minAmount = parseInt(loan.loan_min_amount, 10);
    const maxAmount = parseInt(loan.loan_max_amount, 10);
    if (!loan.loan_name) {
      alert("대출상품명을 입력하세요.");
      return;
    } else if (!loan.loan_type) {
      alert("대출 유형을 선택하세요.");
      return;
    } else if (!loan.loan_min_amount) {
      alert("최소 대출금액을 입력하세요.");
      return;
    } else if (!loan.loan_max_amount) {
      alert("최대 대출금액을 입력하세요.");
      return;
    } else if (minAmount >= maxAmount) {
      alert("최소 대출금액은 최대 대출금액보다 작아야 합니다.");
      return;
    } else if (!loan.interest_rate) {
      alert("금리를 입력하세요.");
      return;
    } else if (!loan.loan_term) {
      alert("대출 기간을 입력하세요.");
      return;
    } else if (!loan.loan_info) {
      alert("대출 정보를 입력하세요.");
      return;
    }
    RefreshToken.put("/loanUpdate/" + loan_id, loan)
      .then(() => {
        alert("수정되었습니다.");
        navigate("/loanList");
      })
      .catch((error) => {
        console.log("실패", error);
      });
  };

  const resetBtn = () => {
    formRef.current.reset();
  };

  return (
    <div className={styles.loanInsert}>
      <form onSubmit={updateSubmit} ref={formRef}>
        <table className={styles.insertTable}>
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
                  value={loan.loan_name}
                  onChange={changeValue}
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
                  value={loan.loan_type}
                  onChange={changeValue}
                >
                  <option value={null}>유형을 선택하세요</option>
                  <option value="신용 대출">신용 대출</option>
                  <option value="담보 대출">담보 대출</option>
                  <option value="전세 대출">전세 대출</option>
                  <option value="자동차 대출">자동차 대출</option>
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
                  value={loan.loan_min_amount}
                  onChange={changeValue}
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
                  value={loan.loan_max_amount}
                  onChange={changeValue}
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
                  value={loan.interest_rate}
                  onChange={changeValue}
                />
              </td>
            </tr>
            <tr>
              <th>
                <label htmlFor="prepayment_penalty">
                  중도상환 수수료(율) :
                </label>
              </th>
              <td>
                <input
                  type="text"
                  id="prepayment_penalty"
                  name="prepayment_penalty"
                  value={loan.prepayment_penalty}
                  onChange={changeValue}
                />
              </td>
            </tr>
            <tr>
              <th>
                <label htmlFor="loan_term">대출 기간 :</label>
              </th>
              <td>
                <input
                  type="text"
                  id="loan_term"
                  name="loan_term"
                  value={loan.loan_term}
                  onChange={changeValue}
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
                  value={loan.loan_info}
                  onChange={changeValue}
                />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} align="center">
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

export default LoanUpdate;
