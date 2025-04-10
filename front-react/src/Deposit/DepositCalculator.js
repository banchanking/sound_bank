import React from 'react';
import Draggable from 'react-draggable'; // Draggable import

const DepositCalculator = ({ onClose }) => { // onClose prop 추가
    const [principal, setPrincipal] = React.useState(0);
    const [rate, setRate] = React.useState(0);
    const [time, setTime] = React.useState(0);
    const [total, setTotal] = React.useState(0);

    const calculateTotal = (e) => {
        e.preventDefault(); // 폼 제출 기본 동작 방지

        // 입력값을 숫자로 변환
        const principalAmount = parseFloat(principal) || 0; // 원금
        const interestRate = parseFloat(rate) / 100 || 0; // 이자율 (백분율 변환)
        const timePeriod = parseFloat(time) || 0; // 기간 (년)

        // 총액 계산
        const totalAmount = principalAmount + (principalAmount * interestRate * timePeriod);
        setTotal(totalAmount); // 총액 상태 업데이트
    };

    // 대한민국 원화로 포맷팅
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
        }).format(amount);
    };

    return (
        <Draggable handle=".modal-header">
            <div className="draggable-modal">
                <div className="modal-header">
                    <h2>예금 계산기</h2>
                    <button className="modal-close-button" onClick={onClose}>
                        닫기
                    </button>
                </div>
                <form onSubmit={calculateTotal}>
                    <div>
                        <label>원금 : </label>
                        <input 
                            type="number" 
                            value={principal}
                            onChange={(e) => setPrincipal(e.target.value)}
                        />
                    </div>   
                    <div>
                        <label>이자율 (%)</label>
                        <input 
                            type="number" 
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>기간(년)</label>
                        <input 
                            type="number" 
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>
                    <button type="submit">계산</button>
                </form>
                {total > 0 && (
                    <div>
                        <h3>총액: {formatCurrency(total)} 원</h3>
                    </div>
                )}
            </div>
        </Draggable>
    );
};

export default DepositCalculator;