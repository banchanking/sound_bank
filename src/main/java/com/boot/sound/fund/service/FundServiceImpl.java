package com.boot.sound.fund.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.sound.fund.dto.FundAccountDTO;
import com.boot.sound.fund.dto.FundDTO;
import com.boot.sound.fund.dto.FundTestDTO;
import com.boot.sound.fund.repo.FundAccountRepository;
import com.boot.sound.fund.repo.FundRepository;

@Service
public class FundServiceImpl {
	
	@Autowired
	private FundRepository fundRepository;	// MyBatis Mapper
	
	@Autowired
    private FundAccountRepository JpaRepository; // JPA Repository
	
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
	
    // 펀드 계좌 개설 (JPA)
    public void openFundAccount(FundAccountDTO dto) {
        dto.setFundAccountNumber("FUND-" + System.currentTimeMillis());
        dto.setFundBalance(BigDecimal.ZERO);
        dto.setStatus("PENDING");
        dto.setFundOpenDate(LocalDate.now());

        JpaRepository.save(dto); // JPA 방식으로 저장
    }

    // 펀드 계좌 목록 (JPA)
    public List<FundAccountDTO> getFundAccounts(String customerId) {
    	System.out.println("조회 요청 받은 customerId: " + customerId);
        return JpaRepository.findByCustomerId(customerId);
    }
    

}
