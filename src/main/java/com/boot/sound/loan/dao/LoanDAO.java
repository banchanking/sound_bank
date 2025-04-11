package com.boot.sound.loan.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.boot.sound.customer.CustomerDTO;
import com.boot.sound.loan.dto.LoanConsentDTO;
import com.boot.sound.loan.dto.LoanCustomerDTO;
import com.boot.sound.loan.dto.LoanDTO;
import com.boot.sound.loan.dto.LoanStatusDTO;

@Mapper
@Repository
public interface LoanDAO  {

	// 대출 상품 리스트
	public List<LoanDTO> loanList();
	
	// 대출 상품 등록
	public int loanInsert(LoanDTO dto);
	
	// 대출 상품 수정
	public int loanUpdate(LoanDTO dto);
	
	// 대출 상품 삭제
	public int loanDelete(int loan_id);
	
	// 대출 상품 조회
	public LoanDTO loanDetail(int loan_id);
	
	// 전체 대출 상품 갯수
	public int loanCnt();
	
	
	// 대출유형 맞춤 검사
	public List<LoanDTO> loanTypeSearch(String loan_type);
	
	// 대출유형 상품별 갯수
	public int loanTypeCnt(String loan_type);
	
	// 대출이름검색
	public List<LoanDTO> loanNameSearch(String loan_name);
	
	// 대출이름 검색 결과 카운트
	public int loanNameCnt(String loan_name);
	
	// 대출실행 필수동의내역 저장
	public int consentInsert(LoanConsentDTO dto);
	
	// 대출 신청 고객정보
	public LoanCustomerDTO loanCustomer(String customerId, String loan_id);
	
	// 대출 신청정보 저장
	public int loanApply(LoanStatusDTO dto);
	
	// 대출 현황 리스트
	public List<LoanStatusDTO>loanStatus();
	
	// 대출 상태 변경
	public boolean loanStatusUpdate(@Param("loan_status_no") int loan_status_no, 
            @Param("loan_progress") String loan_progress);
	
	// 문자 발송을 위한 고객 정보 조회
	public CustomerDTO selecCustomer(String customerId);
	
}
