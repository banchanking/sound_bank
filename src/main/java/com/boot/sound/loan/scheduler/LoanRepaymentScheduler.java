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
//	 private final LoanStatusRepository loanRepo; // 대출 상태 레포지토리
//	    private final AccountService accountService; // 계좌 서비스 (출금 처리)
//	    private final LoanAccountService loanAccountService; // 대출 거래 내역 서비스
//	    private final LoanDAO loanDAO; // DAO를 통한 DB 접근
//
//	    // 매일 오전 11시 35분 30초에 실행되는 스케줄러 (작업 테스트를 위한 임시 적용)
//	    @Scheduled(cron = "45 22 20 * * ?")
//	    public void processRepayments() {
//	        LocalDate today = LocalDate.now(); // 오늘 날짜
//	        String todayDay = String.valueOf(today.getDayOfMonth()); // 상환날짜 비교를 위해 오늘의 일(day)만 추출
//
//	        List<LoanStatusDTO> loans = loanRepo.findByRepaymentDate(todayDay); // 오늘 상환 대상자 조회
//
//	        if (loans.isEmpty()) {
//	            log.info("오늘({}) 상환 예정 고객이 없습니다.", todayDay);
//	            return;
//	        }
//
//	        for (LoanStatusDTO loan : loans) {
//	            BigDecimal totalPayment = BigDecimal.ZERO; // 총 납부금 초기값
//	            BigDecimal interest = BigDecimal.ZERO; // 이자 금액 초기값
//	            BigDecimal principalPortion = BigDecimal.ZERO; // 원금 상환 금액 초기값
//
//	            try {
//	                if (!"승인".equals(loan.getLoanProgress())) {
//	                    log.info("승인되지 않은 대출 건 [{}] 제외 --> 처리 상태:{}", loan.getLoanStatusNo(),loan.getLoanProgress());
//	                    continue;
//	                }
//
//	                LocalDate loanDate = loan.getLoanDate().toLocalDate(); // 대출일
//	                String repaymentMethod = loan.getRepaymentMethod(); // 상환 방식
//	                BigDecimal principal = new BigDecimal(loan.getLoanAmount()); // 대출 원금
//	                BigDecimal balance = loan.getBalance(); // 현재 남은 대출 잔액
//	                BigDecimal annualRate = BigDecimal.valueOf(loan.getInterestRate()); // 연이율
//	                BigDecimal monthlyRate = annualRate.divide(BigDecimal.valueOf(12 * 100), 10, RoundingMode.HALF_UP); // 월 이자율
//
//	                int repaymentDay = Integer.parseInt(loan.getRepaymentDate()); // 지정된 상환일 (일 기준)
//
//	                // 첫 정기 상환일 계산 (30일 룰 포함)
//	                LocalDate rawFirstRepayment = loanDate.plusMonths(1)	// 대출실행일로부터 1개월 뒤를 기준
//	                        // 상환일을 조정함 ex 31일경우 말일이 30일이면 30일로 조정, 2월일 경우 28일로 조정함
//	                		.withDayOfMonth(Math.min(repaymentDay, loanDate.plusMonths(1).lengthOfMonth()));
//	                		
//	                LocalDate firstRepaymentDate = rawFirstRepayment.isBefore(loanDate.plusDays(30)) // 대출 실행일 기준으로 30일이 지낫는지 비교 ( 정기상환일 )
//	                        ? rawFirstRepayment.plusMonths(1)
//	                        : rawFirstRepayment;
//	                
//	                // 일할이자 여부 -- 오늘이 대출 실행일 이후이고 정기상환일 이전일 경우  일할이자 납입으로 판단
//	                boolean isMiddleInterest = today.isAfter(loanDate) && today.isBefore(firstRepaymentDate);  
//	                // 정기상환일 여부	-- 오늘이 정기상환일인지 비교하고 참일시 정기상환일로 판단			
//	                boolean isRegularRepayment = today.equals(firstRepaymentDate);
//
//	                log.info("\uD83D\uDD50 loanDate: {}, firstRepaymentDate: {}, today: {}", loanDate, firstRepaymentDate, today);
//	                log.info("\u2705 isRegularRepayment: {}, isMiddleInterest: {}", isRegularRepayment, isMiddleInterest);
//
//	                // ===== 일할이자 납부 =====
//	                if (isMiddleInterest) {
//	                    long days = ChronoUnit.DAYS.between(loanDate, today); // 대출일로부터 경과 일수
//	                    BigDecimal dailyRate = annualRate.divide(BigDecimal.valueOf(36500), 10, RoundingMode.HALF_UP); // 적용된 연이자율을 기준으로 하루이율 계산
//	                    interest = principal.multiply(dailyRate).multiply(BigDecimal.valueOf(days)).setScale(0, RoundingMode.HALF_UP); // 일할 계산 이자 원금x하루이욜x경과일수
//
//	                    try {
//	                        accountService.withdraw(loan.getAccountNumber(), interest); // 출금 처리
//	                        String customerName = loanDAO.selectCustomerName(loan.getCustomerId());
//	                        loanAccountService.saveLoanTransaction(
//	                                loan.getAccountNumber(), "출금", interest, "KRW", "일할이자 납부", customerName, "입출금"
//	                        );
//
//	                        // 납부 내역 저장
//	                        LoanInterestPaymentDTO midPayment = new LoanInterestPaymentDTO();
//	                        midPayment.setLoanId(loan.getLoanId());
//	                        midPayment.setCustomerId(loan.getCustomerId());
//	                        midPayment.setRepaymentAmount(interest.intValue());
//	                        midPayment.setInterestAmount(interest.intValue());
//	                        midPayment.setPrincipalAmount(0);
//	                        midPayment.setRepaymentTerm(0);
//	                        midPayment.setRepaymentDate(java.sql.Date.valueOf(today));
//	                        midPayment.setActualRepaymentDate(new Date());
//	                        midPayment.setRepaymentStatus("납부완료");
//	                        loanDAO.insertInterestPayment(midPayment);
//
//	                        log.info("[일할이자 납부완료] 고객: {}, 일수: {}, 이자: {}", loan.getCustomerId(), days, interest);
//	                    } catch (Exception e) {
//	                        log.error("[일할이자 납부실패] 고객: {}, 사유: {}", loan.getCustomerId(), e.getMessage());
//	                        LoanInterestPaymentDTO failedMid = new LoanInterestPaymentDTO();
//	                        failedMid.setLoanId(loan.getLoanId());
//	                        failedMid.setCustomerId(loan.getCustomerId());
//	                        failedMid.setRepaymentAmount(interest.intValue());
//	                        failedMid.setInterestAmount(interest.intValue());
//	                        failedMid.setPrincipalAmount(0);
//	                        failedMid.setRepaymentTerm(0);
//	                        failedMid.setRepaymentDate(java.sql.Date.valueOf(today));
//	                        failedMid.setActualRepaymentDate(null);
//	                        failedMid.setRepaymentStatus("미납");
//	                        loanDAO.insertInterestPayment(failedMid);
//	                    }
//	                    continue;
//	                }
//
//	                // ===== 정기 상환 처리 =====
//	                if (!isRegularRepayment) {
//	                    log.info("\u23ED\uFE0F 오늘은 정기상환일 아님 - 고객: {}", loan.getCustomerId());
//	                    continue;
//	                }
//
//	                int totalMonths = loan.getLoanTerm(); // 총 대출 회차
//	                int remainingMonths = loan.getRemainingTerm(); // 남은 상환 회차
//	                if (remainingMonths <= 0 || balance.compareTo(BigDecimal.ZERO) <= 0) continue;
//
//	                // 공통 이자 계산
//	                interest = balance.multiply(monthlyRate).setScale(0, RoundingMode.HALF_UP);
//
//	                switch (repaymentMethod) {
//	                    case "원리금균등":
//	                        BigDecimal factor = monthlyRate.add(BigDecimal.ONE).pow(totalMonths); // 상환계수
//	                        totalPayment = principal.multiply(monthlyRate).multiply(factor)
//	                                .divide(factor.subtract(BigDecimal.ONE), 10, RoundingMode.HALF_UP)
//	                                .setScale(0, RoundingMode.HALF_UP);
//	                        interest = balance.multiply(monthlyRate).setScale(0, RoundingMode.HALF_UP); // 회차 기준 이자
//	                        principalPortion = totalPayment.subtract(interest).setScale(0, RoundingMode.HALF_UP); // 납부액에서 이자 차감한 원금
//	                        break;
//
//	                    case "원금균등":
//	                        principalPortion = principal.divide(BigDecimal.valueOf(totalMonths), 10, RoundingMode.HALF_UP)
//	                                .setScale(0, RoundingMode.HALF_UP); // 동일 원금 분할
//	                        interest = balance.multiply(monthlyRate).setScale(0, RoundingMode.HALF_UP);
//	                        totalPayment = principalPortion.add(interest).setScale(0, RoundingMode.HALF_UP); // 원금 + 이자
//	                        break;
//
//	                    case "만기일시":
//	                        interest = balance.multiply(monthlyRate).setScale(0, RoundingMode.HALF_UP); // 이자만 납부
//	                        totalPayment = interest;
//	                        break;
//
//	                    default:
//	                        log.warn("\u2753 알 수 없는 상환 방식: {}", repaymentMethod);
//	                        continue;
//	                }
//
//	                accountService.withdraw(loan.getAccountNumber(), totalPayment); // 출금 실행
//
//	                String customerName = loanDAO.selectCustomerName(loan.getCustomerId());
//	                loanAccountService.saveLoanTransaction(
//	                        loan.getAccountNumber(), "출금", totalPayment, "KRW", "정기 상환 자동이체", customerName, "입출금"
//	                );
//
//	                LoanInterestPaymentDTO paymentDTO = new LoanInterestPaymentDTO();
//	                paymentDTO.setLoanId(loan.getLoanId());
//	                paymentDTO.setCustomerId(loan.getCustomerId());
//	                paymentDTO.setRepaymentAmount(totalPayment.intValue());
//	                paymentDTO.setInterestAmount(interest.intValue());
//	                paymentDTO.setPrincipalAmount(principalPortion.intValue());
//	                paymentDTO.setRepaymentTerm(totalMonths - loan.getRemainingTerm() + 1); // 현재 회차 계산
//	                paymentDTO.setRepaymentDate(java.sql.Date.valueOf(today));
//	                paymentDTO.setActualRepaymentDate(new Date());
//	                paymentDTO.setRepaymentStatus("납부완료");
//	                loanDAO.insertInterestPayment(paymentDTO);
//
//	                BigDecimal newBalance = balance.subtract(principalPortion).max(BigDecimal.ZERO); // 잔금 차감
//	                loan.setBalance(newBalance);
//	                loan.setRemainingTerm(remainingMonths - 1); // 회차 차감
//
//	                if (loan.getRemainingTerm() <= 0) {
//	                    loan.setLoanProgress("만기");
//	                    log.info("\uD83C\uDFC1 대출 만기 처리 완료 - 고객: {}, 대출번호: {}", loan.getCustomerId(), loan.getLoanId());
//	                }
//
//	                loanRepo.save(loan);
//
//	                log.info("\u2705 [정기상환] 고객: {}, 방식: {}, 납부: {}, 이자: {}, 원금: {}, 잔금: {}, 남은회차: {}",
//	                        loan.getCustomerId(), repaymentMethod, totalPayment,
//	                        interest, principalPortion, newBalance, loan.getRemainingTerm());
//
//	            } catch (Exception e) {
//	                log.error("\u274C [정기상환 실패] 고객: {}, 사유: {}", loan.getCustomerId(), e.getMessage());
//
//	                LoanInterestPaymentDTO failedPayment = new LoanInterestPaymentDTO();
//	                failedPayment.setLoanId(loan.getLoanId());
//	                failedPayment.setCustomerId(loan.getCustomerId());
//	                failedPayment.setRepaymentAmount(totalPayment.intValue());
//	                failedPayment.setInterestAmount(interest.intValue());
//	                failedPayment.setPrincipalAmount(principalPortion.intValue());
//	                failedPayment.setRepaymentTerm(loan.getLoanTerm() - loan.getRemainingTerm() + 1);
//	                failedPayment.setRepaymentDate(java.sql.Date.valueOf(today));
//	                failedPayment.setActualRepaymentDate(null);
//	                failedPayment.setRepaymentStatus("미납");
//
//	                loanDAO.insertInterestPayment(failedPayment);
//	            }
//	        }
//	    }
//	}
