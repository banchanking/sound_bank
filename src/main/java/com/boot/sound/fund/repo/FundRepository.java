package com.boot.sound.fund.repo;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.boot.sound.fund.dto.FundDTO;
import com.boot.sound.fund.dto.FundTestDTO;
import com.boot.sound.fund.dto.FundTransactionDTO;
import com.boot.sound.inquire.account.AccountDTO;

@Mapper
public interface FundRepository {

	// 펀드상품 목록
	public List<FundDTO> fundList();
	
	// 펀드상품 등록
	public int insertFund(FundDTO dto);
	
	// 등록된 펀드 상품 목록 조회
	List<FundDTO> getRegisteredFunds();
	
	// 펀드상품 수정
	public int updateFund(FundDTO dto);
	
	// 펀드상품 삭제
    int deleteFund(Long fund_id);
	
	// 펀드상품 1건 조회
	public FundDTO findById(Long fund_id);
	
	// 투자 성향 테스트 결과 등록
	public int insertTestResult(FundTestDTO test);
	
	// 고객 정보에 투자성향 업데이트
	public int updateCustomerRiskType(@Param("customer_id") String customer_id, @Param("fund_risk_type") String fund_risk_type);
	
	// 고객의 투자 성향 조회
	public String getCustomerRiskType(@Param("customer_id") String customerId);

    // 고객의 투자 성향에 맞는 펀드 목록 조회
	public List<FundDTO> recommendedFunds(@Param("fund_risk_type") String fund_risk_type);

    // 투자성향 분석 AI 학습 완료된 펀드상품 목록 업데이트
    public void updateRiskType(@Param("fund_name") String fund_name, 
    					@Param("fund_risk_type") String fund_risk_type);

    // 펀드 거래 등록
    int insertFundTransaction(FundTransactionDTO dto);
    
    // 기존 계좌 비밀번호 조회 (MyBatis)
    String findPasswordByAccount(@Param("account_number") String accountNumber);
    
}
