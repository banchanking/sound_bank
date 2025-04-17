import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../Css/customer/Join.module.css';
import SignupSMSModal from "../smsmodal/SignupSMSModal";

const Join = () => {
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    customer_id: '',
    customer_password: '',
    re_password: '',
    account_pwd: '',
    customer_name: '',
    customer_resident1: '',
    customer_resident2: '',
    sample6_postcode: '',
    sample6_address: '',
    sample6_extraAddress: '',
    sample6_detailAddress: '',
    customer_hp1: '',
    customer_hp2: '',
    customer_hp3: '',
    customer_email1: '',
    customer_email2: '',
    customer_email3: '0',
    customer_job: '',
    customer_birthday: '',
    customer_risk_type: '',
    hiddenUserid: '0'
  });

  const [pwdMsg, setPwdMsg] = useState('');
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  useEffect(() => {
    if (form.customer_password && form.re_password) {
      setPwdMsg(form.customer_password === form.re_password ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다');
    } else {
      setPwdMsg('');
    }
  }, [form.customer_password, form.re_password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'customer_email3') {
      setForm(prev => ({
        ...prev,
        customer_email2: value === '0' ? '' : value
      }));
    }
  };

  const handleReset = () => {
    setForm({
      customer_id: '',
      customer_password: '',
      re_password: '',
      account_pwd: '',
      customer_name: '',
      customer_resident1: '',
      customer_resident2: '',
      sample6_postcode: '',
      sample6_address: '',
      sample6_extraAddress: '',
      sample6_detailAddress: '',
      customer_hp1: '',
      customer_hp2: '',
      customer_hp3: '',
      customer_email1: '',
      customer_email2: '',
      customer_email3: '0',
      customer_job: '',
      customer_birthday: '',
      customer_risk_type: '',
      hiddenUserid: '0'
    });
    setIsPhoneVerified(false);
  };

  const confirmId = async () => {
    if (!form.customer_id.trim()) {
      alert('아이디를 입력하세요');
      return;
    }
    try {
      const res = await axios.get(`http://localhost:8081/api/idConfirmAction.do?customer_id=${form.customer_id}`);
      const { available, message } = res.data;
      alert(message);
      setForm(prev => ({ ...prev, hiddenUserid: available ? '1' : '0' }));
    } catch (error) {
      console.error('중복확인 오류:', error);
      alert('중복확인 중 오류가 발생했습니다.');
    }
  };

  const joinSubmit = async (e) => {
    e.preventDefault();

    if (form.hiddenUserid === '0') {
      alert('아이디 중복확인을 해주세요!');
      return;
    }

    if (!isPhoneVerified) {
      alert('휴대폰 인증을 완료해주세요!');
      return;
    }

    const fullAddress = `${form.sample6_address} ${form.sample6_extraAddress} ${form.sample6_detailAddress}`.trim();
    const requestData = {
      customer_id: form.customer_id,
      customer_password: form.customer_password,
      account_pwd: form.account_pwd,
      customer_name: form.customer_name,
      customer_resident_number: `${form.customer_resident1}-${form.customer_resident2}`,
      customer_address: fullAddress,
      customer_phone_number: `${form.customer_hp1}-${form.customer_hp2}-${form.customer_hp3}`,
      customer_email: `${form.customer_email1}@${form.customer_email2}`,
      customer_job: form.customer_job,
      customer_birthday: form.customer_birthday,
      customer_risk_type: form.customer_risk_type
    };

    try {
      const res = await axios.post('http://localhost:8081/api/joinAction.do', requestData);
      alert(res.data);
      window.location.href = '/';
    } catch (error) {
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  const handleSendSMS = async () => {
    const phoneNumber = `${form.customer_hp1}${form.customer_hp2}${form.customer_hp3}`;
    try {
      const res = await axios.post('http://localhost:8081/api/sms/signup/request', {
        customer_phone_number: phoneNumber
      });
  
      if (res.status === 200) {
        setIsSMSModalOpen(true);
      } else {
        alert('인증번호 전송 실패 (서버 응답 이상)');
      }
    } catch (err) {
      console.error("인증번호 요청 실패:", err);
      alert('서버 오류: 인증번호 요청에 실패했습니다.');
    }
  };
  const handleSMSVerified = () => {
    setIsPhoneVerified(true);
    setIsSMSModalOpen(false);
    alert("휴대폰 인증이 완료되었습니다.");
  };

  const execDaumPostcode = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        let extraAddr = '';
        if (data.userSelectedType === 'R') {
          if (data.bname) extraAddr += data.bname;
          if (data.buildingName) extraAddr += (extraAddr ? ', ' + data.buildingName : data.buildingName);
        }
        setForm(prev => ({
          ...prev,
          sample6_postcode: data.zonecode,
          sample6_address: data.roadAddress,
          sample6_extraAddress: extraAddr
        }));
      }
    }).open();
  };

  return (
    <div className={styles.wrap}>
      {/* 안내 모달 */}
      {step === 0 && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>계좌 개설 안내</h3>
            <p>입출금 계좌 자동으로 생성되며,<br />
              개설후 계좌조회에서 계좌번호 확인 가능합니다.</p>
            <p style={{ margin: '30px 0' }}>
              ※입출금계좌 일일 이체한도는 <b>1억원</b> 입니다.
            </p>
            <h4>계좌 비밀번호는 직접 설정해야 합니다.</h4>
            <button onClick={() => setStep(1)}>다음</button>
          </div>
        </div>
      )}

      {/* 계좌 비밀번호 설정 */}
      {step === 1 && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>계좌 비밀번호 설정</h3>
            <p className={styles.desc}>안전한 거래를 위해 <br />숫자 4자리 비밀번호를 설정해주세요.</p>
            <input
              type="password"
              name="account_pwd"
              maxLength="4"
              placeholder="숫자 4자리"
              value={form.account_pwd}
              onChange={handleChange}
            />
            {form.account_pwd && !/^\d{4}$/.test(form.account_pwd) && (
              <p className={styles.warn}>* 숫자만 4자리 입력 가능합니다.</p>
            )}
            <p className={styles.info}>※ 타인에게 노출되지 않도록 주의해주세요.</p>
            <button onClick={() => setStep(2)} disabled={!/^\d{4}$/.test(form.account_pwd)}>다음</button>
          </div>
        </div>
      )}

      {/* 가입 폼 */}
      {step === 2 && (
        <div className={styles.container}>
          <h1>계좌개설</h1>
          <form onSubmit={joinSubmit}>
            <div>
              <label>아이디</label>
              <div className={styles.rowGroup1}>
                <input type="text" name="customer_id" value={form.customer_id} onChange={handleChange} required />
                <button type="button" onClick={confirmId}>중복확인</button>
              </div>
            </div>
            <div>
              <label>비밀번호</label>
              <input type="password" name="customer_password" value={form.customer_password} onChange={handleChange} required />
            </div>
            <div>
              <label>비밀번호 확인</label>
              <input type="password" name="re_password" value={form.re_password} onChange={handleChange} required />
              <span style={{ color: form.customer_password === form.re_password ? 'blue' : 'red' }}>{pwdMsg}</span>
            </div>
            <div>
              <label>이름</label>
              <input type="text" name="customer_name" value={form.customer_name} onChange={handleChange} required />
            </div>
            <div>
              <label>주민번호</label>
              <div className={styles.rowGroup1}>
                <input type="text" name="customer_resident1" className={styles.shortInput} value={form.customer_resident1} onChange={handleChange} />
                -
                <input type="text" name="customer_resident2" className={styles.shortInput} value={form.customer_resident2} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label>주소</label>
              <div className={styles.addressGroup}>
                <input type="text" name="sample6_postcode" className={styles.postcode} value={form.sample6_postcode} readOnly />
                <button type="button" className={styles.searchBtn} onClick={execDaumPostcode}>우편번호 찾기</button>
                <div className={styles.row2}>
                  <input type="text" name="sample6_address" value={form.sample6_address} readOnly />
                </div>
                <div className={styles.row3}>
                  <input type="text" name="sample6_extraAddress" value={form.sample6_extraAddress} readOnly />
                  <input type="text" name="sample6_detailAddress" value={form.sample6_detailAddress} onChange={handleChange} required />
                </div>
              </div>
            </div>
            <div>
            <label>전화번호</label>
            <div className={styles.rowGroup}>
              <input type="text" name="customer_hp1" className={styles.shortInput} value={form.customer_hp1} onChange={handleChange} />
              -
              <input type="text" name="customer_hp2" className={styles.shortInput} value={form.customer_hp2} onChange={handleChange} />
              -
              <input type="text" name="customer_hp3" className={styles.shortInput} value={form.customer_hp3} onChange={handleChange} />
              <button type="button" onClick={handleSendSMS}>휴대폰 인증</button>
            </div>
            {isPhoneVerified && (
              <span style={{ color: "green", fontSize: "14px", marginLeft: "10px" }}>
                휴대폰 인증 완료
              </span>
            )}
          </div>

          <SignupSMSModal
            isOpen={isSMSModalOpen}
            onRequestClose={() => setIsSMSModalOpen(false)}
            onVerified={handleSMSVerified}
            phoneNumber={`${form.customer_hp1}${form.customer_hp2}${form.customer_hp3}`}
          />
   
            <div>
              <label>이메일</label>
              <div className={styles.rowGroup}>
                <input type="text" name="customer_email1" className={styles.emailInput} value={form.customer_email1} onChange={handleChange} required />
                <span>@</span>
                <input type="text" name="customer_email2" className={styles.emailInput} value={form.customer_email2} onChange={handleChange} required />
                <select name="customer_email3" className={styles.emailSelect} value={form.customer_email3} onChange={handleChange}>
                  <option value="0">직접입력</option>
                  <option value="naver.com">네이버</option>
                  <option value="gmail.com">구글</option>
                  <option value="daum.net">다음</option>
                  <option value="nate.com">네이트</option>
                </select>
              </div>
            </div>
            <div>
              <label>직업</label>
              <input type="text" name="customer_job" value={form.customer_job} onChange={handleChange} />
            </div>
            <div>
              <label>투자성향</label>
              <select name="customer_risk_type" value={form.customer_risk_type} onChange={handleChange} required>
                <option value="">선택하세요</option>
                <option value="안정형">안정형</option>
                <option value="중립형">보수형</option>
                <option value="위험중립형">위험중립형</option>
                <option value="적극형">적극형</option>
                <option value="공격형">공격형</option>
                <option value="알수없음">알수없음</option>
              </select>
            </div>
            <div className={styles.bottomButton}>
              <button type="submit">회원가입</button>
              <button type="button" onClick={handleReset}>초기화</button>
              <button type="button" onClick={() => window.location.href = '/'}>가입취소</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Join;
