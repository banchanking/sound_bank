import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import { useNavigate, useParams } from "react-router-dom";

const LoanInfoApply = () => {
  const { loan_id } = useParams();
  const navigate = useNavigate();
  const [loan_info, set_loan_info] = useState({
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
    accountNumbers: [],
    loan_term: 0,
    remaining_term: 0,
  });

  const change_value = (e) => {
    set_loan_info({
      ...loan_info,
      [e.target.name]: e.target.value,
    });
  };

  const loan_apply = () => {
    if (!loan_info.loan_amount) {
      alert("신청금액을 작성해주세요");
      return;
    }
    const loan_amount = loan_info.loan_amount / 10000;
    if (loan_amount < loan_info.loan_min_amount) {
      alert("신청금액이 최소대출한도보다 작습니다.");
      return;
    } else if (loan_amount > loan_info.loan_max_amount) {
      alert("신청금액이 최대대출한도보다 많습니다.");
      return;
    } else if (!loan_info.customer_credit_score) {
      alert("신용점수를 선택해주세요.");
      return;
    } else if (!loan_info.account_number) {
      alert("상환계좌를 선택해주세요.");
      return;
    } else if (!loan_info.repayment_method) {
      alert("상환방법을 선택해주세요.");
      return;
    } else if (!loan_info.repayment_date) {
      alert("상환날짜를 선택해주세요.");
      return;
    }

    loan_info.remaining_term = loan_info.loan_term * 12;
    loan_info.loan_term = loan_info.loan_term * 12;

    if (window.confirm("작성된 정보로 대출신청을 하시겠습니까?")) {
      RefreshToken.post("/loanApply", loan_info).then((res) => {
        if (res.status === 201) {
          alert("대출신청이 정상적으로 완료되었습니다.");
          navigate("/loanApply");
        }
      });
    } else {
      alert("신청정보를 다시 확인해주세요.");
    }
  };

  const back_to_list = () => {
    if (window.confirm("상품목록화면으로 가시겠습니까?")) {
      navigate("/loanApply");
    } else {
      alert("작성 중인 대출 신청 정보는 그대로 유지됩니다.");
    }
  };

  useEffect(() => {
    const customer_id = localStorage.getItem("customerId");
    RefreshToken.get("/loanCustomer", {
      params: { customerId: customer_id, loan_id: loan_id },
    })
      .then((response) => {
        let data = response.data;
        if (data.accountNumbers && typeof data.accountNumbers === "string") {
          data.accountNumbers = data.accountNumbers
            .split(",")
            .map((s) => s.trim());
        }

        set_loan_info(data);
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
                  value={loan_info.customer_id}
                  readOnly
                  style={{ textAlign: "right" }}
                />
              </td>
            </tr>
            <tr>
              <th>대출 상품명</th>
              <td>
                <input
                  type="text"
                  value={loan_info.loan_name}
                  readOnly
                  style={{ textAlign: "right" }}
                />
              </td>
            </tr>
            <tr>
              <th>대출 유형</th>
              <td>
                <input
                  type="text"
                  value={loan_info.loan_type}
                  readOnly
                  style={{ textAlign: "right" }}
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
                    ((loan_info.loan_min_amount ?? 0) >= 10000
                      ? `${(
                          loan_info.loan_min_amount / 10000
                        ).toLocaleString()} 억원`
                      : `${(
                          loan_info.loan_min_amount ?? 0
                        ).toLocaleString()} 만원`) +
                    " ~ " +
                    ((loan_info.loan_max_amount ?? 0) >= 10000
                      ? `${(
                          loan_info.loan_max_amount / 10000
                        ).toLocaleString()} 억원`
                      : `${(
                          loan_info.loan_max_amount ?? 0
                        ).toLocaleString()} 만원`)
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
                  onChange={change_value}
                  style={{ textAlign: "right" }}
                >
                  {Array.from(
                    { length: loan_info.loan_term },
                    (_, i) => i + 1
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
                <input
                  type="text"
                  name="loan_amount"
                  value={(loan_info.loan_amount ?? 0).toLocaleString("ko-KR")}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/,/g, "");
                    const num = parseInt(rawValue, 10);
                    set_loan_info({
                      ...loan_info,
                      loan_amount: isNaN(num) ? 0 : num,
                    });
                  }}
                  style={{ textAlign: "right" }}
                />
              </td>
            </tr>
            <tr>
              <th>적용 금리</th>
              <td>
                <input
                  type="text"
                  value={`${loan_info.interest_rate}%`}
                  readOnly
                  style={{ textAlign: "right" }}
                />
              </td>
            </tr>
            <tr>
              <th>연소득</th>
              <td>
                <input
                  type="text"
                  name="customer_income"
                  value={(loan_info.customer_income ?? 0).toLocaleString(
                    "ko-KR"
                  )}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/,/g, "");
                    const num = parseInt(rawValue, 10);
                    set_loan_info({
                      ...loan_info,
                      customer_income: isNaN(num) ? 0 : num,
                    });
                  }}
                  style={{ textAlign: "right" }}
                />
              </td>
            </tr>
            <tr>
              <th>신용점수</th>
              <td>
                <select
                  name="customer_credit_score"
                  onChange={change_value}
                  style={{ textAlign: "right" }}
                >
                  <option value="">신용점수를 선택해주세요</option>
                  <option value="700점 이상">700점 이상</option>
                  <option value="700점 미만">700점 미만</option>
                </select>
              </td>
            </tr>
            <tr>
              <th>상환 계좌번호</th>
              <td>
                <select
                  name="account_number"
                  onChange={change_value}
                  style={{ textAlign: "right" }}
                >
                  <option value="">계좌를 선택해주세요</option>
                  {Array.isArray(loan_info.accountNumbers) &&
                    loan_info.accountNumbers.map((acc, idx) => (
                      <option key={idx} value={acc}>
                        {acc}
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
                  onChange={change_value}
                  style={{ textAlign: "right" }}
                >
                  <option value="">상환방식을 선택해주세요</option>
                  <option value="원리금균등">원리금균등상환</option>
                  <option value="원금균등">원금균등상환</option>
                  <option value="만기일시">만기일시상환</option>
                </select>
              </td>
            </tr>
            <tr>
              <th>상환 날짜</th>
              <td>
                <select
                  name="repayment_date"
                  onChange={change_value}
                  style={{ textAlign: "right" }}
                >
                  <option value="">상환날짜를 선택해주세요</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}일
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>
                <button onClick={loan_apply}>대출신청</button>
                <button onClick={back_to_list}>돌아가기</button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default LoanInfoApply;
