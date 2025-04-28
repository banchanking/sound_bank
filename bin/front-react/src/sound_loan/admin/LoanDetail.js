import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../Css/loan/Loan.css";

const LoanDetail = (props) => {
  const { loan_id } = useParams();
  const navigate = useNavigate();

  const [loan, setLoan] = useState([
    {
      loan_id: 0,
      loan_name: "",
      loan_amount: 0,
      interest_rate: 0.0,
      loan_term: 0,
      loan_info: "",
    },
  ]);

  useEffect(() => {
    fetch("http://15.165.57.30:8081/api/loanDetail/" + loan_id)
      .then((res) => res.json())
      .then((res) => {
        setLoan(res);
      });
  }, [loan_id]);

  const updateForm = () => {
    navigate("/loanUpdate/" + loan_id);
  };

  const deleteForm = () => {
    fetch("http://15.165.57.30:8081/api/loanDelete/" + loan_id, {
      method: "DELETE",
    })
      .then((res) => res.text())
      .then((res) => {
        if (res === "ok") {
          alert("삭제 되었습니다.");
          navigate("/loanList");
        } else {
          alert("삭제 실패");
          navigate("/loanList");
        }
      });
  };

  return (
    <div className="loanInsert">
      <table className="insertTable">
        <thead>
          <tr>
            <th colSpan={2}>
              <h2>대출 상품 상세</h2>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <th>
              <label htmlFor="loan_name">대출 상품명 :</label>
            </th>
            <td>
              <input type="text" value={loan.loan_name} readOnly />
            </td>
          </tr>
          <tr>
            <th>
              <label htmlFor="loan_type">대출 유형 :</label>
            </th>
            <td>
              <input value={loan.loan_type} readOnly />
            </td>
          </tr>
          <tr>
            <th>
              {" "}
              <label htmlFor="loan_min_amount">최소 대출금액 :</label>
            </th>
            <td>
              <input value={loan.loan_min_amount} readOnly />
            </td>
          </tr>
          <tr>
            <th>
              <label htmlFor="loan_max_amount">최대 대출금액 :</label>
            </th>
            <td>
              <input type="number" value={loan.loan_max_amount} readOnly />
            </td>
          </tr>
          <tr>
            <th>
              <label htmlFor="interest_rate">대출 금리 :</label>
            </th>
            <td>
              <input type="text" value={loan.interest_rate} readOnly />
            </td>
          </tr>
          <tr>
            <th>
              <label htmlFor="loan_term">대출기간 :</label>
            </th>
            <td>
              <input type="text" value={loan.loan_term} readOnly />
            </td>
          </tr>
          <tr>
            <th>
              {" "}
              <label htmlFor="loan_info">대출 정보 :</label>
            </th>
            <td>
              {" "}
              <textarea type="textarea" value={loan.loan_info} readOnly />
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} align="center">
              <button onClick={updateForm}>수정하기</button>
              <button onClick={deleteForm}>삭제하기</button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default LoanDetail;
