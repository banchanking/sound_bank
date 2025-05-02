import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RefreshToken from '../../jwt/RefreshToken';
import { getCustomerID } from '../../jwt/AxiosToken';
import '../../Css/depositcss/DepositChange.css';

const DepositChange = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    nickname: '',
  });
  const customerId = getCustomerID();

  const formatAccountNumber = (accountNumber) => {
    if (!accountNumber || accountNumber.length !== 13) return accountNumber;
    return `${accountNumber.slice(0, 3)}-${accountNumber.slice(3, 9)}-${accountNumber.slice(9)}`;
  };

  useEffect(() => {
    if (!customerId) {
      const goLogin = window.confirm("로그인이 필요합니다. 로그인하시겠습니까?");
      if (goLogin) navigate("/login");
      else navigate("/");
      return;
    }
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await RefreshToken.get(`/deposit/accounts/customer/${customerId}`);
      setAccounts(res.data);
    } catch (error) {
      alert('계좌 목록 조회 실패');
    }
  };

  const handleSelectChange = (e) => {
    const accountId = parseInt(e.target.value);
    const selected = accounts.find(a => a.id === accountId);
    setSelectedAccount(selected);
    setFormData({
      oldPassword: '',
      newPassword: '',
      nickname: selected?.nickname || '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async () => {
    if (!selectedAccount) return alert('계좌를 선택하세요');
    if (formData.oldPassword.length !== 4 || formData.newPassword.length !== 4) {
      return alert('비밀번호는 4자리여야 합니다.');
    }
    try {
      await RefreshToken.put(`/deposit/accounts/deposit/${selectedAccount.id}/password`, {
        accountId: selectedAccount.id,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      alert('비밀번호가 변경되었습니다.');
      navigate('/depositAccountInquiry');
    } catch (err) {
      alert('비밀번호 변경 실패');
    }
  };

  const handleNicknameSubmit = async () => {
    if (!selectedAccount) return alert('계좌를 선택하세요');
    try {
      await RefreshToken.put(`/deposit/accounts/deposit/${selectedAccount.id}/nickname`, {
        accountId: selectedAccount.id,
        nickname: formData.nickname,
      });
      alert('별명이 변경되었습니다.');
      navigate('/depositAccountInquiry');
    } catch (err) {
      alert('별명 변경 실패');
    }
  };

  return (
    <div className="depositChange-container">
      <h2 className="depositChange-title">예금 계좌 정보 변경</h2>

      <div className="depositChange-board">
        <div className="depositChange-group">
          <label>계좌 선택</label>
          <select onChange={handleSelectChange}>
            <option value="">계좌를 선택하세요</option>
            {accounts
              .filter(acc => acc.accountStatus === 'ACTIVE')
              .map(acc => (
                <option key={acc.id} value={acc.id}>
                  {formatAccountNumber(acc.accountNumber)} - {acc.productName} - {(acc.balance ?? 0).toLocaleString()}원
                </option>
              ))}
          </select>
        </div>

        {selectedAccount && (
          <>
            <div className="depositChange-group">
              <label>기존 비밀번호 (4자리)</label>
              <input
                type="password"
                maxLength="4"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleInputChange}
              />
            </div>
            <div className="depositChange-group">
              <label>새 비밀번호 (4자리)</label>
              <input
                type="password"
                maxLength="4"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
              />
            </div>
            <div className="depositChange-buttonBox">
              <button className="btnBlack" onClick={handlePasswordSubmit}>비밀번호 변경</button>
            </div>

            <div className="depositChange-group">
              <label>계좌 별명 (선택)</label>
              <input
                type="text"
                name="nickname"
                maxLength="20"
                value={formData.nickname}
                onChange={handleInputChange}
              />
            </div>
            <div className="depositChange-buttonBox">
              <button className="btnBlack" onClick={handleNicknameSubmit}>별명 변경</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DepositChange;
