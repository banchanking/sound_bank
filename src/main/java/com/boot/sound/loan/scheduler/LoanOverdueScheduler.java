package com.boot.sound.loan.scheduler;

import com.boot.sound.inquire.account.AccountService;
import com.boot.sound.loan.dto.LoanInterestPaymentDTO;
import com.boot.sound.loan.dto.LoanLatePaymentDTO;
import com.boot.sound.loan.service.LoanAccountService;
import com.boot.sound.loan.service.LoanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class LoanOverdueScheduler {

    private final LoanService loanService;
    private final LoanAccountService loanAccountService;
    private final AccountService accountService;
    

//    // 미납된 내역 자동납부
//    @Scheduled(cron = "0 36 18 * * ?")
//    public void processMissedRepayments() {
//        log.info("⏰ [미납 자동납부 스케줄러] 미납 납부 시도 시작");
//
//        try {
//            List<LoanInterestPaymentDTO> missedList = loanService.getMissedPaymentsToRetry();
//
//            for (LoanInterestPaymentDTO missed : missedList) {
//                try {
//                    int amount = missed.getRepaymentAmount();
//                    String accountNumber = loanService.getAccountNumberByLoanId(missed.getLoanId(), missed.getCustomerId());
//
//                    accountService.withdraw(accountNumber, BigDecimal.valueOf(amount));
//
//                    String customerName = loanService.getCustomerName(missed.getCustomerId());
//                    loanAccountService.saveLoanTransaction(
//                            accountNumber, "출금", BigDecimal.valueOf(amount), "KRW", "미납 자동납부", customerName, "입출금"
//                    );
//
//                    // 상태 변경
//                    loanService.markInterestPaymentAsPaid(missed.getInterestPaymentNo());
//                    loanService.reduceLoanRemainingTerm(missed.getLoanId());
//                    
//
//                    log.info("✅ [미납 납부완료] 고객: {}, 금액: {}", missed.getCustomerId(), amount);
//                } catch (Exception e) {
//                    log.warn("❌ [미납 납부실패] 고객: {}, 사유: {}", missed.getCustomerId(), e.getMessage());
//                }
//            }
//
//            log.info("🎯 [미납 납부 스케줄러] 전체 처리 완료");
//
//        } catch (Exception e) {
//            log.error("❌ [미납 납부 스케줄러] 실행 오류: {}", e.getMessage());
//        }
//    } 
//    
//    
//    // 미납 내역 5일 경과후 연체로 상태 변경
//    @Scheduled(cron = "0 33 18 * * ?")
//    public void processOverdueInterestPayments() {
//        log.info("⏰ [연체 스케줄러] 미납 내역 연체 처리 시작");
//        try {
//            loanService.processOverduePayments();
//            log.info("✅ [연체 스케줄러] 연체 처리 완료");
//        } catch (Exception e) {
//            log.error("❌ [연체 스케줄러] 연체 처리 중 오류 발생: {}", e.getMessage());
//        }
//    }
//    
//    // 연체된 내역 자동납부
//    @Scheduled(cron = "0 36 18 * * ?") // 매일 새벽 2시 실행
//    public void processLateRepayments() {
//        log.info("⏰ [연체 납부 스케줄러] 연체 납부 시도 시작");
//
//        try {
//            List<LoanLatePaymentDTO> latePayments = loanService.getLatePayments();
//
//            for (LoanLatePaymentDTO latePayment : latePayments) {
//                try {
//                    int totalAmount = latePayment.getUnpaidAmount() + latePayment.getOverdueInterest();
//
//                    // 자동 출금 시도
//                    accountService.withdraw(
//                            loanService.getAccountNumberByLoanId(latePayment.getLoanId(),latePayment.getCustomerId()),
//                            BigDecimal.valueOf(totalAmount)
//                    );
//
//                    // 거래내역 기록
//                    String customerName = loanService.getCustomerName(latePayment.getCustomerId());
//                    loanAccountService.saveLoanTransaction(
//                            loanService.getAccountNumberByLoanId(latePayment.getLoanId(),latePayment.getCustomerId()),
//                            "출금",
//                            BigDecimal.valueOf(totalAmount),
//                            "KRW",
//                            "연체 납부 자동이체",
//                            customerName,
//                            "입출금"
//                    );
//
//                    // 📌 상태 변경 처리
//                    loanService.markLatePaymentAsPaid(latePayment); // loan_late_payment_tbl 상태 변경 or 삭제
//                    loanService.updateInterestPaymentStatusToPaid(latePayment); // loan_interest_payment_tbl 상태 변경
//                    loanService.reduceLoanRemainingTerm(latePayment.getLoanId()); // loan_status_tbl 회차 감소
//
//                    log.info("✅ [연체 납부완료] 고객: {}, 금액: {}", latePayment.getCustomerId(), totalAmount);
//                } catch (Exception e) {
//                    log.warn("❌ [연체 납부실패] 고객: {}, 사유: {}", latePayment.getCustomerId(), e.getMessage());
//                }
//            }
//
//            log.info("🎯 [연체 납부 스케줄러] 전체 처리 완료");
//
//        } catch (Exception e) {
//            log.error("❌ [연체 납부 스케줄러] 실행 오류: {}", e.getMessage());
//        }
//    }

}
