//package com.boot.sound.loan;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Component;
//
//import com.boot.sound.inquire.account.AccountService;
//import com.boot.sound.loan.dto.LoanStatusDTO;
//import com.boot.sound.loan.repo.LoanStatusRepository;
//
//import java.math.BigDecimal;
//import java.math.RoundingMode;
//import java.time.LocalDate;
//import java.time.temporal.ChronoUnit;
//import java.util.List;
//
//@Component
//@Slf4j
//@RequiredArgsConstructor
//public class LoanRepaymentScheduler {
//
//    private final LoanStatusRepository loanRepo;
//    private final AccountService accountService;
//
//    // 매일 10시에 실행
//    @Scheduled(cron = "0 0 10 * * ?")
//    public void processRepayments() {
//        String todayDay = String.valueOf(LocalDate.now().getDayOfMonth());
//
//        // 🔍 오늘이 상환일인 대출 목록 조회
//        List<LoanStatusDTO> loans = loanRepo.findByRepaymentDate(todayDay);
//
//        if (loans.isEmpty()) {
//            log.info("📭 오늘({}) 상환 예정 고객이 없습니다.", todayDay);
//            return;
//        }
//
//        for (LoanStatusDTO loan : loans) {
//            try {
//                // 🔐 승인된 대출만 처리
//                if (!"승인".equals(loan.getLoanProgress())) {
//                    log.info("🔒 승인되지 않은 대출 건 [{}] 은 납부 처리에서 제외됨", loan.getLoanStatusNo());
//                    continue;
//                }
//
//                LocalDate today = LocalDate.now();
//                LocalDate loanDate = loan.getLoanDate().toLocalDate(); // 대출 실행일
//                String repaymentMethod = loan.getRepaymentMethod();     // 상환 방식
//                BigDecimal principal = new BigDecimal(loan.getLoanAmount()); // 원금
//                BigDecimal balance = loan.getBalance();                 // 현재 잔금
//                BigDecimal annualRate = BigDecimal.valueOf(loan.getInterestRate()); // 연이율 (%)
//                BigDecimal monthlyRate = annualRate.divide(BigDecimal.valueOf(12 * 100), 10, RoundingMode.HALF_UP); // 월 이자율
//
//                // ✅ 첫 달 상환 여부 확인 ( 대출 실행한 달과 현재 달이 1개월 차이날 경우 )
//                LocalDate firstRepaymentMonth = loanDate.plusMonths(1);
//                boolean isFirstPayment = 
//                       firstRepaymentMonth.getYear() == today.getYear() &&
//                       firstRepaymentMonth.getMonth() == today.getMonth();
//
//                // ✅ 정확히 지정된 상환일에 해당하는지 확인
//                boolean isExactRepaymentDate = today.equals(
//                        loanDate.withDayOfMonth(Integer.parseInt(loan.getRepaymentDate())));
//
//                // 💡 첫 달인데 지정된 상환일이 아닌 경우 = 중도이자 납부
//                if (!isExactRepaymentDate && isFirstPayment) {
//                    long days = ChronoUnit.DAYS.between(loanDate, today); // 실제 일수 계산
//                    BigDecimal dailyRate = annualRate.divide(BigDecimal.valueOf(36500), 10, RoundingMode.HALF_UP); // 일 이자율
//                    BigDecimal interest = principal.multiply(dailyRate).multiply(BigDecimal.valueOf(days)).setScale(0, RoundingMode.HALF_UP); // 중도이자 계산
//
//                    accountService.withdraw(loan.getAccountNumber(), interest); // 고객 계좌에서 중도이자 인출
//                    log.info("💰 [중도이자] 고객: {}, 일수: {}, 이자: {}", loan.getCustomerId(), days, interest);
//                    continue;
//                }
//
//                int totalMonths = loan.getLoanTerm(); // 총 회차
//                int remainingMonths = loan.getRemainingTerm(); // 남은 회차
//
//                // 상환 완료 or 잔액 0 이면 스킵
//                if (remainingMonths <= 0 || balance.compareTo(BigDecimal.ZERO) <= 0) continue;
//
//                // 매월 이자 계산
//                BigDecimal interest = balance.multiply(monthlyRate).setScale(0, RoundingMode.HALF_UP);
//                BigDecimal principalPortion = BigDecimal.ZERO; // 이번 달 원금 상환액
//                BigDecimal totalPayment = BigDecimal.ZERO;     // 이번 달 총 납부액
//
//                // 🎯 상환 방식에 따른 처리
//                switch (repaymentMethod) {
//                    case "원리금균등":
//                        // 원리금균등 상환 공식
//                        BigDecimal factor = monthlyRate.add(BigDecimal.ONE).pow(totalMonths);
//                        totalPayment = principal.multiply(monthlyRate).multiply(factor)
//                                .divide(factor.subtract(BigDecimal.ONE), 10, RoundingMode.HALF_UP)
//                                .setScale(0, RoundingMode.HALF_UP); // 월 납부액
//
//                        principalPortion = totalPayment.subtract(interest).setScale(0, RoundingMode.HALF_UP); // 이번달 원금
//                        break;
//
//                    case "원금균등":
//                        principalPortion = principal.divide(BigDecimal.valueOf(totalMonths), 10, RoundingMode.HALF_UP)
//                                .setScale(0, RoundingMode.HALF_UP); // 매월 고정 원금
//                        interest = balance.multiply(monthlyRate).setScale(0, RoundingMode.HALF_UP); // 현재 잔금 기준 이자
//                        totalPayment = principalPortion.add(interest).setScale(0, RoundingMode.HALF_UP); // 총 납부액
//                        break;
//
//                    case "만기일시":
//                        interest = balance.multiply(monthlyRate).setScale(0, RoundingMode.HALF_UP);
//                        totalPayment = interest; // 원금은 만기일에 전액 상환
//                        break;
//
//                    default:
//                        log.warn("알 수 없는 상환방식: {}", repaymentMethod);
//                        continue;
//                }
//
//                // 잔액 업데이트 및 회차 차감
//                BigDecimal newBalance = balance.subtract(principalPortion).max(BigDecimal.ZERO);
//                loan.setBalance(newBalance);
//                loan.setRemainingTerm(remainingMonths - 1); // 회차 감소
//                loanRepo.save(loan); // DB 업데이트
//
//                // 💳 고객 계좌에서 자동이체
//                accountService.withdraw(loan.getAccountNumber(), totalPayment);
//
//                log.info("✅ [정기상환] 고객: {}, 방식: {}, 납부: {}, 이자: {}, 원금: {}, 남은 원금: {}, 남은 회차: {}",
//                        loan.getCustomerId(), repaymentMethod, totalPayment,
//                        interest, principalPortion, newBalance, loan.getRemainingTerm());
//
//            } catch (Exception e) {
//                log.error("❌ 상환 처리 실패 - 고객: {}, 사유: {}", loan.getCustomerId(), e.getMessage());
//            }
//        }
//    }
//}
