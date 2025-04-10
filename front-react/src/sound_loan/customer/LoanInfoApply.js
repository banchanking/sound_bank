import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import { useNavigate, useParams } from "react-router-dom";

const LoanInfoApply = () => {
  const { loan_id } = useParams();
  const  navigate  = useNavigate();
  const [loanInfo, setLoanInfo] = useState({
    customer_id: "",
    loan_name: "",
    loan_id: 0,
    interest_rate: 0.0,
    customer_income: 0,
    customer_credit_score: "",
    account_number: "",
    loan_amount: 0,
    balance: 0,
    repayment_method: "",
    repayment_date: "",
    loan_type: "",
    loan_min_amount: 0,
    loan_max_amount: 0,
    account_numbers: [],
    loan_term: 0,
  });

  const changeValue = (e) => {
    setLoanInfo({
      ...loanInfo,
      [e.target.name]: e.target.value,
    });
  };

  const loanApply = () => {
    console.log(loanInfo);
    if (!loanInfo.loan_amount) {
      alert("신청금액을 작성해주세요");
      return;
    }
    const loanAmount = loanInfo.loan_amount / 10000;
    if (loanAmount < loanInfo.loan_min_amount) {
      alert("신청금액이 최소대출한도보다 작습니다.");
      return;
    } else if (loanAmount > loanInfo.loan_max_amount) {
      alert("신청금액이 최대대출한도보다 많습니다.");
      return;
    } else if (!loanInfo.customer_credit_score) {
      alert("신용점수를 선택해주세요.");
      return;
    } else if (!loanInfo.account_number) {
      alert("상환계좌를 선택해주세요.");
      return;
    } else if (!loanInfo.repayment_method) {
      alert("상환방법을 선택해주세요.");
      return;
    } else if (!loanInfo.repayment_date) {
      alert("상환날짜를 선택해주세요.");
      return;
    }
    if (window.confirm("작성된 정보로 대출신청을 하시겠습니까?")) {
      RefreshToken.post("/loanApply", loanInfo).then((res) => {
        if (res.status === 201) {
          alert("대출신청이 정상적으로 완료되었습니다.");
          navigate("/loanApply");
        }
      });
    } else {
      alert("신청정보를 다시 확인해주세요.");
    }
  };

  const backToList = () => {
    if (window.confirm("상품목록화면으로 가시겠습니까?")) {
      navigate("/loanApply");
    } else {
      alert("작성 중인 대출 신청 정보는 그대로 유지됩니다.");
    }
  };

  useEffect(() => {
    const customerId = localStorage.getItem("customerId");
    RefreshToken.get("/loanCustomer", {
      params: { customerId: customerId, loan_id: loan_id },
    })
      .then((response) => {
        let data = response.data;

        if (data.accountNumbers && typeof data.accountNumbers === "string") {
          data.account_numbers = data.accountNumbers
            .split(",")
            .map((s) => s.trim());
        } else {
          data.account_numbers = [];
        }
        setLoanInfo(data);
      })
      .catch((error) => {
        console.error("데이터 가져오기 오류:", error);
      });
  }, [loan_id]);

  return (
    <div>
      <div className="container">
        <table>
          <thead>
            <tr>
              <th colSpan={2} style={{ textAlign: "center", fontSize: "30px" }}>
                대출 신청정보 작성
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>신청 고객ID</th>
              <td>
                <input
                  type="text"
                  value={loanInfo.customer_id}
                  style={{ textAlign: "right" }}
                  readOnly
                />
              </td>
            </tr>
            <tr>
              <th>대출 상품명</th>
              <td>
                <input
                  type="text"
                  value={loanInfo.loan_name}
                  style={{ textAlign: "right" }}
                  readOnly
                />
              </td>
            </tr>
            <tr>
              <th>대출 유형</th>
              <td>
                <input
                  type="text"
                  value={loanInfo.loan_type}
                  style={{ textAlign: "right" }}
                  readOnly
                />
              </td>
            </tr>
            <tr>
              <th>대출한도</th>
              <td>
                <input
                  type="text"
                  readOnly
                  value={
                    (loanInfo.loan_min_amount >= 10000
                      ? `${(loanInfo.loan_min_amount / 10000).toLocaleString(
                          "ko-KR"
                        )} 억원`
                      : `${loanInfo.loan_min_amount.toLocaleString(
                          "ko-KR"
                        )} 만원`) +
                    " ~ " +
                    (loanInfo.loan_max_amount >= 10000
                      ? `${(loanInfo.loan_max_amount / 10000).toLocaleString(
                          "ko-KR"
                        )} 억원`
                      : `${loanInfo.loan_max_amount.toLocaleString(
                          "ko-KR"
                        )} 만원`)
                  }
                  style={{ textAlign: "right" }}
                />
              </td>
            </tr>
            <tr>
              <th>상환 기간</th>
              <td>
                <select
                  name="loan_term"
                  style={{ textAlign: "right" }}
                  onChange={changeValue}
                >
                  {loanInfo.loan_term > 0 &&
                    Array.from(
                      { length: loanInfo.loan_term },
                      (_, i) => loanInfo.loan_term - i
                    ).map((term) => (
                      <option key={term} value={term}>
                        {term}년
                      </option>
                    ))}
                </select>
              </td>
            </tr>
            <tr>
              <th>신청금액</th>
              <td>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="text"
                    name="loan_amount"
                    value={(loanInfo.loan_amount ?? 0).toLocaleString("ko-KR")}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, "");
                      const num = parseInt(rawValue, 10);
                      setLoanInfo((prevStatus) => ({
                        ...prevStatus,
                        loan_amount: isNaN(num) ? 0 : num,
                      }));
                    }}
                    style={{ textAlign: "right" }}
                  />

                  <span style={{ marginLeft: "5px", fontSize: "20px" }}>
                    원
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <th>적용 금리</th>
              <td>
                <input
                  type="text"
                  value={`${loanInfo.interest_rate}%`}
                  readOnly
                  style={{ textAlign: "right" }}
                />
              </td>
            </tr>
            <tr>
              <th>연소득</th>
              <td>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="text"
                    name="customer_income"
                    value={(loanInfo.customer_income ?? 0).toLocaleString(
                      "ko-KR"
                    )}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, "");
                      const num = parseInt(rawValue, 10);
                      setLoanInfo((prevStatus) => ({
                        ...prevStatus,
                        customer_income: isNaN(num) ? 0 : num,
                      }));
                    }}
                    style={{ textAlign: "right" }}
                  />
                  <span style={{ marginLeft: "5px", fontSize: "20px" }}>
                    원
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <th>신용점수</th>
              <td>
                <select
                  name="customer_credit_score"
                  style={{ textAlign: "right" }}
                  onChange={changeValue}
                >
                  <option value={null}>신용점수를 선택해주세요</option>
                  <option value={"700점 이상"}>700점 이상</option>
                  <option value={"700점 미만"}>700점 미만</option>
                </select>
              </td>
            </tr>
            <tr>
              <th>상환 계좌번호</th>
              <td>
                <select
                  name="account_number"
                  style={{ textAlign: "right" }}
                  onChange={changeValue}
                >
                  <option value={null}>계좌를 선택해주세요.</option>
                  {Array.isArray(loanInfo.account_numbers) &&
                    loanInfo.account_numbers.map((acn, index) => (
                      <option key={index} value={acn}>
                        {acn}
                      </option>
                    ))}
                </select>
              </td>
            </tr>
            <tr>
              <th>대출금 상환방식</th>
              <td>
                <select
                  name="repayment_method"
                  style={{ textAlign: "right" }}
                  onChange={changeValue}
                >
                  <option value={null}>상환방법을 선택해주세요.</option>
                  <option value={"원리금균등"}>원리금균등상환</option>
                  <option value={"원금균등"}>원금균등상환</option>
                  <option value={"만기일시"}>만기일시상환</option>
                </select>
              </td>
            </tr>
            <tr>
              <th>상환 날짜</th>
              <td>
                <select
                  name="repayment_date"
                  style={{ textAlign: "right" }}
                  onChange={changeValue}
                >
                  <option value={null}>상환날짜를 선택해주세요.</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}일
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>
                <input type="button" value={"대출신청"} onClick={loanApply} />
                <input type="button" value={"돌아가기"} onClick={backToList} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default LoanInfoApply;
