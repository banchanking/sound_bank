import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../Css/loan/LoanDetail.module.css";
import RefreshToken from "../../jwt/RefreshToken";

const LoanDetail = () => {
  const { loan_id } = useParams();
  const navigate = useNavigate();

  const [loan, setLoan] = useState({
    loan_id: 0,
    loan_name: "",
    loan_type: "",
    loan_min_amount: 0,
    loan_max_amount: 0,
    interest_rate: 0.0,
    prepayment_penalty: 0.0,
    loan_term: 0,
    loan_info: "",
  });

  useEffect(() => {
    RefreshToken.get("/loanDetail/" + loan_id).then((res) => {
      setLoan(res.data);
    });
  }, [loan_id]);

  const updateForm = () => {
    navigate("/loanUpdate/" + loan_id);
  };

  const termsUpdateForm = () => {
    // 구현 예정
  };

  const deleteForm = () => {
    RefreshToken.delete("/api/loanDelete/" + loan_id)
      .then(() => {
        alert("삭제 되었습니다.");
        navigate("/loanList");
      })
      .catch((err) => {
        alert(err);
      });
  };

  return (
    <div className={styles.loanDetailContainer}>
      <table className={styles.loanDetailTable}>
        <thead>
          <tr>
            <th colSpan={2}>
              <h2>대출 상품 상세</h2>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>대출 상품명</th>
            <td>
              <input type="text" value={loan.loan_name} readOnly />
            </td>
          </tr>
          <tr>
            <th>대출 유형</th>
            <td>
              <input type="text" value={loan.loan_type} readOnly />
            </td>
          </tr>
          <tr>
            <th>최소 대출금액</th>
            <td>
              <input type="text" value={loan.loan_min_amount} readOnly />
            </td>
          </tr>
          <tr>
            <th>최대 대출금액</th>
            <td>
              <input type="text" value={loan.loan_max_amount} readOnly />
            </td>
          </tr>
          <tr>
            <th>대출 금리</th>
            <td>
              <input type="text" value={loan.interest_rate} readOnly />
            </td>
          </tr>
          <tr>
            <th>중도상환 수수료(율)</th>
            <td>
              <input type="text" value={loan.prepayment_penalty} readOnly />
            </td>
          </tr>
          <tr>
            <th>대출기간</th>
            <td>
              <input type="text" value={loan.loan_term} readOnly />
            </td>
          </tr>
          <tr>
            <th>대출 정보</th>
            <td>
              <textarea value={loan.loan_info} readOnly />
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} className={styles.buttonGroup}>
              <button onClick={updateForm}>정보수정</button>
              <button onClick={termsUpdateForm}>약관수정</button>
              <button onClick={deleteForm}>삭제하기</button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default LoanDetail;
