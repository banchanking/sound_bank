package com.boot.sound.deposit.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.sound.deposit.dao.DepositDAO;
import com.boot.sound.deposit.dto.DepositDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DepositService {
    private final DepositDAO depositDAO;

    // 상품 관련 메서드
    public List<DepositDTO> getDepositProducts() {
        return depositDAO.getDepositProducts();
    }

    public List<DepositDTO> getSavingsProducts() {
        return depositDAO.getSavingsProducts();
    }

    public DepositDTO getDepositProductDetail(int productId) {
        return depositDAO.getDepositProductDetail(productId);
    }

    public DepositDTO getSavingsProductDetail(int productId) {
        return depositDAO.getSavingsProductDetail(productId);
    }

    // 계좌 관련 메서드
    public List<DepositDTO> getDepositAccounts(String customerId) {
        return depositDAO.getDepositAccounts(customerId);
    }

    public List<DepositDTO> getSavingsAccounts(String customerId) {
        return depositDAO.getSavingsAccounts(customerId);
    }

    public DepositDTO getDepositAccountDetail(int accountId) {
        return depositDAO.getDepositAccountDetail(accountId);
    }

    public DepositDTO getSavingsAccountDetail(int accountId) {
        return depositDAO.getSavingsAccountDetail(accountId);
    }

    // 계좌 생성/해지
    @Transactional
    public void createDepositAccount(DepositDTO account) {
        // 1. 계좌번호 자동 생성
        account.setAccountNumber(generateUniqueAccountNumber());

        // 2. 상품 이자율 복사
        DepositDTO product = depositDAO.getDepositProductDetail(account.getProductId());
        if (product == null) {
            throw new RuntimeException("상품 정보를 찾을 수 없습니다.");
        }
        account.setInterestRate(product.getInterestRate());

        // 3. 계좌 상태 초기화
        account.setAccountStatus("ACTIVE");

        // 4. 중복 체크
        if (depositDAO.checkAccountNumber(account.getAccountNumber()) > 0) {
            throw new RuntimeException("이미 존재하는 계좌번호입니다.");
        }

        // 5. 계좌 생성
        if (depositDAO.createDepositAccount(account) != 1) {
            throw new RuntimeException("예금 계좌 생성에 실패했습니다.");
        }

        // 6. 🔥 최초 입금 거래내역 생성
        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(account.getId());  // 생성된 계좌 ID
        transaction.setTransactionType("DEPOSIT");  // 거래유형: 입금
        transaction.setTransactionAmount(account.getBalance());  // 초기 입금액
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setTransactionDescription("초기 입금"); // 메모
        transaction.setBalance(account.getBalance()); // ⭐ 추가해야 함

        depositDAO.createDepositTransaction(transaction);  // 거래내역 저장
    }



 // 적금 계좌 생성 (초기 입금 + 거래내역 저장까지)
    @Transactional
    public void createSavingsAccount(DepositDTO account) {
        // 계좌번호 자동 생성 및 세팅
        account.setAccountNumber(generateUniqueAccountNumber());

        if (depositDAO.checkAccountNumber(account.getAccountNumber()) > 0) {
            throw new RuntimeException("이미 존재하는 계좌번호입니다.");
        }
        if (depositDAO.createSavingsAccount(account) != 1) {
            throw new RuntimeException("적금 계좌 생성에 실패했습니다.");
        }

        // ✅ 여기 추가!!
        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(account.getId());  // 새로 생성된 적금계좌 ID
        transaction.setTransactionType("DEPOSIT"); // 거래 타입: 입금
        transaction.setTransactionAmount(BigDecimal.ZERO); // 적금은 초기 입금 0원
        transaction.setBalance(BigDecimal.ZERO);           // 잔액 0원
        transaction.setTransactionDescription("적금 계좌 개설");

        depositDAO.createSavingsTransaction(transaction);
    }


 // 예금 해지
    @Transactional
    public void closeDepositAccount(String accountId, String accountPassword) {
        // 예금 계좌의 customer_id 가져오기
        String customerId = depositDAO.getCustomerIdFromDepositAccount(accountId);
        BigDecimal balance = depositDAO.getDepositAccountBalance(accountId);

        
        System.out.println("[DEBUG] 해지할 계좌 잔액: " + balance);
        System.out.println("[DEBUG] 해지할 계좌의 고객ID: " + customerId);
        if (balance == null) {
            throw new RuntimeException("계좌를 찾을 수 없습니다.");
        }

        if (balance.compareTo(BigDecimal.ZERO) > 0) {
            System.out.println("[DEBUG] 기본계좌로 이체 시도: 고객ID=" + customerId + ", 이체금액=" + balance);
            depositDAO.transferBalanceToMainAccount(customerId, balance);
            System.out.println("[DEBUG] 기본계좌로 이체 완료");
        }

        if (depositDAO.closeDepositAccount(accountId, accountPassword) != 1) { // ✅ Long.parseLong 제거
            throw new RuntimeException("예금 계좌 해지에 실패했습니다.");
        }
    }


    
 // 적금 해지
    @Transactional
    public void closeSavingsAccount(String accountId, String accountPassword) {
        // 적금 계좌의 customer_id 가져오기
        String customerId = depositDAO.getCustomerIdFromSavingsAccount(accountId);
        BigDecimal balance = depositDAO.getSavingsAccountBalance(accountId);

        if (balance == null) {
            throw new RuntimeException("계좌를 찾을 수 없습니다.");
        }

        if (balance.compareTo(BigDecimal.ZERO) > 0) {
            depositDAO.transferBalanceToMainAccount(customerId, balance); // ✅ customer_id 기준 이체
        }

        if (depositDAO.closeSavingsAccount(accountId, accountPassword) != 1) { // ✅ Long.parseLong 제거
            throw new RuntimeException("적금 계좌 해지에 실패했습니다.");
        }
    }



    // 자동이체 관련
    @Transactional
    public void setAutoTransfer(int accountId, boolean enabled, BigDecimal amount, int transferDay) {
        if (depositDAO.setAutoTransfer(accountId, enabled, amount, transferDay) != 1) {
            throw new RuntimeException("자동이체 설정에 실패했습니다.");
        }
    }

    @Transactional
    public void processAutoTransfers() {
        int today = LocalDate.now().getDayOfMonth();
        List<DepositDTO> accounts = depositDAO.getAutoTransferAccounts(today);
        
        for (DepositDTO account : accounts) {
            try {
                depositDAO.executeAutoTransfer(account.getId(), account.getAutoTransferAmount());
                
                DepositDTO transaction = new DepositDTO();
                transaction.setAccountId(account.getId());
                transaction.setTransactionType("AUTO_TRANSFER");
                transaction.setTransactionAmount(account.getAutoTransferAmount());
                transaction.setTransactionDate(LocalDateTime.now());
                transaction.setTransactionDescription("자동이체");
                
                depositDAO.createDepositTransaction(transaction);
            } catch (Exception e) {
                // 로그 기록
                continue;
            }
        }
    }

    // 만기 처리 관련
    @Transactional
    public void processMaturity() {
        LocalDate today = LocalDate.now();
        List<DepositDTO> accounts = depositDAO.getMaturedSavingsAccounts(today);
        
        for (DepositDTO account : accounts) {
            try {
                BigDecimal interestAmount = calculateInterest(account);
                depositDAO.processMaturity(account.getId(), interestAmount);
                depositDAO.updateSavingsAccountStatus(account.getId(), "MATURED");
            } catch (Exception e) {
                // 로그 기록
                continue;
            }
        }
    }

    // 이자 지급 관련
    @Transactional
    public void payInterest() {
        LocalDate today = LocalDate.now();
        
        // 예금 이자 지급
        List<DepositDTO> depositAccounts = depositDAO.getInterestPaymentDepositAccounts(today);
        for (DepositDTO account : depositAccounts) {
            try {
                BigDecimal interestAmount = calculateInterest(account);
                depositDAO.payDepositInterest(account.getId(), interestAmount);
            } catch (Exception e) {
                // 로그 기록
                continue;
            }
        }
        
        // 적금 이자 지급
        List<DepositDTO> savingsAccounts = depositDAO.getInterestPaymentSavingsAccounts(today);
        for (DepositDTO account : savingsAccounts) {
            try {
                BigDecimal interestAmount = calculateInterest(account);
                depositDAO.paySavingsInterest(account.getId(), interestAmount);
            } catch (Exception e) {
                // 로그 기록
                continue;
            }
        }
    }

 // ✅ 예금 입금
    @Transactional
    public void deposit(int accountId, BigDecimal amount, String accountPassword) {
        DepositDTO account = depositDAO.getDepositAccountDetail(accountId);
        if (!account.getAccountPassword().equals(accountPassword)) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        if (depositDAO.deposit(accountId, amount) != 1) {
            throw new RuntimeException("입금 실패");
        }

        // ⭐ 입금 후 최신 잔액 조회
        BigDecimal updatedBalance = depositDAO.getDepositAccountBalance(accountId);

        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(accountId);
        transaction.setTransactionType("입금");
        transaction.setTransactionAmount(amount);
        transaction.setBalance(updatedBalance);
        transaction.setTransactionDescription("입금 거래");
        transaction.setTransactionDate(LocalDateTime.now());

        depositDAO.createDepositTransaction(transaction);
    }

    // ✅ 예금 출금
    @Transactional
    public void withdraw(int accountId, BigDecimal amount, String accountPassword) {
        DepositDTO account = depositDAO.getDepositAccountDetail(accountId);
        if (!account.getAccountPassword().equals(accountPassword)) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        if (account.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("잔액이 부족합니다.");
        }

        if (depositDAO.withdraw(accountId, amount) != 1) {
            throw new RuntimeException("출금 실패");
        }

        // ⭐ 출금 후 최신 잔액 조회
        BigDecimal updatedBalance = depositDAO.getDepositAccountBalance(accountId);

        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(accountId);
        transaction.setTransactionType("출금");
        transaction.setTransactionAmount(amount);
        transaction.setBalance(updatedBalance);
        transaction.setTransactionDescription("출금 거래");
        transaction.setTransactionDate(LocalDateTime.now());

        depositDAO.createDepositTransaction(transaction);
    }

    // ✅ 적금 입금
    @Transactional
    public void depositSavings(int accountId, BigDecimal amount, String accountPassword) {
        DepositDTO account = depositDAO.getSavingsAccountDetail(accountId);
        if (!account.getAccountPassword().equals(accountPassword)) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        if (depositDAO.depositSavings(accountId, amount) != 1) {
            throw new RuntimeException("적금 입금 실패");
        }

        BigDecimal updatedBalance = depositDAO.getSavingsAccountBalance(accountId);

        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(accountId);
        transaction.setTransactionType("입금");
        transaction.setTransactionAmount(amount);
        transaction.setBalance(updatedBalance);
        transaction.setTransactionDescription("적금 입금 거래");
        transaction.setTransactionDate(LocalDateTime.now());

        depositDAO.createSavingsTransaction(transaction);
    }

    // ✅ 적금 출금
    @Transactional
    public void withdrawSavings(int accountId, BigDecimal amount, String accountPassword) {
        DepositDTO account = depositDAO.getSavingsAccountDetail(accountId);
        if (!account.getAccountPassword().equals(accountPassword)) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        if (account.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("잔액이 부족합니다.");
        }

        if (depositDAO.withdrawSavings(accountId, amount) != 1) {
            throw new RuntimeException("적금 출금 실패");
        }

        BigDecimal updatedBalance = depositDAO.getSavingsAccountBalance(accountId);

        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(accountId);
        transaction.setTransactionType("출금");
        transaction.setTransactionAmount(amount);
        transaction.setBalance(updatedBalance);
        transaction.setTransactionDescription("적금 출금 거래");
        transaction.setTransactionDate(LocalDateTime.now());

        depositDAO.createSavingsTransaction(transaction);
    }






    // 거래 내역 조회
    public List<DepositDTO> getDepositTransactions(int accountId, LocalDateTime startDate, LocalDateTime endDate) {
        return depositDAO.getDepositTransactions(accountId, startDate, endDate);
    }

    public List<DepositDTO> getSavingsTransactions(int accountId, LocalDateTime startDate, LocalDateTime endDate) {
        return depositDAO.getSavingsTransactions(accountId, startDate, endDate);
    }


    // 예금 비밀번호 변경
    @Transactional
    public void changeDepositAccountPassword(int accountId, String oldPassword, String newPassword) {
        if (depositDAO.changeDepositAccountPassword(accountId, oldPassword, newPassword) != 1) {
            throw new RuntimeException("예금 계좌 비밀번호 변경에 실패했습니다.");
        }
    }
    
    // 적금 비밀번호 변경
    @Transactional
    public void changeSavingsAccountPassword(int accountId, String oldPassword, String newPassword) {
        if (depositDAO.changeSavingsAccountPassword(accountId, oldPassword, newPassword) != 1) {
            throw new RuntimeException("적금 계좌 비밀번호 변경에 실패했습니다.");
        }
    }
    
    // 예금 별명 변경
    @Transactional
    public void updateDepositAccountNickname(String accountId, String nickname) {
        if (depositDAO.updateNickname(accountId, nickname) != 1) {
            throw new RuntimeException("계좌 별명 변경에 실패했습니다.");
        }
    }

    // 적금 별명 변경
    @Transactional
    public void updateSavingsAccountNickname(String accountId, String nickname) {
        if (depositDAO.updateSavingsNickname(accountId, nickname) != 1) {
            throw new RuntimeException("적금 계좌 별명 변경에 실패했습니다.");
        }
    }


    // 이자 계산
    private BigDecimal calculateInterest(DepositDTO account) {
        BigDecimal balance = account.getBalance();
        BigDecimal interestRate = account.getInterestRate();
        LocalDate startDate = account.getCreatedAt().toLocalDate();
        LocalDate endDate = LocalDate.now();
        
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        BigDecimal dailyRate = interestRate.divide(BigDecimal.valueOf(36500), 10, RoundingMode.HALF_UP);
        BigDecimal interest = balance.multiply(dailyRate).multiply(BigDecimal.valueOf(days));
        
        return interest.setScale(0, RoundingMode.DOWN);
    }

    // 예금 상품 추가
    @Transactional
    public void addDepositProduct(DepositDTO product) {
        if (depositDAO.addDepositProduct(product) != 1) {
            throw new RuntimeException("예금 상품 추가에 실패했습니다.");
        }
    }

    // 예금 상품 수정
    @Transactional
    public void updateDepositProduct(int productId, DepositDTO product) {
        if (depositDAO.updateDepositProduct(productId, product) != 1) {
            throw new RuntimeException("예금 상품 수정에 실패했습니다.");
        }
    }

    // 예금 상품 삭제
    @Transactional
    public void deleteDepositProduct(String productId) {
        if (depositDAO.deleteDepositProduct(productId) != 1) {
            throw new RuntimeException("예금 상품 삭제에 실패했습니다.");
        }
    }
    
    // 적금 상품 추가
    @Transactional
    public void addSavingsProduct(DepositDTO product) {
        if (depositDAO.addSavingsProduct(product) != 1) {
            throw new RuntimeException("적금 상품 추가에 실패했습니다.");
        }
    }

    // 적금 상품 수정
    @Transactional
    public void updateSavingsProduct(int productId, DepositDTO product) {
        if (depositDAO.updateSavingsProduct(productId, product) != 1) {
            throw new RuntimeException("적금 상품 수정에 실패했습니다.");
        }
    }

    // 적금 상품 삭제
    @Transactional
    public void deleteSavingsProduct(String productId) {
        if (depositDAO.deleteSavingsProduct(productId) != 1) {
            throw new RuntimeException("적금 상품 삭제에 실패했습니다.");
        }
    }
   
    
 // 계좌번호 생성 함수
    public String generateAccountNumber() {
        String prefix = "174";
        String middle = String.format("%06d", (int)(Math.random() * 1_000_000)); // 6자리
        String suffix = String.format("%04d", (int)(Math.random() * 10_000));   // 4자리
        return prefix + middle + suffix;
    }

    // 중복 없는 계좌번호 생성 함수
    public String generateUniqueAccountNumber() {
        String accountNumber;
        do {
            accountNumber = generateAccountNumber();
        } while (depositDAO.checkAccountNumber(accountNumber) > 0);
        return accountNumber;
    }
    
    public BigDecimal getDepositAccountBalanceByAccountNumber(String accountNumber) {
        return depositDAO.getDepositAccountBalanceByAccountNumber(accountNumber);
    }
    
    public BigDecimal getSavingsAccountBalanceByAccountNumber(String accountNumber) {
        return depositDAO.getDepositAccountBalanceByAccountNumber(accountNumber);
    }


    
} 