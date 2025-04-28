import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../Css/loan/LoanInfoApply.css";
import { koKR } from "rsuite/esm/locales";

const LoanInfoApply = () => {
  const { loan_id } = useParams();
  const [loading, setLoading] = useState(true);

  const [loan, setLoan] = useState({});

  const formatNumber = (value) => {
    const numericValue = value.replace(/,/g, "");
    if (!isNaN(numericValue) && numericValue !== "") {
      return parseInt(numericValue);
    }
    return 0;
  };

  const [loanStatus, setLoanStatus] = useState({
    loan_name: "",
    loan_id: 0,
    interest_rate: 0.0,
    // customer_id: "", 존맛탱 작업후 추가
    customer_income: 0,
    // customer_credit_score: 0, 존맛탱 작업후 추가
    loan_amount: 0,
    balance: 0,
    repayment_accont: 0,
    repayment_method: "",
    repayment_date: "",
    loan_type: "",
    loan_progress: "",
  });

  const changeValue = (e) => {
    setLoanStatus({ ...loanStatus, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    fetch("http://15.165.57.30:8081/api/loanDetail/" + loan_id)
      .then((res) => res.json())
      .then((res) => {
        setLoan(res);
        setLoading(false);
      });
  }, [loan_id]);

  // 렌더링시 loan
  useEffect(() => {
    if (loan) {
      setLoanStatus({
        ...loanStatus,
        loan_name: loan.loan_name,
        loan_id: loan.loan_id,
        loan_type: loan.loan_type,
        interest_rate: loan.interest_rate,
        //customer_id:customer.customer_id, 존맛탱 작업후 추가
        //customer_credit_score:customer_creidit_score, 존맛탱 작업후 추가
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loan]);

  if (loading) {
    return <div>로딩 중...</div>; // 로딩 중 표시
  }

  const loanAmountChange = (e) => {
    setLoanStatus({
      ...loanStatus,
      loan_amount: formatNumber(e.target.value),
      balance: formatNumber(e.target.value),
    });
  };

  const customerIncomeChange = (e) => {
    setLoanStatus({
      ...loanStatus,
      customer_income: formatNumber(e.target.value),
    });
  };
  console.log(loanStatus);
  return (
    <div>
      <div className="tableTotalArea">
        <table>
          <thead>
            <th colSpan={2}>대출 신청 정보 작성</th>
          </thead>
          <tbody>
            <tr>
              <th>신청자 ID</th>
              <td>
                <input type="text" value={"daeyoul222"} readOnly />
              </td>
            </tr>
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
              <th>적용금리</th>
              <td>
                <input type="text" value={loan.interest_rate + "%"} readOnly />
              </td>
            </tr>
            <tr>
              <th>신청가능금액</th>
              <td>
                <input
                  type="text"
                  value={`${
                    loan.loan_min_amount >= 10000
                      ? `${(
                          loan.loan_min_amount / 10000
                        ).toLocaleString()} 억원`
                      : `${loan.loan_min_amount.toLocaleString()} 만원`
                  } ~ ${
                    loan.loan_max_amount >= 10000
                      ? `${(
                          loan.loan_max_amount / 10000
                        ).toLocaleString()} 억원`
                      : `${loan.loan_max_amount.toLocaleString()} 만원`
                  }`}
                  readOnly
                />
              </td>
            </tr>
            <tr>
              <th>신청금액</th>
              <td>
                <input
                  type="text"
                  placeholder="만원"
                  name="loan_amount"
                  onChange={loanAmountChange}
                  value={loanStatus.loan_amount.toLocaleString("ko-KR")}
                />
              </td>
            </tr>
            <tr>
              <th>상환일자</th>
              <td>
                <select onChange={changeValue} name="repayment_date">
                  <option value="">상환일 선택</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(
                    (repayment_date) => (
                      <option
                        key={repayment_date}
                        value={repayment_date + "일"}
                      >
                        {repayment_date}일
                      </option>
                    )
                  )}
                </select>
              </td>
            </tr>
            <tr>
              <th>상환 방법</th>
              <td>
                <select onChange={changeValue} name="repayment_method">
                  <option value={""}>상환방법을 선택해주세요.</option>
                  <option>원리금 균등상환</option>
                  <option>원금 균등상환</option>
                  <option>만기 일시상환</option>
                </select>
              </td>
            </tr>
            <tr>
              <th>연소득</th>
              <td>
                <input
                  type="text"
                  placeholder="만원"
                  name="customer_income"
                  value={loanStatus.customer_income.toLocaleString(koKR)}
                  onChange={customerIncomeChange}
                />
              </td>
            </tr>
            <tr>
              <th>상환 계좌번호</th>
              <td>account_tbl에서 불러옴.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoanInfoApply;
