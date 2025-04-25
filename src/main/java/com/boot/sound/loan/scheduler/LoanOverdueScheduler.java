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

    private final LoanService loanService; // 대출 관련 비즈니스 로직 처리 서비스
    private final LoanAccountService loanAccountService; // 대출 거래내역 기록 서비스
    private final AccountService accountService; // 계좌 출금 처리 서비스

    // ✅ [1] 미납 내역 자동 납부 스케줄러 - 매일 특정 시각에 실행
    @Scheduled(cron = "0 36 21 * * ?")
    public void processMissedRepayments() {
        log.info("\u23F0 [미납 자동납부 스케줄러] 미납 납부 시도 시작");

        try {
            // 미납 상태인 이자 납부 내역 가져오기
            List<LoanInterestPaymentDTO> missedList = loanService.getMissedPaymentsToRetry();
            System.out.println(loanService.getMissedPaymentsToRetry());
            for (LoanInterestPaymentDTO missed : missedList) {
                if (missed == null) {
                    log.warn("🚫 [미납 스케줄러] null DTO 발견 - 건너뜀");
                    continue;
                }
                try {
                    int amount = missed.getRepaymentAmount();
                    // 해당 고객의 계좌번호 조회
                    String accountNumber = loanService.getAccountNumberByLoanId(missed.getLoanId(), missed.getCustomerId());

                    // 자동 출금 시도
                    accountService.withdraw(accountNumber, BigDecimal.valueOf(amount));

                    // 거래내역 저장
                    String customerName = loanService.getCustomerName(missed.getCustomerId());
                    loanAccountService.saveLoanTransaction(
                            accountNumber, "출금", BigDecimal.valueOf(amount), "KRW", "미납 자동납부", customerName, "입출금"
                    );

                    // 납부 성공 처리 (상태 변경 + 회차 차감)
                    loanService.markInterestPaymentAsPaid(missed.getInterestPaymentNo());
                    loanService.reduceLoanRemainingTerm(missed.getLoanId());

                    log.info("\u2705 [미납 납부완료] 고객: {}, 금액: {}", missed.getCustomerId(), amount);
                } catch (Exception e) {
                    log.warn("\u274C [미납 납부실패] 고객: {}, 사유: {}", missed.getCustomerId(), e.getMessage());
                }
            }

            log.info("\uD83C\uDFC0 [미납 납부 스케줄러] 전체 처리 완료");

        } catch (Exception e) {
            log.error("\u274C [미납 납부 스케줄러] 실행 오류: {}", e.getMessage());
        }
    }

    // ✅ [2] 미납 상태에서 5일이 지나면 '연체'로 전환하는 스케줄러
    @Scheduled(cron = "0 53 19 * * ?")
    public void processOverdueInterestPayments() {
        log.info("\u23F0 [연체 스케줄러] 미납 내역 연체 처리 시작");
        try {
            loanService.processOverduePayments(); // 내부에서 연체 이자 계산 + 상태 변경 처리
            log.info("\u2705 [연체 스케줄러] 연체 처리 완료");
        } catch (Exception e) {
            log.error("\u274C [연체 스케줄러] 연체 처리 중 오류 발생: {}", e.getMessage());
        }
    }

    // ✅ [3] 연체 납부 자동 이체 - 연체 상태 고객의 연체 원금+이자 자동 출금
    @Scheduled(cron = "0 54 19 * * ?") 
    public void processLateRepayments() {
        log.info("\u23F0 [연체 납부 스케줄러] 연체 납부 시도 시작");

        try {
            List<LoanLatePaymentDTO> latePayments = loanService.getLatePayments(); // 연체 중인 고객 목록 조회

            for (LoanLatePaymentDTO latePayment : latePayments) {
                try {
                    int totalAmount = latePayment.getUnpaidAmount() + latePayment.getOverdueInterest();

                    // 출금 시도
                    accountService.withdraw(
                            loanService.getAccountNumberByLoanId(latePayment.getLoanId(), latePayment.getCustomerId()),
                            BigDecimal.valueOf(totalAmount)
                    );

                    // 거래내역 기록
                    String customerName = loanService.getCustomerName(latePayment.getCustomerId());
                    loanAccountService.saveLoanTransaction(
                            loanService.getAccountNumberByLoanId(latePayment.getLoanId(), latePayment.getCustomerId()),
                            "출금",
                            BigDecimal.valueOf(totalAmount),
                            "KRW",
                            "연체 납부 자동이체",
                            customerName,
                            "입출금"
                    );

                    // 상태 변경 처리
                    System.out.println(latePayment);
                    loanService.markLatePaymentAsPaid(latePayment); // 연체테이블 상태 변경 or 삭제
                    loanService.updateInterestPaymentStatusToPaid(latePayment); // 이자납부테이블 상태 갱신
                    loanService.reduceLoanRemainingTerm(latePayment.getLoanId()); // 대출 회차 감소

                    log.info("\u2705 [연체 납부완료] 고객: {}, 금액: {}", latePayment.getCustomerId(), totalAmount);
                } catch (Exception e) {
                    log.warn("\u274C [연체 납부실패] 고객: {}, 사유: {}", latePayment.getCustomerId(), e.getMessage());
                }
            }

            log.info("\uD83C\uDFC0 [연체 납부 스케줄러] 전체 처리 완료");

        } catch (Exception e) {
            log.error("\u274C [연체 납부 스케줄러] 실행 오류: {}", e.getMessage());
        }
    }

}
