//package com.boot.sound.loan.scheduler;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Component;
//
//import com.boot.sound.inquire.account.AccountService;
//import com.boot.sound.loan.dao.LoanDAO;
//import com.boot.sound.loan.dto.LoanInterestPaymentDTO;
//import com.boot.sound.loan.dto.LoanStatusDTO;
//import com.boot.sound.loan.repo.LoanStatusRepository;
//import com.boot.sound.loan.service.LoanAccountService;
//
//import java.math.BigDecimal;
//import java.math.RoundingMode;
//import java.time.LocalDate;
//import java.time.temporal.ChronoUnit;
//import java.util.Date;
//import java.util.List;
//
//@Component
//@Slf4j
//@RequiredArgsConstructor
//public class LoanRepaymentScheduler {
//
//    private final LoanStatusRepository loanRepo;
//    private final AccountService accountService;
//    private final LoanAccountService loanAccountService;
//    private final LoanDAO loanDAO;
//
//    @Scheduled(cron = "0 17 18 * * ?")
//    public void processRepayments() {
//        LocalDate today = LocalDate.now();
//        String todayDay = String.valueOf(today.getDayOfMonth());
//        List<LoanStatusDTO> loans = loanRepo.findByRepaymentDate(todayDay);
//
//        if (loans.isEmpty()) {
//            log.info("오늘({}) 상환 예정 고객이 없습니다.", todayDay);
//            return;
//        }
//
//        for (LoanStatusDTO loan : loans) {
//            BigDecimal totalPayment = BigDecimal.ZERO;
//            BigDecimal interest = BigDecimal.ZERO;
//            BigDecimal principalPortion = BigDecimal.ZERO;
//
//            try {
//                if (!"승인".equals(loan.getLoanProgress())) {
//                    log.info("승인되지 않은 대출 건 [{}] 제외", loan.getLoanStatusNo());
//                    continue;
//                }
//
//                LocalDate loanDate = loan.getLoanDate().toLocalDate();
//                String repaymentMethod = loan.getRepaymentMethod();
//                BigDecimal principal = new BigDecimal(loan.getLoanAmount());
//                BigDecimal balance = loan.getBalance();
//                BigDecimal annualRate = BigDecimal.valueOf(loan.getInterestRate());
//                BigDecimal monthlyRate = annualRate.divide(BigDecimal.valueOf(12 * 100), 10, RoundingMode.HALF_UP);
//
//                int repaymentDay = Integer.parseInt(loan.getRepaymentDate());
//                LocalDate rawFirstRepayment = loanDate.plusMonths(1)
//                        .withDayOfMonth(Math.min(repaymentDay, loanDate.plusMonths(1).lengthOfMonth()));
//
//                LocalDate firstRepaymentDate = rawFirstRepayment.isBefore(loanDate.plusDays(30))
//                        ? rawFirstRepayment.plusMonths(1)
//                        : rawFirstRepayment;
//
//                boolean isMiddleInterest = today.isAfter(loanDate) && today.isBefore(firstRepaymentDate);
//                boolean isRegularRepayment = today.equals(firstRepaymentDate);
//                
//                log.info("🕐 loanDate: {}, firstRepaymentDate: {}, today: {}", loanDate, firstRepaymentDate, today);
//                log.info("✅ isRegularRepayment: {}, isMiddleInterest: {}", isRegularRepayment, isMiddleInterest);
//
//
//                // ✨ 중도이자 납부 처리
//                if (isMiddleInterest) {
//                    long days = ChronoUnit.DAYS.between(loanDate, today);
//                    BigDecimal dailyRate = annualRate.divide(BigDecimal.valueOf(36500), 10, RoundingMode.HALF_UP);
//                    interest = principal.multiply(dailyRate).multiply(BigDecimal.valueOf(days)).setScale(0, RoundingMode.HALF_UP);
//
//                    try {
//                        accountService.withdraw(loan.getAccountNumber(), interest);
//                        String customerName = loanDAO.selectCustomerName(loan.getCustomerId());
//                        loanAccountService.saveLoanTransaction(
//                                loan.getAccountNumber(), "출금", interest, "KRW", "중도이자 납부", customerName, "입출금"
//                        );
//
//                        LoanInterestPaymentDTO midPayment = new LoanInterestPaymentDTO();
//                        midPayment.setLoanId(loan.getLoanId());
//                        midPayment.setCustomerId(loan.getCustomerId());
//                        midPayment.setRepaymentAmount(interest.intValue());
//                        midPayment.setInterestAmount(interest.intValue());
//                        midPayment.setPrincipalAmount(0);
//                        midPayment.setRepaymentTerm(0);
//                        midPayment.setRepaymentDate(java.sql.Date.valueOf(today));
//                        midPayment.setActualRepaymentDate(new Date());
//                        midPayment.setRepaymentStatus("납부완료");
//                        loanDAO.insertInterestPayment(midPayment);
//
//                        log.info("[중도이자 납부완료] 고객: {}, 일수: {}, 이자: {}", loan.getCustomerId(), days, interest);
//                    } catch (Exception e) {
//                        log.error("[중도이자 납부실패] 고객: {}, 사유: {}", loan.getCustomerId(), e.getMessage());
//
//                        LoanInterestPaymentDTO failedMid = new LoanInterestPaymentDTO();
//                        failedMid.setLoanId(loan.getLoanId());
//                        failedMid.setCustomerId(loan.getCustomerId());
//                        failedMid.setRepaymentAmount(interest.intValue());
//                        failedMid.setInterestAmount(interest.intValue());
//                        failedMid.setPrincipalAmount(0);
//                        failedMid.setRepaymentTerm(0);
//                        failedMid.setRepaymentDate(java.sql.Date.valueOf(today));
//                        failedMid.setActualRepaymentDate(null);
//                        failedMid.setRepaymentStatus("미납");
//                        loanDAO.insertInterestPayment(failedMid);
//                    }
//                    continue;
//                }
//
//                // ✔️ 정기 상환
//                if (!isRegularRepayment) {
//                    log.info("⏭️ 오늘은 정기상환일 아님 - 고객: {}", loan.getCustomerId());
//                    continue;
//                }
//
//                int totalMonths = loan.getLoanTerm();
//                int remainingMonths = loan.getRemainingTerm();
//                if (remainingMonths <= 0 || balance.compareTo(BigDecimal.ZERO) <= 0) continue;
//
//                interest = balance.multiply(monthlyRate).setScale(0, RoundingMode.HALF_UP);
//
//                switch (repaymentMethod) {
//                    case "원리금균등":
//                        BigDecimal factor = monthlyRate.add(BigDecimal.ONE).pow(totalMonths);
//                        totalPayment = principal.multiply(monthlyRate).multiply(factor)
//                                .divide(factor.subtract(BigDecimal.ONE), 10, RoundingMode.HALF_UP)
//                                .setScale(0, RoundingMode.HALF_UP);
//                        principalPortion = totalPayment.subtract(interest).setScale(0, RoundingMode.HALF_UP);
//                        break;
//
//                    case "원금균등":
//                        principalPortion = principal.divide(BigDecimal.valueOf(totalMonths), 10, RoundingMode.HALF_UP)
//                                .setScale(0, RoundingMode.HALF_UP);
//                        interest = balance.multiply(monthlyRate).setScale(0, RoundingMode.HALF_UP);
//                        totalPayment = principalPortion.add(interest).setScale(0, RoundingMode.HALF_UP);
//                        break;
//
//                    case "만기일시":
//                        interest = balance.multiply(monthlyRate).setScale(0, RoundingMode.HALF_UP);
//                        totalPayment = interest;
//                        break;
//
//                    default:
//                        log.warn("❓ 알 수 없는 상환 방식: {}", repaymentMethod);
//                        continue;
//                }
//                
//                
//                
//             // ✅ 회차가 0이면 만기로 상태 변경
//             // 💳 자동 출금
//                accountService.withdraw(loan.getAccountNumber(), totalPayment);
//
//                // 💾 거래 내역 저장
//                String customerName = loanDAO.selectCustomerName(loan.getCustomerId());
//                loanAccountService.saveLoanTransaction(
//                        loan.getAccountNumber(), "출금", totalPayment, "KRW", "정기 상환 자동이체", customerName, "입출금"
//                );
//
//                // 🧾 이자 납부 내역 저장
//                LoanInterestPaymentDTO paymentDTO = new LoanInterestPaymentDTO();
//                paymentDTO.setLoanId(loan.getLoanId());
//                paymentDTO.setCustomerId(loan.getCustomerId());
//                paymentDTO.setRepaymentAmount(totalPayment.intValue());
//                paymentDTO.setInterestAmount(interest.intValue());
//                paymentDTO.setPrincipalAmount(principalPortion.intValue());
//                paymentDTO.setRepaymentTerm(totalMonths - loan.getRemainingTerm() + 1);
//                paymentDTO.setRepaymentDate(java.sql.Date.valueOf(today));
//                paymentDTO.setActualRepaymentDate(new Date());
//                paymentDTO.setRepaymentStatus("납부완료");
//
//                loanDAO.insertInterestPayment(paymentDTO);
//
//                // ✅ 회차 차감 및 잔액 반영
//                BigDecimal newBalance = balance.subtract(principalPortion).max(BigDecimal.ZERO);
//                loan.setBalance(newBalance);
//                loan.setRemainingTerm(remainingMonths - 1);
//
//                // ✅ 회차가 0이면 상태를 만기로 변경
//                if (loan.getRemainingTerm() <= 0) {
//                    loan.setLoanProgress("만기");
//                    log.info("🏁 대출 만기 처리 완료 - 고객: {}, 대출번호: {}", loan.getCustomerId(), loan.getLoanId());
//                }
//
//                // ✅ 최종 저장
//                loanRepo.save(loan);
//
//                // ✅ 로그 출력
//                log.info("✅ [정기상환] 고객: {}, 방식: {}, 납부: {}, 이자: {}, 원금: {}, 잔금: {}, 남은회차: {}",
//                        loan.getCustomerId(), repaymentMethod, totalPayment,
//                        interest, principalPortion, newBalance, loan.getRemainingTerm());
//
//            } catch (Exception e) {
//                log.error("❌ [정기상환 실패] 고객: {}, 사유: {}", loan.getCustomerId(), e.getMessage());
//
//                LoanInterestPaymentDTO failedPayment = new LoanInterestPaymentDTO();
//                failedPayment.setLoanId(loan.getLoanId());
//                failedPayment.setCustomerId(loan.getCustomerId());
//                failedPayment.setRepaymentAmount(totalPayment.intValue());
//                failedPayment.setInterestAmount(interest.intValue());
//                failedPayment.setPrincipalAmount(principalPortion.intValue());
//                failedPayment.setRepaymentTerm(loan.getLoanTerm() - loan.getRemainingTerm() + 1);
//                failedPayment.setRepaymentDate(java.sql.Date.valueOf(today));
//                failedPayment.setActualRepaymentDate(null);
//                failedPayment.setRepaymentStatus("미납");
//
//                loanDAO.insertInterestPayment(failedPayment);
//            }
//        }
//    }
//}