import React, { useEffect, useState } from "react";
import RefreshToken from "../jwt/RefreshToken";
import "../Css/customer/MyInfo.css";

const MyInfoEdit = ({ onCancel }) => {
  const [form, setForm] = useState({
    customerId: "",
    customerPassword: "",
    customerName: "",
    customer_email: "",
    customerPhoneNumber: "",
    customer_resident_number: "",
    customer_address: "",
    customer_account_number: "",
    customer_job: "",
    customer_risk_type: "",
  });

  const [isVerified, setIsVerified] = useState(false);
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const handleRequestVerification = () => {
    if (isVerified) return; // 이미 인증된 경우, 다시 요청 막기

    const customerId = localStorage.getItem("customerId");
    const customer_phone_number = form.customerPhoneNumber.replace(/-/g, "");
    RefreshToken.post("/sms/signup/request", {
      customerId,
      customer_phone_number,
    });
    alert("인증 요청이 전송되었습니다.");
    setShowVerificationInput(true);
  };

  // 인증번호 확인
  const verifyCode = () => {
    const customer_phone_number = form.customerPhoneNumber.replace(/-/g, "");
    RefreshToken.post("/sms/signup/verify", {
      customerId: localStorage.getItem("customerId"),
      customer_phone_number,
      code: verificationCode,
    })
      .then((res) => {
        if (res.data === true) {
          alert("✅ 인증이 완료되었습니다.");
          setIsVerified(true); // ⭐ 인증 완료 처리
          setShowVerificationInput(false); // ⭐ 인증번호 입력칸 숨기기
        } else {
          alert("❌ 인증번호가 올바르지 않습니다.");
        }
      })
      .catch((error) => {
        console.error("인증번호 확인 에러:", error);
        alert("❌ 인증번호 확인 중 오류가 발생했습니다.");
      });
  };

  useEffect(() => {
    const customerId = localStorage.getItem("customerId");
    RefreshToken.get("/myInfoList", {
      params: { customerId },
    })
      .then((res) => {
        setForm(res.data);
      })
      .catch((error) => {
        console.error("회원 정보 로딩 실패:", error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!isVerified) {
      alert("📢 회원정보를 수정하려면 문자 인증을 완료해야 합니다!");
      return; // 인증 안됐으면 저장 아예 막기
    }

    const addressToSave =
      fullAddress.trim() === "" ? form.customer_address : fullAddress;

    const updatedForm = {
      ...form,
      customer_address: addressToSave,
    };
    RefreshToken.post("/updateMyInfo", updatedForm)
      .then(() => {
        alert("회원 정보가 수정되었습니다.");
        onCancel(); // 수정 완료 후 다시 조회 화면으로
      })
      .catch((err) => {
        console.error("정보 수정 실패:", err);
        alert("정보 수정에 실패했습니다.");
      });
  };

  const fullAddress = `${form.sample6_address || ""} ${
    form.sample6_extraAddress || ""
  } ${form.sample6_detailAddress || ""}`.trim();

  const execDaumPostcode = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        let extraAddr = "";
        if (data.userSelectedType === "R") {
          if (data.bname) extraAddr += data.bname;
          if (data.buildingName)
            extraAddr += extraAddr
              ? ", " + data.buildingName
              : data.buildingName;
        }
        setForm((prev) => ({
          ...prev,
          sample6_postcode: data.zonecode,
          sample6_address: data.roadAddress,
          sample6_extraAddress: extraAddr,
        }));
      },
    }).open();
  };

  return (
    <div className="myinfo-container">
      <h2 className="myinfo-title">회원 정보 수정</h2>
      <table className="myinfo-table">
        <tbody>
          <tr>
            <th>아이디</th>
            <td>
              <input type="text" value={form.customerId} disabled />
            </td>
          </tr>
          <tr>
            <th>비밀번호</th>
            <td>
              <input
                type="password"
                name="customerPassword"
                value={form.customerPassword}
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <th>이름</th>
            <td>
              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <th>이메일</th>
            <td>
              <input
                type="text"
                name="customer_email"
                value={form.customer_email}
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <th>전화번호</th>
            <td>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  name="customerPhoneNumber"
                  value={form.customerPhoneNumber}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                  disabled={isVerified}
                />
                <button
                  type="button"
                  className="myinfo-button"
                  onClick={handleRequestVerification}
                  disabled={isVerified}
                >
                  {isVerified ? "✅ 인증완료" : "문자 인증"}
                </button>
              </div>
              {showVerificationInput && (
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                >
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="인증번호 입력"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="myinfo-button"
                    onClick={() => verifyCode()}
                  >
                    인증하기
                  </button>
                </div>
              )}
            </td>
          </tr>

          <tr>
            <th>주민등록번호</th>
            <td>
              <input
                type="text"
                name="customer_resident_number"
                value={form.customer_resident_number}
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <th>주소</th>
            <td>
              <div className="address-group">
                <div className="address-zipcode-row">
                  <input
                    type="text"
                    name="sample6_postcode"
                    value={form.sample6_postcode || ""}
                    readOnly
                  />
                  <button type="button" onClick={execDaumPostcode}>
                    우편번호 찾기
                  </button>
                </div>

                <input
                  type="text"
                  name="sample6_address"
                  value={form.sample6_address || ""}
                  readOnly
                />

                <input
                  type="text"
                  name="sample6_extraAddress"
                  value={form.sample6_extraAddress || ""}
                  readOnly
                />

                <input
                  type="text"
                  name="sample6_detailAddress"
                  value={form.sample6_detailAddress || ""}
                  onChange={handleChange}
                  required
                  placeholder="상세주소 입력"
                />
              </div>
            </td>
          </tr>
          <tr>
            <th>대표계좌번호</th>
            <td>
              <input
                type="text"
                name="customer_account_number"
                value={form.customer_account_number}
                disabled
              />
            </td>
          </tr>
          <tr>
            <th>직업</th>
            <td>
              <input
                type="text"
                name="customer_job"
                value={form.customer_job}
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <th>투자성향</th>
            <td>
              <select
                name="customer_risk_type"
                value={form.customer_risk_type}
                onChange={handleChange}
              >
                <option value="">선택</option>
                <option value="안정형">안정형</option>
                <option value="중립형">중립형</option>
                <option value="공격형">공격형</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="myinfo-button-container">
        <button className="myinfo-button" onClick={handleSubmit}>
          저장
        </button>
        <button
          className="myinfo-button"
          onClick={onCancel}
          style={{ marginLeft: "10px" }}
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default MyInfoEdit;
