import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../Css/loan/LoanDetail.module.css";
import RefreshToken from "../../jwt/RefreshToken";

const LoanDetail = ({ loan_id }) => {
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
    if (loan_id) {
      RefreshToken.get("/loanDetail/" + loan_id)
        .then((res) => {
          setLoan(res.data);
        })
        .catch((error) => {
          console.error("LoanDetail 불러오기 오류:", error);
        });
    }
  }, [loan_id]);

  const updateForm = () => {
    navigate("/adminPage", { state: { component: "LoanUpdate" } });
  };

  const deleteForm = () => {
    RefreshToken.delete("/loanDelete/" + loan_id)
      .then(() => {
        alert("삭제 되었습니다.");
        navigate("/adminPage", { state: { component: "LoanList" } });
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
              <input
                type="text"
                value={loan.loan_min_amount + "만원"}
                readOnly
              />
            </td>
          </tr>
          <tr>
            <th>최대 대출금액</th>
            <td>
              <input
                type="text"
                value={loan.loan_max_amount + "만원"}
                readOnly
              />
            </td>
          </tr>
          <tr>
            <th>대출 금리</th>
            <td>
              <input type="text" value={loan.interest_rate + "%"} readOnly />
            </td>
          </tr>
          <tr>
            <th>중도상환 수수료(율)</th>
            <td>
              <input
                type="text"
                value={loan.prepayment_penalty + "%"}
                readOnly
              />
            </td>
          </tr>
          <tr>
            <th>대출기간</th>
            <td>
              <input type="text" value={loan.loan_term + "년"} readOnly />
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
            <td colSpan={2} className={styles.detailButtons}>
              <button onClick={updateForm}>정보수정</button>
              <button onClick={deleteForm}>삭제하기</button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default LoanDetail;
