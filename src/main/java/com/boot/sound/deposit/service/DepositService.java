package com.boot.sound.deposit.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.sound.deposit.dao.DepositDAO;
import com.boot.sound.deposit.dto.DepositDTO;
import com.boot.sound.deposit.dto.DepositTransactionDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DepositService {

    private final DepositDAO depositDAO;
    private final PasswordEncoder passwordEncoder;

    // ========== 예금 상품 관련 ==========

    /**
     * [GET] /api/deposit/products/deposit
     * 예금 상품 목록 조회
     */
    public List<DepositDTO> getDepositProducts() {
        return depositDAO.getDepositProducts();
    }

    /**
     * [GET] /api/deposit/products/deposit/{productId}
     * 예금 상품 상세 조회
     */
    public DepositDTO getDepositProductDetail(int productId) {
        return depositDAO.getDepositProductDetail(productId);
    }

    /**
     * [POST] /api/deposit/products/deposit
     * 예금 상품 추가
     */
    @Transactional
    public void addDepositProduct(DepositDTO product) {
        if (depositDAO.addDepositProduct(product) != 1) {
            throw new RuntimeException("예금 상품 추가에 실패했습니다.");
        }
    }

    /**
     * [PUT] /api/deposit/products/deposit/{productId}
     * 예금 상품 수정
     */
    @Transactional
    public void updateDepositProduct(int productId, DepositDTO product) {
        if (depositDAO.updateDepositProduct(productId, product) != 1) {
            throw new RuntimeException("예금 상품 수정에 실패했습니다.");
        }
    }

    /**
     * [DELETE] /api/deposit/products/deposit/{productId}
     * 예금 상품 삭제
     */
    @Transactional
    public void deleteDepositProduct(String productId) {
        if (depositDAO.deleteDepositProduct(productId) != 1) {
            throw new RuntimeException("예금 상품 삭제에 실패했습니다.");
        }
    }

    // ========== 적금 상품 관련 ==========

    /**
     * [GET] /api/deposit/products/savings
     * 적금 상품 목록 조회
     */
    public List<DepositDTO> getSavingsProducts() {
        return depositDAO.getSavingsProducts();
    }

    /**
     * [GET] /api/deposit/products/savings/{productId}
     * 적금 상품 상세 조회
     */
    public DepositDTO getSavingsProductDetail(int productId) {
        return depositDAO.getSavingsProductDetail(productId);
    }

    /**
     * [POST] /api/deposit/products/savings
     * 적금 상품 추가
     */
    @Transactional
    public void addSavingsProduct(DepositDTO product) {
        if (depositDAO.addSavingsProduct(product) != 1) {
            throw new RuntimeException("적금 상품 추가에 실패했습니다.");
        }
    }

    /**
     * [PUT] /api/deposit/products/savings/{productId}
     * 적금 상품 수정
     */
    @Transactional
    public void updateSavingsProduct(int productId, DepositDTO product) {
        if (depositDAO.updateSavingsProduct(productId, product) != 1) {
            throw new RuntimeException("적금 상품 수정에 실패했습니다.");
        }
    }

    /**
     * [DELETE] /api/deposit/products/savings/{productId}
     * 적금 상품 삭제
     */
    @Transactional
    public void deleteSavingsProduct(String productId) {
        if (depositDAO.deleteSavingsProduct(productId) != 1) {
            throw new RuntimeException("적금 상품 삭제에 실패했습니다.");
        }
    }

    // ========== 예금/적금 계좌 관련 ==========

    /**
     * [GET] /api/deposit/accounts/deposit?customerId=...
     * 고객의 예금 계좌 목록 조회
     */
    public List<DepositDTO> getDepositAccounts(String customerId) {
        return depositDAO.getDepositAccounts(customerId);
    }

    /**
     * [GET] /api/deposit/accounts/savings/{customerId}
     * 고객의 적금 계좌 목록 조회
     */
    public List<DepositDTO> getSavingsAccounts(String customerId) {
        return depositDAO.getSavingsAccounts(customerId);
    }
    
    // 기본계좌 잔액조회
    public BigDecimal getBasicAccountBalance(String accountNumber) {
        return depositDAO.getBasicAccountBalanceByAccountNumber(accountNumber);
    }


    

    /**
     * [POST] /api/deposit/accounts/deposit
     * 예금 계좌 생성
     */
    @Transactional
    public String createDepositAccount(DepositDTO account) {
        account.setAccountNumber(generateUniqueAccountNumber());
        
        account.setAccountPassword(passwordEncoder.encode(account.getAccountPassword()));
        DepositDTO product = depositDAO.getDepositProductDetail(account.getProductId());
        if (product == null) throw new RuntimeException("상품 정보를 찾을 수 없습니다.");
        account.setInterestRate(product.getInterestRate());
        account.setAccountStatus("ACTIVE");

        if (depositDAO.checkAccountNumber(account.getAccountNumber()) > 0) {
            throw new RuntimeException("이미 존재하는 계좌번호입니다.");
        }
        System.out.println("✅ 출금 계좌번호: " + account.getWithdrawalAccountNumber());
        System.out.println("✅ 출금할 금액: " + account.getBalance());
        String cleanAccountNumber = account.getWithdrawalAccountNumber().replaceAll("-", "");

	     // 기본 계좌에서 출금
        if (depositDAO.withdrawFromBasicAccount(account.getWithdrawalAccountNumber(), account.getBalance(), account.getCustomerId()) != 1) {
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

    /**
     * [POST] /api/deposit/accounts/savings
     * 적금 계좌 생성
     */
    @Transactional
    public String createSavingsAccount(DepositDTO account) {
        account.setAccountNumber(generateUniqueAccountNumber());

        account.setAccountPassword(passwordEncoder.encode(account.getAccountPassword()));
        // 출금 계좌에서 금액 차감
        if (depositDAO.withdrawFromBasicAccount(account.getWithdrawalAccountNumber(), account.getMonthlyAmount(), account.getCustomerId()) != 1) {
            throw new RuntimeException("출금 계좌 잔액 차감 실패");
        }

        // 계좌번호 중복 체크
        if (depositDAO.checkAccountNumber(account.getAccountNumber()) > 0) {
            throw new RuntimeException("이미 존재하는 계좌번호입니다.");
        }

        account.setAccountStatus("ACTIVE");

        // 적금 계좌 생성 (account.id 자동 설정됨)
        if (depositDAO.createSavingsAccount(account) != 1) {
            throw new RuntimeException("적금 계좌 생성 실패");
        }
        
        // 적금 계좌 생성시 금액 입금
        if (depositDAO.updateSavingsBalance(account.getAccountNumber(), account.getMonthlyAmount()) != 1) {
            throw new RuntimeException("적금 계좌 잔액 갱신 실패");
        }

        // 적금 거래내역 등록
        DepositDTO transaction = new DepositDTO();
        transaction.setSatId(account.getSatId()); // ✅ 여기 중요!
        transaction.setTransactionType("SAVINGS");
        transaction.setTransactionAmount(account.getMonthlyAmount());
        transaction.setBalance(account.getMonthlyAmount());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setTransactionDescription("적금 계좌 개설");

        depositDAO.createSavingsTransaction(transaction);

        return account.getAccountNumber();
    }


    // ========== 유틸리티 메서드 ==========

    /**
     * 고유한 계좌 번호 생성
     */
    private String generateUniqueAccountNumber() {
        String accountNumber;
        do {
            accountNumber = generateRandomAccountNumber();
        } while (depositDAO.checkAccountNumber(accountNumber) > 0);
        return accountNumber;
    }

    private String generateRandomAccountNumber() {
        return String.format("%03d-%06d-%04d",
            (int)(Math.random() * 900 + 100),
            (int)(Math.random() * 1000000),
            (int)(Math.random() * 10000)
        );
    }

    
    // 예금 입금
    @Transactional
    public void deposit(int accountId, BigDecimal amount, String password, String withdrawalAccountNumber) {
        DepositDTO account = depositDAO.getDepositAccountDetail(accountId);
        if (!passwordEncoder.matches(password, account.getAccountPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        amount = amount.setScale(2, RoundingMode.DOWN);

        if (withdrawalAccountNumber != null && !withdrawalAccountNumber.contains("-")) {
            withdrawalAccountNumber = withdrawalAccountNumber.replaceAll("(\\d{3})(\\d{6})(\\d{4})", "$1-$2-$3");
        }

        int result = depositDAO.withdrawFromBasicAccount(withdrawalAccountNumber, amount, account.getCustomerId());
        if (result == 0) {
            throw new RuntimeException("기본 계좌 잔액이 부족합니다.");
        }
        DepositDTO basicTx = new DepositDTO();
        basicTx.setAccountNumber(withdrawalAccountNumber);
        basicTx.setTransactionType("입금");
        basicTx.setTransactionAmount(amount);
        basicTx.setTransactionDate(LocalDateTime.now());
        basicTx.setTransactionDescription("예금 계좌로 이체된 출금");
        basicTx.setCustomerId(account.getCustomerId());
        basicTx.setAccountType("BASIC");
        depositDAO.insertBasicTransaction(basicTx);
  

        BigDecimal newBalance = account.getBalance().add(amount);
        depositDAO.updateDepositBalance(account.getAccountNumber(), newBalance);

        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(accountId);
        transaction.setTransactionType("DEPOSIT");
        transaction.setTransactionAmount(amount);
        transaction.setBalance(newBalance);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setTransactionDescription("기본 계좌에서 이체된 입금");

        depositDAO.createDepositTransaction(transaction);
        
        
    }

    // 예금 출금
    @Transactional
    public void withdraw(int accountId, BigDecimal amount, String password, String withdrawalAccountNumber) {
        DepositDTO account = depositDAO.getDepositAccountDetail(accountId);
        if (!passwordEncoder.matches(password, account.getAccountPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        amount = amount.setScale(2, RoundingMode.DOWN);

        if (withdrawalAccountNumber != null && !withdrawalAccountNumber.contains("-")) {
            withdrawalAccountNumber = withdrawalAccountNumber.replaceAll("(\\d{3})(\\d{6})(\\d{4})", "$1-$2-$3");
        }

        int rows = depositDAO.depositToBasicAccount(withdrawalAccountNumber, amount, account.getCustomerId());
        if (rows == 0) {
            throw new RuntimeException("기본 계좌 입금 실패");
        }

        // ✅ 기본 계좌 거래내역 추가
        DepositDTO basicTx = new DepositDTO();
        basicTx.setAccountNumber(withdrawalAccountNumber);
        basicTx.setTransactionType("출금");
        basicTx.setTransactionAmount(amount);
        basicTx.setTransactionDate(LocalDateTime.now());
        basicTx.setTransactionDescription("예금 계좌에서 이체된 입금");
        basicTx.setCustomerId(account.getCustomerId());
        basicTx.setAccountType("BASIC");
        depositDAO.insertBasicTransaction(basicTx);


        BigDecimal newBalance = account.getBalance().subtract(amount);
        depositDAO.updateDepositBalance(account.getAccountNumber(), newBalance);


        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(accountId);
        transaction.setTransactionType("WITHDRAW");
        transaction.setTransactionAmount(amount);
        transaction.setBalance(newBalance);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setTransactionDescription("기본 계좌로 이체된 출금");

        depositDAO.createDepositTransaction(transaction);
    }

    // 적금 입금
    @Transactional
    public void depositSavings(int accountId, BigDecimal amount, String password, String withdrawalAccountNumber) {
        DepositDTO account = depositDAO.getSavingsAccountDetail(accountId);

        amount = amount.setScale(2, RoundingMode.DOWN);

        if (!passwordEncoder.matches(password, account.getAccountPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        if (withdrawalAccountNumber != null && !withdrawalAccountNumber.contains("-")) {
            withdrawalAccountNumber = withdrawalAccountNumber.replaceAll("(\\d{3})(\\d{6})(\\d{4})", "$1-$2-$3");
        }

        int result = depositDAO.withdrawFromBasicAccount(withdrawalAccountNumber, amount, account.getCustomerId());
        if (result == 0) {
            throw new RuntimeException("기본 계좌 잔액이 부족합니다.");
        }

        // ✅ 기본 계좌 거래내역 추가
        DepositDTO basicTx = new DepositDTO();
        basicTx.setAccountNumber(withdrawalAccountNumber);
        basicTx.setTransactionType("입금");
        basicTx.setTransactionAmount(amount);
        basicTx.setTransactionDate(LocalDateTime.now());
        basicTx.setTransactionDescription("적금 계좌로 이체된 출금");
        basicTx.setCustomerId(account.getCustomerId());
        basicTx.setAccountType("BASIC");
        depositDAO.insertBasicTransaction(basicTx);


        BigDecimal newBalance = account.getBalance().add(amount);
        depositDAO.updateSavingsBalance(account.getAccountNumber(), newBalance);

        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(accountId);
        transaction.setSatId(account.getId());
        transaction.setTransactionType("DEPOSIT");
        transaction.setTransactionAmount(amount);
        transaction.setBalance(newBalance);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setTransactionDescription("기본 계좌에서 이체된 적금 입금");

        depositDAO.createSavingsTransaction(transaction);
    }

    // 적금 출금
    @Transactional
    public void withdrawSavings(int accountId, BigDecimal amount, String password, String withdrawalAccountNumber) {
        DepositDTO account = depositDAO.getSavingsAccountDetail(accountId);

        if (!passwordEncoder.matches(password, account.getAccountPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        if (withdrawalAccountNumber != null && !withdrawalAccountNumber.contains("-")) {
            withdrawalAccountNumber = withdrawalAccountNumber.replaceAll("(\\d{3})(\\d{6})(\\d{4})", "$1-$2-$3");
        }
        
        int rows = depositDAO.depositToBasicAccount(withdrawalAccountNumber, amount, account.getCustomerId());
        if (rows == 0) {
            throw new RuntimeException("기본 계좌 입금 실패");
        }

        DepositDTO basicTx = new DepositDTO();
        basicTx.setAccountNumber(withdrawalAccountNumber);
        basicTx.setTransactionType("출금");
        basicTx.setTransactionAmount(amount);
        basicTx.setTransactionDate(LocalDateTime.now());
        basicTx.setTransactionDescription("적금 계좌에서 이체된 입금");
        basicTx.setCustomerId(account.getCustomerId());
        basicTx.setAccountType("BASIC");
        depositDAO.insertBasicTransaction(basicTx);

        BigDecimal newBalance = account.getBalance().subtract(amount);
        depositDAO.updateSavingsBalance(account.getAccountNumber(), newBalance);


        DepositDTO transaction = new DepositDTO();
        transaction.setAccountId(accountId);
        transaction.setSatId(account.getId());
        transaction.setTransactionType("WITHDRAW");
        transaction.setTransactionAmount(amount);
        transaction.setBalance(newBalance);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setTransactionDescription("적금 출금 - 기본 계좌로 이체됨");

        depositDAO.createSavingsTransaction(transaction);
    }



    // 예금 해지
//    @Transactional
//    public void closeDepositAccount(String accountNumber, String password, BigDecimal totalAmount) {
//        int result = depositDAO.closeDepositAccount(accountNumber, password);
//        if (result != 1) throw new RuntimeException("계좌 해지 실패");
//
//        //  기본 계좌 조회
//        String basicAccount = depositDAO.findBasicAccountNumberByCustomer(accountNumber);
//        if (basicAccount == null) throw new RuntimeException("기본 계좌가 존재하지 않습니다");
//
//        //  기본 계좌에 입금
//        depositDAO.depositToBasicAccount(basicAccount, totalAmount);
//
//        //  거래내역 저장
//        DepositTransactionDTO transaction = new DepositTransactionDTO();
//        transaction.setAccountNumber(basicAccount);
//        transaction.setTransactionAmount(totalAmount);
//        transaction.setTransactionType("DEPOSIT");
//        transaction.setTransactionDescription("예금 해지 금액 입금");
//        transaction.setTransactionDate(LocalDateTime.now());
//
//        depositDAO.insertBasicTransaction(transaction);
//    }


    // 적금 해지
//    @Transactional
//    public void closeSavingsAccount(String accountNumber, String password, BigDecimal totalAmount) {
//        int result = depositDAO.closeSavingsAccount(accountNumber, password);
//        if (result != 1) {
//            throw new RuntimeException("계좌 해지 실패. 비밀번호 확인 또는 이미 해지된 계좌일 수 있습니다.");
//        }
//        
//        //  기본 계좌 조회
//        String basicAccount = depositDAO.findBasicAccountNumberByCustomer(accountNumber);
//        if (basicAccount == null) throw new RuntimeException("기본 계좌가 존재하지 않습니다");
//
//        //  기본 계좌에 입금
//        depositDAO.depositToBasicAccount(basicAccount, totalAmount);
//
//        //  거래내역 저장
//        DepositTransactionDTO transaction = new DepositTransactionDTO();
//        transaction.setAccountNumber(basicAccount);
//        transaction.setTransactionAmount(totalAmount);
//        transaction.setTransactionType("DEPOSIT");
//        transaction.setTransactionDescription("예금 해지 금액 입금");
//        transaction.setTransactionDate(LocalDateTime.now());
//
//        depositDAO.insertBasicTransaction(transaction);
//    }

    // 예금거래내역 조회
    public List<DepositDTO> getDepositTransactions(int accountId, LocalDateTime start, LocalDateTime end) {
        return depositDAO.getDepositTransactions(accountId, start, end);
    }

    // 적금거래내역 조회
    public List<DepositDTO> getSavingsTransactions(int accountId, LocalDateTime start, LocalDateTime end) {
        return depositDAO.getSavingsTransactions(accountId, start, end);
    }
    
    // 예금 계좌 상세 조회
    public DepositDTO getDepositAccountDetail(int accountId) {
        return depositDAO.getDepositAccountDetail(accountId);
    }

    // 적금 계좌 상세 조회
    public DepositDTO getSavingsAccountDetail(int accountId) {
        return depositDAO.getSavingsAccountDetail(accountId);
    }

    // 예금 계좌 비밀번호 변경
    @Transactional
    public void changeDepositAccountPassword(int accountId, String oldPassword, String newPassword) {
        DepositDTO account = depositDAO.getDepositAccountDetail(accountId);
        if (!passwordEncoder.matches(oldPassword, account.getAccountPassword())) {
            throw new RuntimeException("기존 비밀번호가 일치하지 않습니다.");
        }
        String encodedNewPassword = passwordEncoder.encode(newPassword);
        int result = depositDAO.changeDepositAccountPassword(accountId, account.getAccountPassword(), encodedNewPassword);
        if (result != 1) throw new RuntimeException("비밀번호 변경 실패");
    }

    // 적금 계좌 비밀번호 변경
    @Transactional
    public void changeSavingsAccountPassword(int accountId, String oldPassword, String newPassword) {
        DepositDTO account = depositDAO.getSavingsAccountDetail(accountId);
        if (!passwordEncoder.matches(oldPassword, account.getAccountPassword())) {
            throw new RuntimeException("기존 비밀번호가 일치하지 않습니다.");
        }
        String encodedNewPassword = passwordEncoder.encode(newPassword);
        int result = depositDAO.changeSavingsAccountPassword(accountId, account.getAccountPassword(), encodedNewPassword);
        if (result != 1) throw new RuntimeException("비밀번호 변경 실패");
    }


    // 예금 계좌 별명 변경
    @Transactional
    public void updateDepositAccountNickname(String accountId, String nickname) {
        int result = depositDAO.updateDepositAccountNickname(accountId, nickname);
        if (result != 1) throw new RuntimeException("예금 별명 변경 실패");
    }

    // 적금 계좌 별명 변경
    @Transactional
    public void updateSavingsAccountNickname(String accountId, String nickname) {
        int result = depositDAO.updateSavingsAccountNickname(accountId, nickname);
        if (result != 1) throw new RuntimeException("적금 별명 변경 실패");
    }

    
    /** (2) 계좌번호로 잔액 조회 */
    public BigDecimal getDepositAccountBalanceByAccountNumber(String accountNumber) {
        return depositDAO.getDepositAccountBalanceByAccountNumber(accountNumber);
    }
    public BigDecimal getSavingsAccountBalanceByAccountNumber(String accountNumber) {
        return depositDAO.getSavingsAccountBalanceByAccountNumber(accountNumber);
    }
    
    // 기본 계좌번호 조회
    public String getBasicAccountNumberByCustomerId(String customerId) {
        return depositDAO.getBasicAccountNumber(customerId);
    }


}