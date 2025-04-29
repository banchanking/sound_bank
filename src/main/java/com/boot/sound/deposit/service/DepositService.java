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

    // ===== 상품 관련 =====
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

    // ===== 계좌 관련 =====
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

    // ===== 계좌 생성/해지 =====
    @Transactional
    public String createDepositAccount(DepositDTO account) {
        account.setAccountNumber(generateUniqueAccountNumber());
        DepositDTO product = depositDAO.getDepositProductDetail(account.getProductId());
        if (product == null) throw new RuntimeException("상품 정보를 찾을 수 없습니다.");
        account.setInterestRate(product.getInterestRate());
        account.setAccountStatus("ACTIVE");

        if (depositDAO.checkAccountNumber(account.getAccountNumber()) > 0) {
            throw new RuntimeException("이미 존재하는 계좌번호입니다.");
        }

        if (depositDAO.withdrawFromAccount(account.getWithdrawalAccountNumber(), account.getBalance()) != 1) {
            throw new RuntimeException("출금 계좌 잔액 차감 실패");
        }

        if (depositDAO.createDepositAccount(account) != 1) {
            throw new RuntimeException("예금 계좌 생성 실패");
        }

        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(account.getId());
        transaction.setTransactionType("DEPOSIT");
        transaction.setTransactionAmount(account.getBalance());
        transaction.setBalance(account.getBalance());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setTransactionDescription("초기 입금");

        depositDAO.createDepositTransaction(transaction);

        return account.getAccountNumber();
    }

    @Transactional
    public String createSavingsAccount(DepositDTO account) {
        account.setAccountNumber(generateUniqueAccountNumber());

        if (depositDAO.withdrawFromAccount(account.getWithdrawalAccountNumber(), account.getMonthlyAmount()) != 1) {
            throw new RuntimeException("출금 계좌 잔액 차감 실패");
        }
        if (depositDAO.checkAccountNumber(account.getAccountNumber()) > 0) {
            throw new RuntimeException("이미 존재하는 계좌번호입니다.");
        }
        account.setAccountStatus("ACTIVE");

        if (depositDAO.createSavingsAccount(account) != 1) {
            throw new RuntimeException("적금 계좌 생성 실패");
        }

        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(account.getId());
        transaction.setTransactionType("DEPOSIT");
        transaction.setTransactionAmount(account.getMonthlyAmount());
        transaction.setBalance(account.getMonthlyAmount());
        transaction.setTransactionDescription("적금 계좌 개설");

        depositDAO.createSavingsTransaction(transaction);

        return account.getAccountNumber();
    }
    
    // 예금 해지
    @Transactional
    public void closeDepositAccount(String accountNumber, String accountPassword) {
        String customerId = depositDAO.getCustomerIdFromDepositAccount(accountNumber);
        String mainAccountNumber = depositDAO.getMainAccountNumber(customerId);
        if (mainAccountNumber == null) throw new RuntimeException("기본 계좌를 찾을 수 없습니다.");

        BigDecimal balance = depositDAO.getDepositBalanceByAccountNumber(accountNumber);
        if (balance == null) throw new RuntimeException("계좌를 찾을 수 없습니다.");
        
        // 예금 이자 계산
        BigDecimal interest = calculateDepositInterest(accountNumber);  
        BigDecimal totalAmount = balance.add(interest);              

        if (balance.compareTo(BigDecimal.ZERO) > 0) {
            depositDAO.transferBalance(accountNumber, mainAccountNumber, balance);
        }

        if (depositDAO.closeDepositAccount(accountNumber, accountPassword) != 1) {
            throw new RuntimeException("예금 계좌 해지 실패");
        }
    }
    
    // 적금 해지
    @Transactional
    public void closeSavingsAccount(String accountNumber, String accountPassword) {
        // 1. 적금 계좌 정보 가져오기
        DepositDTO account = depositDAO.getSavingsAccountByNumber(accountNumber);
        System.out.println("가져온 account: " + account);
        if (account == null) {
            throw new RuntimeException("적금 계좌 정보를 찾을 수 없습니다.");
        }

        String customerId = depositDAO.getCustomerIdFromSavingsAccount(accountNumber);
        String mainAccountNumber = depositDAO.getMainAccountNumber(customerId);
        if (mainAccountNumber == null) {
            throw new RuntimeException("기본 계좌를 찾을 수 없습니다.");
        }

        BigDecimal balance = depositDAO.getSavingsAccountBalanceByAccountNumber(accountNumber);
        if (balance == null) {
            throw new RuntimeException("적금 계좌 잔액을 찾을 수 없습니다.");
        }

        // 2. 적금 이자 계산 (🔥 수정된 버전 사용)
        BigDecimal interest = calculateSavingsInterest(account);

        // 3. 총액 = 잔액 + 이자
        BigDecimal totalAmount = balance.add(interest);

        // 4. 총액을 기본 계좌로 이체
        if (totalAmount.compareTo(BigDecimal.ZERO) > 0) {
            depositDAO.transferBalance(accountNumber, mainAccountNumber, totalAmount);
        }

        // 5. 계좌 해지
        if (depositDAO.closeSavingsAccount(accountNumber, accountPassword) != 1) {
            throw new RuntimeException("적금 계좌 해지 실패");
        }
    }

    //  예금 이자 계산 함수 
    public BigDecimal calculateDepositInterest(String accountNumber) {
        DepositDTO account = depositDAO.getDepositAccountByNumber(accountNumber);
        BigDecimal principal = account.getBalance();
        BigDecimal rate = account.getInterestRate();
        int months = account.getTermMonths();

        if (principal == null || rate == null || months == 0) {
            return BigDecimal.ZERO;
        }

        // 원금 * 연이율 * (기간/12)
        return principal.multiply(rate).multiply(BigDecimal.valueOf(months))
                .divide(BigDecimal.valueOf(1200), 2, RoundingMode.DOWN);
    }

    // 적금 이자 계산 함수 
    private BigDecimal calculateSavingsInterest(DepositDTO account) {
        BigDecimal monthlyAmount = account.getMonthlyAmount();
        BigDecimal interestRate = account.getInterestRate().divide(BigDecimal.valueOf(100), 5, RoundingMode.HALF_UP);
        int termMonths = account.getTermMonths(); // 🔥 적금 가입 기간

        // 총 납입액 기준 단리 이자 계산 (은행 적금 계산 방식)
        BigDecimal sum = monthlyAmount.multiply(BigDecimal.valueOf(termMonths + 1))
                                      .divide(BigDecimal.valueOf(2), 5, RoundingMode.HALF_UP);

        BigDecimal interest = sum.multiply(interestRate)
                                 .divide(BigDecimal.valueOf(12), 5, RoundingMode.HALF_UP);

        return interest.setScale(0, RoundingMode.DOWN);  // 🔥 소수점 절삭해서 원 단위로 반환
    }

    

    // ===== 입출금 관련 =====
    @Transactional
    public void deposit(int accountId, BigDecimal amount, String accountPassword) {
        DepositDTO account = depositDAO.getDepositAccountDetail(accountId);
        if (!account.getAccountPassword().equals(accountPassword)) {
            throw new IllegalArgumentException("비밀번호 불일치");
        }

        if (depositDAO.deposit(accountId, amount) != 1) {
            throw new RuntimeException("입금 실패");
        }

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

    @Transactional
    public void withdraw(int accountId, BigDecimal amount, String accountPassword) {
        DepositDTO account = depositDAO.getDepositAccountDetail(accountId);
        if (!account.getAccountPassword().equals(accountPassword)) {
            throw new IllegalArgumentException("비밀번호 불일치");
        }
        if (account.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("잔액 부족");
        }

        if (depositDAO.withdraw(accountId, amount) != 1) {
            throw new RuntimeException("출금 실패");
        }

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

    @Transactional
    public void depositSavings(int accountId, BigDecimal amount, String accountPassword) {
        DepositDTO account = depositDAO.getSavingsAccountDetail(accountId);
        if (!account.getAccountPassword().equals(accountPassword)) {
            throw new IllegalArgumentException("비밀번호 불일치");
        }

        if (depositDAO.depositSavings(accountId, amount) != 1) {
            throw new RuntimeException("적금 입금 실패");
        }

        BigDecimal updatedBalance = depositDAO.getDepositAccountBalance(accountId);
        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(accountId);
        transaction.setTransactionType("입금");
        transaction.setTransactionAmount(amount);
        transaction.setBalance(updatedBalance);
        transaction.setTransactionDescription("적금 입금 거래");
        transaction.setTransactionDate(LocalDateTime.now());

        depositDAO.createSavingsTransaction(transaction);
    }

    @Transactional
    public void withdrawSavings(int accountId, BigDecimal amount, String accountPassword) {
        DepositDTO account = depositDAO.getSavingsAccountDetail(accountId);
        if (!account.getAccountPassword().equals(accountPassword)) {
            throw new IllegalArgumentException("비밀번호 불일치");
        }
        if (account.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("잔액 부족");
        }

        if (depositDAO.withdrawSavings(accountId, amount) != 1) {
            throw new RuntimeException("적금 출금 실패");
        }

        BigDecimal updatedBalance = depositDAO.getDepositAccountBalance(accountId);
        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(accountId);
        transaction.setTransactionType("출금");
        transaction.setTransactionAmount(amount);
        transaction.setBalance(updatedBalance);
        transaction.setTransactionDescription("적금 출금 거래");
        transaction.setTransactionDate(LocalDateTime.now());

        depositDAO.createSavingsTransaction(transaction);
    }

    // ===== 자동이체 / 만기 / 이자 =====
    @Transactional
    public void setAutoTransfer(int accountId, boolean enabled, BigDecimal amount, int transferDay) {
        if (depositDAO.setAutoTransfer(accountId, enabled, amount, transferDay) != 1) {
            throw new RuntimeException("자동이체 설정 실패");
        }
    }

    @Transactional
    public void processAutoTransfers() {
        int today = LocalDate.now().getDayOfMonth();
        List<DepositDTO> autoTransfers = depositDAO.getAutoTransferList(today);

        for (DepositDTO transfer : autoTransfers) {
            try {
                depositDAO.autoWithdrawFromBasicAccount(transfer.getWithdrawAccountNumber(), transfer.getTransferAmount());
                depositDAO.depositToDepositAccount(transfer.getTargetAccountNumber(), transfer.getTransferAmount());
                depositDAO.createDepositTransaction(transfer);
            } catch (Exception e) {
                throw new RuntimeException("자동이체 실패: " + e.getMessage());
            }
        }
    }

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
                continue;
            }
        }
    }

    @Transactional
    public void payInterest() {
        LocalDate today = LocalDate.now();

        List<DepositDTO> depositAccounts = depositDAO.getInterestPaymentDepositAccounts(today);
        for (DepositDTO account : depositAccounts) {
            try {
                BigDecimal interestAmount = calculateInterest(account);
                depositDAO.payDepositInterest(account.getId(), interestAmount);
            } catch (Exception e) {
                continue;
            }
        }

        List<DepositDTO> savingsAccounts = depositDAO.getInterestPaymentSavingsAccounts(today);
        for (DepositDTO account : savingsAccounts) {
            try {
                BigDecimal interestAmount = calculateInterest(account);
                depositDAO.paySavingsInterest(account.getId(), interestAmount);
            } catch (Exception e) {
                continue;
            }
        }
    }

    // ===== 거래내역 관련 =====
    public List<DepositDTO> getDepositTransactions(int accountId, LocalDateTime startDate, LocalDateTime endDate) {
        return depositDAO.getDepositTransactions(accountId, startDate, endDate);
    }

    public List<DepositDTO> getSavingsTransactions(int accountId, LocalDateTime startDate, LocalDateTime endDate) {
        return depositDAO.getSavingsTransactions(accountId, startDate, endDate);
    }

    // ===== 비밀번호/별명 관리 =====
    @Transactional
    public void changeDepositAccountPassword(int accountId, String oldPassword, String newPassword) {
        if (depositDAO.changeDepositAccountPassword(accountId, oldPassword, newPassword) != 1) {
            throw new RuntimeException("비밀번호 변경 실패");
        }
    }

    @Transactional
    public void changeSavingsAccountPassword(int accountId, String oldPassword, String newPassword) {
        if (depositDAO.changeSavingsAccountPassword(accountId, oldPassword, newPassword) != 1) {
            throw new RuntimeException("비밀번호 변경 실패");
        }
    }

    @Transactional
    public void updateDepositAccountNickname(String accountId, String nickname) {
        if (depositDAO.updateNickname(accountId, nickname) != 1) {
            throw new RuntimeException("별명 변경 실패");
        }
    }

    @Transactional
    public void updateSavingsAccountNickname(String accountId, String nickname) {
        if (depositDAO.updateSavingsNickname(accountId, nickname) != 1) {
            throw new RuntimeException("별명 변경 실패");
        }
    }

    // ===== 기타 유틸 =====
    // 예금 잔액 조회
    public BigDecimal getDepositAccountBalanceByAccountNumber(String accountNumber) {
        return depositDAO.getDepositAccountBalanceByAccountNumber(accountNumber);
    }

    // 적금 잔액 조회 
    public BigDecimal getSavingsAccountBalanceByAccountNumber(String accountNumber) {
        return depositDAO.getSavingsAccountBalanceByAccountNumber(accountNumber);
    }

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

    private String generateAccountNumber() {
        String prefix = "174";
        String middle = String.format("%06d", (int)(Math.random() * 1_000_000));
        String suffix = String.format("%04d", (int)(Math.random() * 10_000));
        return prefix + middle + suffix;
    }

    public String generateUniqueAccountNumber() {
        String accountNumber;
        do {
            accountNumber = generateAccountNumber();
        } while (depositDAO.checkAccountNumber(accountNumber) > 0);
        return accountNumber;
    }
    
    
    // 예금상품 추가
    @Transactional
    public void addDepositProduct(DepositDTO product) {
        if (depositDAO.addDepositProduct(product) != 1) {
            throw new RuntimeException("예금 상품 추가에 실패했습니다.");
        }
    }
    
    // 적금상품 추가
    @Transactional
    public void addSavingsProduct(DepositDTO product) {
        if (depositDAO.addSavingsProduct(product) != 1) {
            throw new RuntimeException("적금 상품 추가에 실패했습니다.");
        }
    }
    
    // 예금상품 수정
    @Transactional
    public void updateDepositProduct(int productId, DepositDTO product) {
        if (depositDAO.updateDepositProduct(productId, product) != 1) {
            throw new RuntimeException("예금 상품 수정에 실패했습니다.");
        }
    }
    
    // 적금상품 수정
    @Transactional
    public void updateSavingsProduct(int productId, DepositDTO product) {
        if (depositDAO.updateSavingsProduct(productId, product) != 1) {
            throw new RuntimeException("적금 상품 수정에 실패했습니다.");
        }
    }
    
    // 예금상품 삭제
    @Transactional
    public void deleteDepositProduct(String productId) {
        if (depositDAO.deleteDepositProduct(productId) != 1) {
            throw new RuntimeException("예금 상품 삭제에 실패했습니다.");
        }
    }

    // 적금상삭제
    @Transactional
    public void deleteSavingsProduct(String productId) {
        if (depositDAO.deleteSavingsProduct(productId) != 1) {
            throw new RuntimeException("적금 상품 삭제에 실패했습니다.");
        }
    }



    
   


}
