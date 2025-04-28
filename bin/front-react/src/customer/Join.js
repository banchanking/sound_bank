import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Css/customer/Join.css';

const Join = () => {
    // 상태 초기화: 사용자 입력을 위한 상태 변수들
    const [form, setForm] = useState({
        customer_id: '',
        customer_password: '',
        re_password: '',
        customer_name: '',
        customer_resident_number: '',
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
        customer_account_number: '0',
        hiddenUserid: '0'
    });

    const [pwdMsg, setPwdMsg] = useState(''); // 비밀번호 일치 여부 메시지

    // 비밀번호 확인: 두 개의 비밀번호가 일치하는지 실시간으로 확인
    useEffect(() => {
        if (form.customer_password && form.re_password) {
            setPwdMsg(form.customer_password === form.re_password ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다');
        } else {
            setPwdMsg('');
        }
    }, [form.customer_password, form.re_password]);

    // 폼 입력값 처리: 각 입력값을 상태로 저장
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        // 이메일 도메인 선택 시 처리: '직접입력' 선택 시 이메일2 필드를 비워둠
        if (name === 'customer_email3') {
            if (value === '0') {
                setForm(prev => ({ ...prev, customer_email2: '' }));
            } else {
                setForm(prev => ({ ...prev, customer_email2: value }));
            }
        }
    };

    // 아이디 중복 확인
    const confirmId = async () => {
        if (!form.customer_id) {
            alert('아이디를 입력하세요');
            return;
        }
        try {
            // API 호출을 통해 아이디 중복 확인
            const response = await axios.get(`http://15.165.57.30:8081/api/idConfirmAction.do?customer_id=${form.customer_id}`);
            const { available, message } = response.data;
            alert(message);
            if (available) {
                setForm(prev => ({ ...prev, hiddenUserid: '1' }));
            }
        } catch (error) {
            console.error('ID 확인 오류:', error);
            alert('아이디 확인 중 오류가 발생했습니다: ' + (error.response?.data || error.message));
        }
    };

    // 회원가입 제출 처리
    const joinSubmit = async (e) => {
        e.preventDefault();
        if (form.hiddenUserid === '0') {
            alert('중복확인 해주세요!');
            return;
        }

        // 주소 합치기
        const fullAddress = `${form.sample6_address} ${form.sample6_extraAddress} ${form.sample6_detailAddress}`.trim();

        // 서버로 전송할 데이터 준비
        const requestData = {
            customer_id: form.customer_id,
            customer_password: form.customer_password,
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
            // API 호출로 회원가입 처리
            const response = await axios.post('http://15.165.57.30:8081/api/joinAction.do', requestData);
            alert(response.data);
            window.location.href = '/';
        } catch (error) {
            alert(JSON.stringify(error.response?.data) || '회원가입 중 오류가 발생했습니다.');
        }
    };

    // Daum 우편번호 API 호출 처리  (API세팅은 index.html에 있음)
    const execDaumPostcode = () => {
        if (!window.daum || !window.daum.Postcode) {
            alert('Daum 우편번호 API가 로드되지 않았습니다. 페이지를 새로고침하거나 네트워크를 확인하세요.');
            return;
        }
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
        <div className="wrap">
            <div className="container">
                <h1>계좌개설</h1>
                <form onSubmit={joinSubmit}>
                    <input type="hidden" name="hiddenUserid" value={form.hiddenUserid} />

                    {/* 아이디 입력 및 중복확인 버튼 */}
                    <div>
                        <label>아이디</label>
                        <div className="row-group1">
                            <input type="text" name="customer_id" value={form.customer_id} onChange={handleChange} required />
                            <button type="button" onClick={confirmId}>중복확인</button>
                        </div>
                    </div>

                    {/* 비밀번호 입력 */}
                    <div>
                        <label>비밀번호</label>
                        <input type="password" name="customer_password" value={form.customer_password} onChange={handleChange} required />
                    </div>

                    {/* 비밀번호 확인 */}
                    <div>
                        <label>비밀번호 확인</label>
                        <input type="password" name="re_password" value={form.re_password} onChange={handleChange} required />
                        <span style={{ color: form.customer_password === form.re_password ? 'blue' : 'red' }}>{pwdMsg}</span>
                    </div>

                    {/* 이름 입력 */}
                    <div>
                        <label>이름</label>
                        <input type="text" name="customer_name" value={form.customer_name} onChange={handleChange} required />
                    </div>

                    {/* 생일 입력 (이름 아래에 추가) */}
                    <div>
                        <label>생일</label>
                        <input type="date" name="customer_birthday" value={form.customer_birthday} onChange={handleChange} required />
                    </div>

                    {/* 주민번호 입력 */}
                    <div>
                        <label>주민번호</label>
                        <div className="row-group1">
                            <input type="text" name="customer_resident1" className="short-input" value={form.customer_resident1} onChange={handleChange} />
                            -
                            <input type="text" name="customer_resident2" className="short-input" value={form.customer_resident2} onChange={handleChange} />
                        </div>
                    </div>

                    {/* 주소 입력 및 우편번호 찾기 */}
                    <div>
                        <label>주소</label>
                        <div className="address-group">
                            <input type="text" name="sample6_postcode" className="postcode" value={form.sample6_postcode} placeholder="우편번호" readOnly />
                            <button type="button" className="search-btn" onClick={execDaumPostcode}>우편번호 찾기</button>
                            <div className="row2">
                                <input type="text" name="sample6_address" value={form.sample6_address} placeholder="기본 주소" readOnly />
                            </div>
                            <div className="row3">
                                <input type="text" name="sample6_extraAddress" value={form.sample6_extraAddress} placeholder="참고항목" readOnly />
                                <input type="text" name="sample6_detailAddress" value={form.sample6_detailAddress} placeholder="상세 주소" onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    {/* 전화번호 입력 */}
                    <div>
                        <label>전화번호</label>
                        <div className="row-group">
                            <input type="text" name="customer_hp1" className="short-input" value={form.customer_hp1} onChange={handleChange} />
                            -
                            <input type="text" name="customer_hp2" className="short-input" value={form.customer_hp2} onChange={handleChange} />
                            -
                            <input type="text" name="customer_hp3" className="short-input" value={form.customer_hp3} onChange={handleChange} />
                        </div>
                    </div>

                    {/* 이메일 입력 */}
                    <div>
                        <label>이메일</label>
                        <div className="row-group">
                            <input type="text" name="customer_email1" className="email-input" value={form.customer_email1} onChange={handleChange} required />
                            <span>@</span>
                            <input type="text" name="customer_email2" className="email-input" value={form.customer_email2} onChange={handleChange} required />
                            <select name="customer_email3" className="email-select" value={form.customer_email3} onChange={handleChange}>
                                <option value="0">직접입력</option>
                                <option value="naver.com">네이버</option>
                                <option value="gmail.com">구글</option>
                                <option value="daum.net">다음</option>
                                <option value="nate.com">네이트</option>
                            </select>
                        </div>
                    </div>

                    {/* 직업 입력 */}
                    <div>
                        <label>직업</label>
                        <input type="text" name="customer_job" value={form.customer_job} onChange={handleChange} />
                    </div>

                    {/* 투자성향 입력 (직업 아래에 추가) */}
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

                    {/* 버튼들: 오른쪽 정렬 & 간격 줄이기 */}
                    <div className="bottomButton">
                        <button type="submit">회원가입</button>
                        <button type="reset">초기화</button>
                        <button type="button" onClick={() => window.location.href = '/'}>가입취소</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Join;
