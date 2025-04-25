-- 예금 계좌 테이블 생성
CREATE TABLE DEPOSIT_ACCOUNT_TBL (
    dat_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '예금 번호',
    customer_id VARCHAR(20) NOT NULL COMMENT '고객 ID',
    account_number VARCHAR(20) NOT NULL UNIQUE COMMENT '계좌번호',
    balance DECIMAL(15,2) DEFAULT 0.00 COMMENT '잔액',
    interest_rate DECIMAL(5,2) NOT NULL COMMENT '이자율',
    account_status VARCHAR(10) DEFAULT 'ACTIVE' COMMENT '계좌상태 (ACTIVE, INACTIVE, CLOSED)',
    created_date DATE NOT NULL COMMENT '생성일자',
    maturity_date DATE COMMENT '만기일자',
    product_type VARCHAR(20) NOT NULL COMMENT '상품유형 (REGULAR, FIXED, INSTALLMENT)',
    auto_transfer BOOLEAN DEFAULT FALSE COMMENT '자동이체여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성시간',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정시간',
    
    -- 인덱스 생성
    INDEX idx_customer_id (customer_id),
    INDEX idx_account_number (account_number),
    INDEX idx_created_date (created_date),
    INDEX idx_maturity_date (maturity_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='예금 계좌 테이블';

-- 테이블 코멘트
ALTER TABLE DEPOSIT_ACCOUNT_TBL COMMENT '예금 계좌 정보를 저장하는 테이블';

-- 초기 데이터 삽입 (테스트용)
INSERT INTO DEPOSIT_ACCOUNT_TBL 
(customer_id, account_number, balance, interest_rate, account_status, created_date, maturity_date, product_type, auto_transfer)
VALUES
('user1', '123-456-7890', 1000000.00, 2.50, 'ACTIVE', '2024-01-01', '2025-01-01', 'REGULAR', FALSE),
('user1', '123-456-7891', 5000000.00, 3.00, 'ACTIVE', '2024-02-01', '2026-02-01', 'FIXED', TRUE),
('user2', '123-456-7892', 2000000.00, 2.75, 'ACTIVE', '2024-03-01', '2025-03-01', 'REGULAR', FALSE); 