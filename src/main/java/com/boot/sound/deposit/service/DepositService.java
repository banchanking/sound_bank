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
        if (depositDAO.checkAccountNumber(account.getAccountNumber()) > 0) {
            throw new RuntimeException("이미 존재하는 계좌번호입니다.");
        }
        if (depositDAO.createDepositAccount(account) != 1) {
            throw new RuntimeException("예금 계좌 생성에 실패했습니다.");
        }
    }

    @Transactional
    public void createSavingsAccount(DepositDTO account) {
        if (depositDAO.checkAccountNumber(account.getAccountNumber()) > 0) {
            throw new RuntimeException("이미 존재하는 계좌번호입니다.");
        }
        if (depositDAO.createSavingsAccount(account) != 1) {
            throw new RuntimeException("적금 계좌 생성에 실패했습니다.");
        }
    }

    @Transactional
    public void closeDepositAccount(int accountId, String accountPassword) {
        BigDecimal balance = depositDAO.getDepositAccountBalance(accountId);
        if (balance.compareTo(BigDecimal.ZERO) > 0) {
            throw new RuntimeException("잔액이 남아있어 계좌를 해지할 수 없습니다.");
        }
        if (depositDAO.closeDepositAccount(accountId, accountPassword) != 1) {
            throw new RuntimeException("예금 계좌 해지에 실패했습니다.");
        }
    }

    @Transactional
    public void closeSavingsAccount(int accountId, String accountPassword) {
        BigDecimal balance = depositDAO.getSavingsAccountBalance(accountId);
        if (balance.compareTo(BigDecimal.ZERO) > 0) {
            throw new RuntimeException("잔액이 남아있어 계좌를 해지할 수 없습니다.");
        }
        if (depositDAO.closeSavingsAccount(accountId, accountPassword) != 1) {
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

    // 입출금 처리
    @Transactional
    public void deposit(int accountId, BigDecimal transactionAmount) {
        if (depositDAO.deposit(accountId, transactionAmount) != 1) {
            throw new RuntimeException("입금 처리에 실패했습니다.");
        }
        
        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(accountId);
        transaction.setTransactionType("DEPOSIT");
        transaction.setTransactionAmount(transactionAmount);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setTransactionDescription("입금");
        
        depositDAO.createDepositTransaction(transaction);
    }

    @Transactional
    public void withdraw(int accountId, BigDecimal transactionAmount) {
        BigDecimal balance = depositDAO.getDepositAccountBalance(accountId);
        if (balance.compareTo(transactionAmount) < 0) {
            throw new RuntimeException("잔액이 부족합니다.");
        }
        
        if (depositDAO.withdraw(accountId, transactionAmount) != 1) {
            throw new RuntimeException("출금 처리에 실패했습니다.");
        }
        
        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(accountId);
        transaction.setTransactionType("WITHDRAW");
        transaction.setTransactionAmount(transactionAmount);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setTransactionDescription("출금");
        
        depositDAO.createDepositTransaction(transaction);
    }

    @Transactional
    public void depositSavings(int accountId, BigDecimal transactionAmount) {
        if (depositDAO.depositSavings(accountId, transactionAmount) != 1) {
            throw new RuntimeException("적금 입금 처리에 실패했습니다.");
        }
        
        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(accountId);
        transaction.setTransactionType("DEPOSIT");
        transaction.setTransactionAmount(transactionAmount);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setTransactionDescription("적금 입금");
        
        depositDAO.createSavingsTransaction(transaction);
    }

    @Transactional
    public void withdrawSavings(int accountId, BigDecimal transactionAmount) {
        BigDecimal balance = depositDAO.getSavingsAccountBalance(accountId);
        if (balance.compareTo(transactionAmount) < 0) {
            throw new RuntimeException("잔액이 부족합니다.");
        }
        
        if (depositDAO.withdrawSavings(accountId, transactionAmount) != 1) {
            throw new RuntimeException("적금 출금 처리에 실패했습니다.");
        }
        
        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(accountId);
        transaction.setTransactionType("WITHDRAW");
        transaction.setTransactionAmount(transactionAmount);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setTransactionDescription("적금 출금");
        
        depositDAO.createSavingsTransaction(transaction);
    }

    // 거래 내역 조회
    public List<DepositDTO> getDepositTransactions(int accountId, LocalDateTime startDate, LocalDateTime endDate) {
        return depositDAO.getDepositTransactions(accountId, startDate, endDate);
    }

    public List<DepositDTO> getSavingsTransactions(int accountId, LocalDateTime startDate, LocalDateTime endDate) {
        return depositDAO.getSavingsTransactions(accountId, startDate, endDate);
    }

    // 비밀번호 변경
    @Transactional
    public void changeDepositAccountPassword(int accountId, String oldPassword, String newPassword) {
        if (depositDAO.changeDepositAccountPassword(accountId, oldPassword, newPassword) != 1) {
            throw new RuntimeException("예금 계좌 비밀번호 변경에 실패했습니다.");
        }
    }

    @Transactional
    public void changeSavingsAccountPassword(int accountId, String oldPassword, String newPassword) {
        if (depositDAO.changeSavingsAccountPassword(accountId, oldPassword, newPassword) != 1) {
            throw new RuntimeException("적금 계좌 비밀번호 변경에 실패했습니다.");
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

    // 적금 상품 추가
    @Transactional
    public void addSavingsProduct(DepositDTO product) {
        if (depositDAO.addSavingsProduct(product) != 1) {
            throw new RuntimeException("적금 상품 추가에 실패했습니다.");
        }
    }

    @Transactional
    public void updateDepositProduct(int productId, DepositDTO product) {
        if (depositDAO.updateDepositProduct(productId, product) != 1) {
            throw new RuntimeException("예금 상품 수정에 실패했습니다.");
        }
    }

    @Transactional
    public void deleteDepositProduct(int productId) {
        if (depositDAO.deleteDepositProduct(productId) != 1) {
            throw new RuntimeException("예금 상품 삭제에 실패했습니다.");
        }
    }
} 