package com.boot.sound.fund.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.sound.fund.dto.FundAccountDTO;
import com.boot.sound.fund.dto.FundDTO;
import com.boot.sound.fund.dto.FundTestDTO;
import com.boot.sound.fund.dto.FundTransactionDTO;
import com.boot.sound.fund.repo.FundAccountRepository;
import com.boot.sound.fund.repo.FundRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor	//  final 필드들을 대상으로 자동으로 생성자(Constructor)를 만들어줌
public class FundServiceImpl {
	
	private final FundRepository fundRepository;	// MyBatis Mapper
	
    private final FundAccountRepository JpaRepository; // JPA Repository
    
    private final PasswordEncoder encoder;
	
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
	    	System.out.println("🔁 업데이트: " + fund.getFund_name() + " → " + fund.getFund_risk_type());
	        fundRepository.updateRiskType(fund.getFund_name(), fund.getFund_risk_type());
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
	    dto.setFundAccountName(dto.getFundAccountName()); 									// 계좌 별칭
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
    	System.out.println("조회 요청 받은 customerId: " + customerId);
        return JpaRepository.findByCustomerId(customerId);
    }
    
    // 펀드 매수
    @Transactional
    public void processTransaction(FundTransactionDTO dto) {
        // 단가 계산: 예시로 1원 = 1단위 (나중에 시세 API 연동 가능)
        BigDecimal unitPrice = BigDecimal.ONE;
        BigDecimal units = dto.getFundInvestAmount() != null
        		? dto.getFundInvestAmount().divide(unitPrice, 6, RoundingMode.DOWN)
        		: dto.getFundUnitsPurchased();        		

        dto.setFundUnitsPurchased(units);
        dto.setFundPricePerUnit(unitPrice);
        dto.setFundTransactionDate(LocalDate.now());
        dto.setStatus("APPROVED");

        fundRepository.insertFundTransaction(dto);
    }
    

    

}
