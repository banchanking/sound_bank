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
import com.boot.sound.inquire.account.AccountService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DepositService {
    private final DepositDAO depositDAO;
    private final AccountService accountService;

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

 // 예금 계좌 생성
    @Transactional
    public String createDepositAccount(DepositDTO account) {
        // 1. 예금 계좌 번호 생성
        account.setAccountNumber(generateUniqueAccountNumber());

        // 2. 상품 이자율 복사
        DepositDTO product = depositDAO.getDepositProductDetail(account.getProductId());
        if (product == null) {
            throw new RuntimeException("상품 정보를 찾을 수 없습니다.");
        }
        account.setInterestRate(product.getInterestRate());

        // 3. 계좌 상태
        account.setAccountStatus("ACTIVE");

        // 4. 중복 체크
        if (depositDAO.checkAccountNumber(account.getAccountNumber()) > 0) {
            throw new RuntimeException("이미 존재하는 계좌번호입니다.");
        }


        // 5. ✅ 먼저 출금 계좌에서 초기입금액만큼 빼기
        if (depositDAO.withdrawFromAccount(account.getWithdrawalAccountNumber(), account.getBalance()) != 1) {
            throw new RuntimeException("출금 계좌 잔액 차감 실패");
        }


        // 6. 예금계좌 생성
        if (depositDAO.createDepositAccount(account) != 1) {
            throw new RuntimeException("예금 계좌 생성 실패");
        }

        // 7. 최초 거래내역 생성
        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(account.getId());
        transaction.setTransactionType("DEPOSIT");
        transaction.setTransactionAmount(account.getBalance());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setTransactionDescription("초기 입금");
        transaction.setBalance(account.getBalance());

        depositDAO.createDepositTransaction(transaction);

        return account.getAccountNumber(); // 생성된 계좌번호 반환
    }






 // 적금 계좌 생성
    @Transactional
    public String createSavingsAccount(DepositDTO account) {
        String accountNumber = generateUniqueAccountNumber();
        account.setAccountNumber(accountNumber);

        if (depositDAO.withdrawFromAccount(account.getWithdrawalAccountNumber(), account.getMonthlyAmount()) != 1) {
            throw new RuntimeException("출금 계좌 잔액 차감 실패");
            
            
        }
        
        if (depositDAO.checkAccountNumber(accountNumber) > 0) {
            throw new RuntimeException("이미 존재하는 계좌번호입니다.");
        }
        
        account.setAccountStatus("ACTIVE");
        
        if (depositDAO.createSavingsAccount(account) != 1) {
            throw new RuntimeException("적금 계좌 생성에 실패했습니다.");
        }
       
        
        

        // 최초 거래내역 생성
        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(account.getId());
        transaction.setTransactionType("DEPOSIT");
        transaction.setTransactionAmount(account.getMonthlyAmount());
        transaction.setBalance(account.getMonthlyAmount());
        transaction.setTransactionDescription("적금 계좌 개설");

        depositDAO.createSavingsTransaction(transaction);

        return accountNumber; // 🔥 생성한 계좌번호 리턴
    }



 // 예금 해지
    @Transactional
    public void closeDepositAccount(String accountId, String accountPassword) {
        String customerId = depositDAO.getCustomerIdFromDepositAccount(accountId);
        System.out.println("넘어온 accountId = " + accountId);

        BigDecimal balance = depositDAO.getDepositBalanceByAccountNumber(accountId); // O

        if (balance == null) {
            throw new RuntimeException("계좌를 찾을 수 없습니다.");
        }

        if (balance.compareTo(BigDecimal.ZERO) > 0) {
            depositDAO.transferBalanceToMainAccount(customerId, balance);
        }

        if (depositDAO.closeDepositAccount(accountId, accountPassword) != 1) {
            throw new RuntimeException("예금 계좌 삭제에 실패했습니다.");
        }

        accountService.updateAccountStatusToClosed(accountId);
    }

    // 적금 해지
    @Transactional
    public void closeSavingsAccount(String accountId, String accountPassword) {
        String customerId = depositDAO.getCustomerIdFromSavingsAccount(accountId);

        BigDecimal balance = depositDAO.getDepositBalanceByAccountNumber(accountId); // O

        if (balance == null) {
            throw new RuntimeException("계좌를 찾을 수 없습니다.");
        }

        if (balance.compareTo(BigDecimal.ZERO) > 0) {
            depositDAO.transferBalanceToMainAccount(customerId, balance);
        }

        if (depositDAO.closeSavingsAccount(accountId, accountPassword) != 1) {
            throw new RuntimeException("적금 계좌 삭제에 실패했습니다.");
        }

        accountService.updateAccountStatusToClosed(accountId);
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
        BigDecimal updatedBalance = depositDAO.getDepositAccountBalance(String.valueOf(accountId));

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
        BigDecimal updatedBalance = depositDAO.getDepositAccountBalance(String.valueOf(accountId));

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

        BigDecimal updatedBalance = depositDAO.getDepositAccountBalance(String.valueOf(accountId));

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

        BigDecimal updatedBalance = depositDAO.getDepositAccountBalance(String.valueOf(accountId));

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

 // 계좌 번호로 예적금 잔액 조회
    public BigDecimal getBalance(String accountNumber, String type) {
        if ("DEPOSIT".equals(type)) {
            return depositDAO.getDepositAccountBalanceByAccountNumber(accountNumber);
        } else if ("SAVINGS".equals(type)) {
            return depositDAO.getSavingsAccountBalanceByAccountNumber(accountNumber);
        } else {
            throw new IllegalArgumentException("알 수 없는 계좌 타입입니다: " + type);
        }
    }


  

    
} 