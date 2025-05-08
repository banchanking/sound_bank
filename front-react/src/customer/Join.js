import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../Css/customer/Join.module.css';
import SignupSMSModal from "../smsmodal/SignupSMSModal";
import IdAuth from '../customer_center/Idauth';

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
  const [isIdVerified, setIsIdVerified] = useState(false);
  const [messageIdAuth, setMessageIdAuth] = useState('');
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);
  const [isIdLoading, setIsIdLoading] = useState(false); // 인증 인식 중 표시

 

    // 신분증 인증 메시지 수신
    useEffect(() => {
      const handler = (e) => {
        if (e.data && e.data.status === 'success') {
          setIsIdVerified(true);
          setMessageIdAuth('신분증 인증 완료');
          setIsIdLoading(false);
          setIsIdModalOpen(false);  // 모달도 자동으로 닫기
        }
      };
      window.addEventListener('message', handler);
      return () => window.removeEventListener('message', handler);
    }, []);

  // 정규식: 최소 8자 이상, 영문자, 숫자, 특수문자 포함
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  useEffect(() => {
    if (form.customer_password && form.re_password) {
      if (form.customer_password !== form.re_password) {
        setPwdMsg('비밀번호가 일치하지 않습니다.');
      } else if (!passwordPattern.test(form.customer_password)) {
        setPwdMsg('비밀번호는 최소 8자 이상, 영문자, 숫자, 특수문자를 포함해야 합니다.');
      } else {
        setPwdMsg('비밀번호가 일치합니다.');
      }
    } else {
      setPwdMsg('');
    }
  }, [form.customer_password, form.re_password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
    ...prev, 
    [name]: value,
    ...(name === 'customer_id' && { hiddenUserid: '0' })
  }));
    
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
    setIsIdVerified(false);
  };
  
  // 입력된 뒷자리 문자열(rrnBack)을 받아, 첫 문자 뒤를 모두 '*'로 대체합니다.
  const maskRRNBack = (rrnBack) => {
    if (!rrnBack) return '';
    // charAt(0): 앞 자리, repeat: 나머지 길이만큼 '*' 생성
    return rrnBack.charAt(0) + '*'.repeat(rrnBack.length - 1);
  };

  const confirmId = async () => {
    if (!form.customer_id.trim()) {
      alert('아이디를 입력하세요');
      return;
    }
    try {
      const res = await axios.get(`https://sound-bank.duckdns.org/api/idConfirmAction.do?customer_id=${form.customer_id}`);
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
    const requiredFields = [
      form.customer_password,
      form.re_password,
      form.account_pwd,
      form.customer_resident1,
      form.customer_resident2,
      form.sample6_address,
      form.sample6_detailAddress,
      form.customer_hp1,
      form.customer_hp2,
      form.customer_hp3,
      form.customer_email1,
      form.customer_email2,
      form.customer_job,
      form.customer_risk_type
    ];
    if (requiredFields.some(f => f == null || f.trim() === '')) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    if (form.hiddenUserid === '0') {
      alert('아이디 중복확인을 해주세요!');
      return;
    }

    if (!isPhoneVerified) {
      alert('휴대폰 인증을 완료해주세요!');
      return;
    }

    if (!passwordPattern.test(form.customer_password)) return alert('비밀번호가 보안 기준을 충족하지 않습니다.');
    if (form.customer_password !== form.re_password) return alert('비밀번호가 일치하지 않습니다.');
    if (!isIdVerified) return alert('신분증 인증을 완료해주세요!');

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
      await axios.post('https://sound-bank.duckdns.org/api/joinAction.do', requestData);
      alert('계좌개설 성공.\nSoundBank 이용해 주셔서 감사합니다.');
      window.location.href = '/login';
    } catch (error) {
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  const handleSendSMS = async () => {
    const phoneNumber = `${form.customer_hp1}${form.customer_hp2}${form.customer_hp3}`;
    try {
      const res = await axios.post('https://sound-bank.duckdns.org/api/sms/signup/request', {
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
  
  // 모달 오픈 전 로딩 시작 함수
  const openIdModal = () => {
    setIsIdLoading(true);  // 로딩 표시
    setIsIdModalOpen(true);
  };

  // 신분증 인증 성공 시 OCR 결과를 받는다.
  const handleIdSuccess = (ocrData) => {

    // 주민등록번호 분리
    const[front, back] = (ocrData.ocr_fields_rrn || '').split('-');
    setForm(prev => ({
      ...prev,
      customer_name: ocrData.ocr_fields_name || prev.customer_name,
      customer_resident1: front || prev.customer_resident1,
      customer_resident2: back  || prev.customer_resident2,
    }));
    setIsIdVerified(true);
    setMessageIdAuth('신분증 인증 완료');
    setIsIdLoading(false);
    setIsIdModalOpen(false);
    alert('신분증 인증이 완료되었습니다.');
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
              <label>아이디 *</label>
              <div className={styles.rowGroup1}>
                <input type="text" name="customer_id" value={form.customer_id} onChange={handleChange} />
                <button className={styles.idButton} type="button" onClick={confirmId}>중복확인</button>
              </div>
            </div>
            <div>
              <label>비밀번호 *</label>
              <input type="password" name="customer_password" value={form.customer_password} onChange={handleChange} />
            </div>
            <div>
              <label>비밀번호 확인 *</label>
              <input type="password" name="re_password" value={form.re_password} onChange={handleChange} />
              <span style={{ color: form.customer_password === form.re_password ? 'blue' : 'red' }}>{pwdMsg}</span>
            </div>

            {/* 신분증 인증 버튼 및 모달 */}
            <div>
              <button
                type="button"
                className={styles.joinSendBtn}
                onClick={openIdModal}
                disabled={isIdLoading}
              >
                신분증 인증 *
              </button>
              {messageIdAuth && <span style={{ color: 'green', marginLeft: 10 }}>{messageIdAuth}</span>}
              {isIdModalOpen && (
                <div className={styles.idAuthModal}>
                  {/* 인증 인식 중 UI */}
                  {isIdLoading && (
                    <div className={styles.loading}>
                      <p>신분증 인증 인식중입니다...</p>
                    </div>
                  )}
                  <button onClick={() => { setIsIdModalOpen(false); setIsIdLoading(false); }}>
                    닫기
                  </button>
                  <IdAuth onSuccess={handleIdSuccess} />
                </div>
              )}
            </div> 

            <div>
              <label>이름 *</label>
              <input type="text" name="customer_name" value={form.customer_name} onChange={handleChange} readOnly/>
            </div>
            <div>
              <label>주민번호 *</label>
              <div className={styles.rowGroup1}>
                <input type="text" name="customer_resident1" className={styles.shortInput} value={form.customer_resident1} onChange={handleChange} readOnly/> 
                -
                {/* 상태(form.customer_resident2)에는 원본이 남아있지만,
                화면에는 maskRRNBack 함수로 마스킹된 값만 보여줌 */}
                <input type="text" name="customer_resident2" className={styles.shortInput}value={maskRRNBack(form.customer_resident2)}readOnly
                />
                  
                  
              </div>
            </div>
            <div>
              <label>주소 *</label>
              <div className={styles.addressGroup}>
                <input type="text" name="sample6_postcode" className={styles.postcode} value={form.sample6_postcode} readOnly />
                <button type="button" className={styles.searchCodeBtn} onClick={execDaumPostcode}>우편번호 찾기</button>
                <div className={styles.row2}>
                  <input type="text" name="sample6_address" value={form.sample6_address} readOnly />
                </div>
                <div className={styles.row3}>
                  <input type="text" name="sample6_extraAddress" value={form.sample6_extraAddress} readOnly />
                  <input type="text" name="sample6_detailAddress" value={form.sample6_detailAddress} onChange={handleChange} />
                </div>
              </div>
            </div>
            <div>
            <label>전화번호 *</label>
            <div className={styles.rowGroup}>
              <input type="text" name="customer_hp1" className={styles.shortInput} value={form.customer_hp1} onChange={handleChange} />
              -
              <input type="text" name="customer_hp2" className={styles.shortInput} value={form.customer_hp2} onChange={handleChange} />
              -
              <input type="text" name="customer_hp3" className={styles.shortInput} value={form.customer_hp3} onChange={handleChange} />
              <button className={styles.phoneButton} type="button" onClick={handleSendSMS}>휴대폰 인증 *</button>
            </div>
            {isPhoneVerified && (
              <span style={{ color: "green", fontSize: "14px", marginLeft: "10px" }}>
                휴대폰 인증 완료
              </span>
            )} <br/>
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
                <input type="text" name="customer_email1" className={styles.emailInput} value={form.customer_email1} onChange={handleChange}  />
                <span>@</span>
                <input type="text" name="customer_email2" className={styles.emailInput} value={form.customer_email2} onChange={handleChange}  />
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
              <label>직업 *</label>
              <input type="text" name="customer_job" value={form.customer_job} onChange={handleChange} />
            </div>
            <div>
              <label>투자성향</label>
              <select name="customer_risk_type" value={form.customer_risk_type} onChange={handleChange} >
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
              <button className={styles.joinSendBtn}type="submit">회원가입</button>
              <button className={styles.joinSendBtn}type="button" onClick={handleReset}>초기화</button>
              <button className={styles.joinSendBtn}type="button" onClick={() => window.location.href = '/'}>가입취소</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Join;
