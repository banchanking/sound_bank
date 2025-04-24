package com.boot.sound.fund.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.sound.fund.dto.FundAccountDTO;
import com.boot.sound.fund.dto.FundDTO;
import com.boot.sound.fund.dto.FundTestDTO;
import com.boot.sound.fund.dto.FundTransactionDTO;
import com.boot.sound.fund.repo.FundAccountRepository;
import com.boot.sound.fund.repo.FundRepository;
import com.boot.sound.inquire.account.AccountDTO;
import com.boot.sound.inquire.account.AccountRepository;
import com.boot.sound.inquire.transfer.TransActionDTO;
import com.boot.sound.inquire.transfer.TransActionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor	//  final 필드들을 대상으로 자동으로 생성자(Constructor)를 만들어줌
public class FundServiceImpl {
	
	private final FundRepository fundRepository;	// MyBatis Mapper
	
    private final FundAccountRepository JpaRepository; // JPA Repository
    
    private final PasswordEncoder encoder;
    
    private final AccountRepository accountRepository; // JPA 기반 출금 계좌 레포지토리
    
    private final TransActionRepository transActionRepository; // 거래 로그 저장용
	
	// 펀드상품 목록
	@Transactional(readOnly=true)
	public List<FundDTO> fundList() {
		System.out.println("서비스 - fundList");
        return fundRepository.fundList();
    }
	
	// 펀드상품 등록
	@Transactional
	public int saveFund(FundDTO dto) {
		System.out.println("서비스 - saveFund");
		int result = fundRepository.insertFund(dto);
	    System.out.println("insert 결과: " + result);
	    return result;
	}

	@Transactional
    public void saveRegisteredFunds(List<FundDTO> funds) {
        for (FundDTO fund : funds) {
            fundRepository.insertFund(fund);
        }
    }
	
	// 등록된 펀드 상품 목록 조회
	@Transactional
    public List<FundDTO> getRegisteredFunds() {
        return fundRepository.getRegisteredFunds();
    }
	 
	// 펀드상품 상세
	@Transactional
	public FundDTO fundDetail(Long fund_id) {
		System.out.println("서비스 - fundDetail");
		return fundRepository.findById(fund_id);
	}
	
	// 펀드상품 수정
	@Transactional
	public int updateFund(Long fund_id, FundDTO dto) {
		System.out.println("서비스 - updateFund");
		return fundRepository.updateFund(dto);
	}
	
	// 펀드상품 삭제
	@Transactional
    public void deleteFund(Long fund_id) {
        int rowsAffected = fundRepository.deleteFund(fund_id); // 반환값 처리
        if (rowsAffected == 0) {
            throw new IllegalArgumentException("삭제할 펀드가 존재하지 않습니다.");
        }
    }
	
	// 투자성향 분석 AI 학습 완료된 펀드상품 목록 업데이트
	@Transactional
	public void updateRiskTypes(List<FundDTO> funds) {
	    for (FundDTO fund : funds) {
	    	System.out.println("🔁 업데이트: " + fund.getFundName() + " → " + fund.getFund_risk_type());
	        fundRepository.updateRiskType(fund.getFundName(), fund.getFund_risk_type());
	    }
	}
	
	// 투자 성향 테스트 등록과 업데이트
	@Transactional
	public void saveAndUpdateTest(FundTestDTO test) {
		System.out.println("서비스 - saveAndUpdateTest");
		
		// 1. 투자 성향 테스트 결과 삽입
		fundRepository.insertTestResult(test);
		
		// 2. 고객 정보 업데이트
		fundRepository.updateCustomerRiskType(test.getCustomer_id(),
				test.getFund_risk_type());
		System.out.println("테스트 결과 투자성향" + test.getFund_risk_type());
	}

	// 고객의 투자 성향 조회
	@Transactional(readOnly = true)
	public String getCustomerRiskType(String customer_id) {
		return fundRepository.getCustomerRiskType(customer_id);
	}

	// 고객의 투자 성향에 따른 펀드상품 추천
	@Transactional(readOnly = true)
	public List<FundDTO> getFundsByRiskType(String fund_risk_type) {
		return fundRepository.recommendedFunds(fund_risk_type);
	}
	
    // 펀드 계좌 개설 (JPA) -비밀번호를 검증통과시 해당 비밀번호를 암호화
	public String openFundAccountWithVerification(FundAccountDTO dto, String inputPassword) {

	    // 1. 사용자가 선택한 연동계좌(입출금/예금)의 비밀번호 확인
	    boolean isMatched = checkAccountPassword(dto.getLinkedAccountNumber(), inputPassword);
	    if (!isMatched) {
	        throw new IllegalArgumentException("입력한 계좌 비밀번호가 일치하지 않습니다.");
	    }

	    // 2. 펀드 계좌 비밀번호를 기존 비밀번호로 설정 (단, 반드시 암호화해서 저장)
	    dto.setFundAccountPassword(encoder.encode(inputPassword));

	    // 3. 펀드 계좌 기타 정보 세팅 (계좌번호 생성 등)
	    dto.setFundAccountNumber("FUND-" + System.currentTimeMillis()); // 고유 계좌번호 생성
	    dto.setFundBalance(BigDecimal.ZERO);                             // 초기 잔액 0원
	    dto.setStatus("PENDING");                                        // 관리자 승인 대기
	    dto.setFundOpenDate(LocalDate.now());                            // 개설일자 설정
	    dto.setFundAccountName(dto.getFundAccountName()); 				// 계좌 별칭
	    // 4. JPA를 통해 저장 (fund_account_tbl에 insert)
	    JpaRepository.save(dto);

	    return "펀드 계좌 개설 신청 완료"; // 리액트에서 alert(res.data)
	}
    
    // 고객이 입력한 계좌 비밀번호 일치여부 확인
	public boolean checkAccountPassword(String accountNumber, String inputPassword) {
	    // 1. 해당 계좌의 암호화된 실제 비밀번호 조회 (DB에서 암호화된 값 가져옴)
	    String encodedPwd = fundRepository.findPasswordByAccount(accountNumber);

	    // 2. 사용자가 입력한 평문 비밀번호(inputPassword)와 DB에 저장된 암호화 비밀번호 비교
	    return encodedPwd != null && encoder.matches(inputPassword, encodedPwd);
	}

    // 펀드 계좌 목록 (JPA)
    public List<FundAccountDTO> getFundAccounts(String customerId) {
    	System.out.println("고객 ID: " + customerId);
    	if (customerId == null || customerId.isBlank()) {
            throw new IllegalArgumentException("고객 ID가 유효하지 않습니다.");
        }

    	return JpaRepository.findByCustomerId(customerId);
    }
    
    // 펀드 계좌 개설요청 조회 (JPA)
    public List<FundAccountDTO> getPendingAccounts() {
        return JpaRepository.findByStatus("PENDING");
    }
    
    // 펀드 계좌 개설요청 승인 (JPA)
    @Transactional
    public void updateFundAccountStatus(int fundAccountId, String status) {
        FundAccountDTO account = JpaRepository.findById(fundAccountId)
            .orElseThrow(() -> new IllegalArgumentException("계좌를 찾을 수 없습니다"));
        account.setStatus(status);
        if ("CLOSED".equals(status)) {
            account.setCloseDate(LocalDateTime.now());
        }
        
        account.setStatus(status);  // APPROVED, REJECTED, CLOSED 등 다양하게 활용
        JpaRepository.save(account);
    }
    
    // 펀드 계좌 해지 신청 목록 조회 (status = 'DEACTIVE'인 계좌들만)
    public List<FundAccountDTO> getCloseApplyAccounts() {
        return fundRepository.findDeactiveAccounts();
    }
    
    // 펀드 계좌 해지요청 승인대기 확인 (JPA)
    @Transactional
    public void requestCloseFundAccount(int fundAccountId) {
        FundAccountDTO account = JpaRepository.findById(fundAccountId)
            .orElseThrow(() -> new IllegalArgumentException("해당 계좌가 존재하지 않습니다."));

        account.setStatus("DEACTIVE"); 
        account.setCloseDate(null);   // 날짜는 아직 없음

        JpaRepository.save(account);
    }
    
    // 펀드 계좌 해지요청 승인 (JPA)
    @Transactional
    public void approveCloseFundAccount(int fundAccountId) {
        FundAccountDTO account = JpaRepository.findById(fundAccountId)
            .orElseThrow(() -> new IllegalArgumentException("해당 계좌가 존재하지 않습니다."));

        account.setStatus("CLOSED");
        account.setCloseDate(LocalDateTime.now());

        JpaRepository.save(account);
    }
    
    // 해지 완료된 계좌 목록 조회 (고객용)
    public List<FundAccountDTO> getClosedFundAccounts(String customerId) {
        return fundRepository.findClosedAccountsByCustomerId(customerId);
    }
    
    // 펀드 매수요청
    @Transactional
    public void processTransaction(FundTransactionDTO dto) {
        // 단가 계산
    	if (dto.getFundPricePerUnit() == null && dto.getFundInvestAmount() != null && dto.getFundUnitsPurchased() != null) {
            dto.setFundPricePerUnit(
                dto.getFundInvestAmount().divide(dto.getFundUnitsPurchased(), 6, RoundingMode.HALF_UP)
            );
        }
    	System.out.println("💰 금액: " + dto.getFundInvestAmount());
    	System.out.println("📈 좌수: " + dto.getFundUnitsPurchased());
    	System.out.println("📌 계산된 단가: " + dto.getFundPricePerUnit());

        // 실제 투자 금액 재계산 (단가 × 좌수) → 정확하게 보장
        if (dto.getFundPricePerUnit() != null && dto.getFundUnitsPurchased() != null) {
            dto.setFundInvestAmount(
                dto.getFundPricePerUnit().multiply(dto.getFundUnitsPurchased()).setScale(2, RoundingMode.HALF_UP)
            );
        }

        dto.setFundTransactionDate(LocalDate.now());
        dto.setStatus("PENDING");

        fundRepository.insertFundTransaction(dto);
        System.out.println("✅ 저장 직전 단가: " + dto.getFundPricePerUnit());
        System.out.println("✅ 저장 직전 좌수: " + dto.getFundUnitsPurchased());
    }

    // 펀드 매수요청 관리자 확인
    public List<FundTransactionDTO> getPendingTransactions() {
    	List<FundTransactionDTO> list = fundRepository.findPendingTransactions();
    	
    	for (FundTransactionDTO dto : list) {
            System.out.println("✅ 백엔드에서 가져온 거래 ID: " + dto.getFundTransactionId());
        }
        return list;
    }
        
	// 펀드 매수/환매 승인 시 계좌 잔액 업데이트
    @Transactional
    public void updateTransactionStatus(int fundTransactionId, String status) {
        // 1. 펀드 거래 상태 변경 (PENDING → APPROVED or REJECTED)
        fundRepository.updateStatus(fundTransactionId, status);

        if ("APPROVED".equalsIgnoreCase(status)) {
            // 2. 거래 내역 조회
            FundTransactionDTO tx = fundRepository.findTransactionById(fundTransactionId);

            // 3. 펀드 계좌 조회
            FundAccountDTO fundAccount = JpaRepository.findById(tx.getFundAccountId())
                .orElseThrow(() -> new IllegalArgumentException("펀드 계좌가 존재하지 않습니다"));

            BigDecimal investAmount = tx.getFundInvestAmount();
            System.out.println("🔥 거래 조회 결과: " + tx);

            System.out.println("단가: " + tx.getFundPricePerUnit());
            System.out.println("좌수: " + tx.getFundUnitsPurchased());
            
            // 단가가 null이면 여기서 다시 계산해준다
            if (tx.getFundPricePerUnit() == null && tx.getFundUnitsPurchased() != null && tx.getFundInvestAmount() != null) {
                tx.setFundPricePerUnit(
                    tx.getFundInvestAmount().divide(tx.getFundUnitsPurchased(), 6, RoundingMode.HALF_UP)
                );
            }
            
            String linkedAccountNumber = fundAccount.getLinkedAccountNumber();

            // 4. 고객 출금 계좌 조회
            AccountDTO account = accountRepository.findByAccountNumber(linkedAccountNumber)
                .orElseThrow(() -> new IllegalArgumentException("출금 계좌가 존재하지 않습니다"));

            BigDecimal fundBalance = fundAccount.getFundBalance();

            // 5. 거래 로그 생성용 DTO 생성
            TransActionDTO log = new TransActionDTO();
            log.setAccount_number(linkedAccountNumber);
            log.setAmount(investAmount);
            log.setCurrency("KRW");
            log.setAccount_type("입출금");
            log.setCustomer_name(fundAccount.getCustomerId());
            log.setTransaction_date(new Date()); // 거래 일자 추가

            // 6. 매수 승인 처리 (고객 계좌 → 펀드 계좌 이체)
            if ("BUY".equalsIgnoreCase(tx.getFundTransactionType())) {
                
                // null 체크
                if (tx.getFundPricePerUnit() == null || tx.getFundUnitsPurchased() == null) {
                    throw new IllegalStateException("단가 또는 좌수가 누락되어 처리할 수 없습니다.");
                }

                // 실제 출금할 금액 = 단가 × 좌수
                BigDecimal realAmount = tx.getFundPricePerUnit()
                		.multiply(tx.getFundUnitsPurchased())
                		.setScale(2, RoundingMode.HALF_UP);

                int updated = accountRepository.minusBalance(linkedAccountNumber, realAmount);
                if (updated == 0) {
                    throw new IllegalStateException("출금 계좌 잔액 부족");
                }

                // 펀드 계좌 입금
                fundAccount.setFundBalance(fundBalance.add(realAmount));
                JpaRepository.save(fundAccount);

                // 거래 로그 저장
                log.setTransaction_type("출금");
                log.setComment("펀드 매수");
                log.setAmount(realAmount);  // 실제 출금액 기록
                transActionRepository.save(log);

            // 7. 환매 승인 처리 (펀드 계좌 → 고객 계좌 이체)
            } if ("SELL".equalsIgnoreCase(tx.getFundTransactionType())) {
                if (fundBalance.compareTo(investAmount) < 0) {
                    throw new IllegalStateException("펀드 계좌 잔액 부족");
                }

                // 펀드 계좌 차감
                fundAccount.setFundBalance(fundBalance.subtract(investAmount));
                JpaRepository.save(fundAccount);

                // 고객 계좌 입금
                accountRepository.plusBalance(linkedAccountNumber, investAmount);

                // 거래 로그 저장
                log.setTransaction_type("입금");
                log.setComment("펀드 환매");
                transActionRepository.save(log);
            }
            
        }
    }

    // 사용자 전체 펀드 거래 내역 조회 (매수/환매 포함)
    public List<FundTransactionDTO> getAllTransactions(String customerId) {
        return fundRepository.findAllTransactionsByCustomer(customerId);
    }
    
    // 펀드 매수 확정
    public List<FundTransactionDTO> getApprovedBuys(String customerId) {
        return fundRepository.findApprovedBuys(customerId);
    }
    
    // 펀드 환매
    @Transactional
    public void processSellTransaction(FundTransactionDTO dto) {
        // 1. 단가 계산
        if (dto.getFundInvestAmount() != null && dto.getFundUnitsPurchased() != null) {
            dto.setFundPricePerUnit(
                dto.getFundInvestAmount().divide(dto.getFundUnitsPurchased(), 6, RoundingMode.HALF_UP)
            );
        } else {
            dto.setFundPricePerUnit(BigDecimal.ONE); // fallback
        }

        // 2. 거래일, 상태, 타입
        dto.setFundTransactionDate(LocalDate.now());
        dto.setStatus("PENDING");
        dto.setFundTransactionType("SELL");

        fundRepository.insertFundTransaction(dto);
    }
    
    // 전체 거래내역 처리 (매수/환매 통합)
    @Transactional
    public void processFundTrade(FundTransactionDTO tx) {

        // 공통: fund_name 세팅 (BUY든 SELL이든 상관없이)
        FundDTO fund = fundRepository.findById(Long.valueOf(tx.getFundId()));
        if (fund != null) {
            tx.setFund_name(fund.getFundName());
        }

        if ("BUY".equalsIgnoreCase(tx.getFundTransactionType())) {

            if (tx.getFundUnitsPurchased() == null || tx.getFundInvestAmount() == null) {
                throw new IllegalStateException("좌수 또는 금액이 누락되어 있습니다.");
            }

            BigDecimal fundPricePerUnit = tx.getFundInvestAmount()
                .divide(tx.getFundUnitsPurchased(), 6, RoundingMode.HALF_UP);

            tx.setFundPricePerUnit(fundPricePerUnit);
            tx.setFundTransactionDate(LocalDate.now());
            tx.setStatus("PENDING");

            fundRepository.insertFundTransaction(tx);

        } else if ("SELL".equalsIgnoreCase(tx.getFundTransactionType())) {

            tx.setFundTransactionDate(LocalDate.now());
            tx.setStatus("PENDING");

            if (tx.getFundInvestAmount() != null && tx.getFundUnitsPurchased() != null) {
                tx.setFundPricePerUnit(
                    tx.getFundInvestAmount().divide(tx.getFundUnitsPurchased(), 6, RoundingMode.HALF_UP)
                );
            }

            fundRepository.insertFundTransaction(tx);

        } else {
            throw new IllegalArgumentException("지원하지 않는 거래 타입입니다: " + tx.getFundTransactionType());
        }
    }
    
    
    
}